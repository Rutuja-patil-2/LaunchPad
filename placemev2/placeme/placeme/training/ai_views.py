import logging
import os
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from google import genai
from google.genai import types

from .models import Enrollment

logger = logging.getLogger(__name__)

# Predefined study categories and quick starter questions
DEFAULT_STUDY_SUGGESTIONS = [
    {
        "category": "DSA & Coding",
        "icon": "Code",
        "questions": [
            "Explain QuickSort vs MergeSort with time complexity",
            "How do I find a cycle in a Linked List (Floyd's algorithm)?",
            "What are the top 5 dynamic programming patterns for coding rounds?",
            "Explain Binary Search and its boundary conditions with code"
        ]
    },
    {
        "category": "Core CS & Tech",
        "icon": "Cpu",
        "questions": [
            "Explain the 4 Pillars of OOP with real-world examples",
            "What are ACID properties in DBMS with banking examples?",
            "Explain the difference between Process and Thread in OS",
            "How does HTTPS handshake work step-by-step?"
        ]
    },
    {
        "category": "Placement & Interview",
        "icon": "Briefcase",
        "questions": [
            "How should I answer 'Tell me about yourself' for campus placements?",
            "What technical topics should I prepare for TCS & Infosys?",
            "How do I explain my final year project to an interviewer?",
            "What are common behavioral questions asked in HR rounds?"
        ]
    },
    {
        "category": "Aptitude & Reasoning",
        "icon": "Calculator",
        "questions": [
            "Shortcuts to solve Time & Work problems quickly",
            "Speed, Distance, and Time tricks for aptitude tests",
            "How to approach Blood Relations and Direction reasoning questions",
            "Permutations vs Combinations with simple formulas"
        ]
    },
    {
        "category": "Study Roadmaps",
        "icon": "Calendar",
        "questions": [
            "Generate a 14-day study plan for campus placement preparation",
            "What should a 3rd/4th year engineering student focus on each week?",
            "Checklist of must-know SQL queries before technical interviews"
        ]
    }
]


def _build_system_instruction(user, mode='study'):
    """Generate dynamic system instructions incorporating student context."""
    user_context_parts = []

    if user and user.is_authenticated:
        student_name = user.first_name or user.username
        user_context_parts.append(f"Student Name: {student_name}")

        # Check for profile details
        department = getattr(user, 'department', None) or getattr(user, 'branch', None)
        if department:
            user_context_parts.append(f"Branch/Department: {department}")

        try:
            enrollments = Enrollment.objects.filter(student=user).select_related('course')[:5]
            if enrollments.exists():
                course_titles = [e.course.title for e in enrollments if e.course]
                if course_titles:
                    user_context_parts.append(f"Enrolled Courses: {', '.join(course_titles)}")
        except Exception:
            pass

    context_str = "\n".join(user_context_parts) if user_context_parts else "Student: College student preparing for campus recruitment."

    mode_guidance = {
        'code': "Focus heavily on clean, well-commented code implementations, edge-case analysis, and Big-O time/space complexity.",
        'interview': "Focus on interview questions, structured responses (STAR method for behavioral, clear design for technical), and common pitfalls.",
        'aptitude': "Focus on step-by-step mathematical problem solving, shortcuts, time-saving tricks, and formula sheets.",
        'quiz': "Present short, interactive quiz questions with multiple choice options, followed by explanations after the student answers.",
        'study': "Provide clear, foundational explanations with intuitive analogies, diagrams in ASCII or bullet lists, and summary takeaways."
    }.get(mode, "Provide comprehensive, friendly study support for campus placements.")

    return f"""You are "Launchpad Study AI", a friendly, encouraging, and highly knowledgeable study companion and campus placement mentor for college students on the Launchpad Placement Portal.

STUDENT PROFILE CONTEXT:
{context_str}

ACTIVE STUDY MODE: {mode.upper()}
{mode_guidance}

KEY GUIDELINES:
1. Academic & Placement Excellence: Help students master Data Structures & Algorithms (DSA), Object-Oriented Programming (OOP), Database Management Systems (DBMS), Operating Systems (OS), Computer Networks (CN), Quantitative Aptitude, Logical Reasoning, and Interview Preparation.
2. Structured & Readable: Always use clear Markdown formatting. Use bolding for key terms, bullet points for lists, and neat headers (###) to separate sections.
3. Code Quality: When sharing code, use syntax-highlighted blocks (```python, ```java, ```cpp, ```sql, ```javascript) with concise inline comments explaining the logic. Always state Time Complexity and Space Complexity.
4. Pedagogical Approach: Explain *why* something works, not just *what* it is. Use intuitive analogies when introducing complex concepts.
5. Interactive & Supportive: Keep answers comprehensive yet focused. At the end of answers, optionally suggest 1-2 interesting follow-up questions, practice exercises, or next steps to test their understanding.
6. Tone: Professional, warm, motivating, and constructive. Encourage the student to build confidence for placement exams and interviews.
"""


def _generate_fallback_suggestions(message, reply):
    """Generate quick contextual follow-up suggestions."""
    msg_lower = (message or "").lower()
    if any(k in msg_lower for k in ['sort', 'tree', 'graph', 'array', 'dsa', 'leetcode', 'search', 'hash']):
        return [
            "Show me a practice problem on this topic",
            "What is the Time & Space Complexity?",
            "Can you provide the Python code for this?"
        ]
    elif any(k in msg_lower for k in ['interview', 'hr', 'tcs', 'infosys', 'resume', 'round', 'hiring']):
        return [
            "What are common mistakes students make in this round?",
            "Give me a sample answer for an interview",
            "Can you conduct a mock technical interview question?"
        ]
    elif any(k in msg_lower for k in ['aptitude', 'math', 'work', 'time', 'speed', 'profit', 'probability']):
        return [
            "Give me a shortcut or trick to solve this faster",
            "Give me a practice question to test myself",
            "Explain another variation of this problem"
        ]
    elif any(k in msg_lower for k in ['dbms', 'sql', 'os', 'network', 'oop', 'acid']):
        return [
            "What are the most common interview questions on this?",
            "Can you provide a real-world project example?",
            "Explain this in simpler terms"
        ]
    return [
        "Can you explain with a real-world example?",
        "Give me a practice question to test my understanding",
        "What are the top placement interview questions on this?"
    ]


class StudyAssistantChatView(APIView):
    """
    AI Study Assistant View.
    Endpoints:
      - GET: Returns study categories, starter suggestions, and assistant status.
      - POST: Processes student query with Gemini 3.8 Flash and returns smart study advice.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        """Returns study categories, starter suggestions, and assistant readiness status."""
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
        has_key = bool(api_key and len(api_key.strip()) > 5)

        student_name = "Student"
        if request.user and request.user.is_authenticated:
            student_name = request.user.first_name or request.user.username

        return Response({
            "status": "ready" if has_key else "needs_configuration",
            "assistant_name": "Launchpad Study AI",
            "model": "gemini-3.8-flash",
            "student_name": student_name,
            "categories": DEFAULT_STUDY_SUGGESTIONS,
            "modes": [
                {"id": "study", "name": "General Study", "icon": "BookOpen"},
                {"id": "code", "name": "DSA & Coding", "icon": "Code"},
                {"id": "interview", "name": "Placement Interview", "icon": "Briefcase"},
                {"id": "aptitude", "name": "Aptitude Tricks", "icon": "Calculator"},
                {"id": "quiz", "name": "Interactive Quiz", "icon": "HelpCircle"}
            ]
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Receives { message, history, mode, topic } and returns AI study response.
        """
        message = request.data.get('message', '').strip()
        if not message:
            return Response(
                {"error": "Please provide a question or message to ask the study assistant."},
                status=status.HTTP_400_BAD_REQUEST
            )

        history = request.data.get('history', [])
        mode = request.data.get('mode', 'study')

        # Retrieve API key
        api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.environ.get('GEMINI_API_KEY', '')
        if not api_key:
            return Response({
                "reply": (
                    "**Welcome to Launchpad Study AI!**\n\n"
                    "The study assistant is ready, but the Gemini API key is not currently configured in the environment. "
                    "Please ensure `GEMINI_API_KEY` is set in your `.env` file.\n\n"
                    "💡 *Quick Study Tip:* While connecting, make sure to practice core Data Structures (Arrays, Linked Lists, Trees) "
                    "and review your final year project architecture for upcoming placement drives!"
                ),
                "suggestions": [
                    "What are the top DSA topics for placements?",
                    "How to prepare for campus recruitment?"
                ],
                "status": "missing_api_key"
            }, status=status.HTTP_200_OK)

        try:
            # Build student-tailored system instructions
            system_instruction = _build_system_instruction(request.user, mode=mode)

            # Initialize google-genai Client
            client = genai.Client(api_key=api_key.strip())

            # Format history for multi-turn chat (limit to recent 10 turns to keep prompt focused)
            recent_history = history[-10:] if isinstance(history, list) else []
            formatted_contents = []

            for turn in recent_history:
                if not isinstance(turn, dict):
                    continue
                role_val = turn.get('role', 'user')
                # Map roles: 'assistant' or 'model' -> 'model', 'user' -> 'user'
                target_role = 'user' if role_val in ['user', 'student'] else 'model'
                text_content = turn.get('content') or turn.get('text') or ''
                if text_content and text_content.strip():
                    formatted_contents.append(
                        types.Content(
                            role=target_role,
                            parts=[types.Part.from_text(text=text_content.strip())]
                        )
                    )

            # Attempt generation with gemini-3.8-flash, fallback to gemini-3.5-flash-lite if high demand
            used_model = 'gemini-3.8-flash'
            response = None

            try:
                chat = client.chats.create(
                    model='gemini-3.8-flash',
                    history=formatted_contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        max_output_tokens=2048,
                    )
                )
                response = chat.send_message(message)
            except Exception as model_err:
                logger.warning("Primary model gemini-3.8-flash encountered %s, trying gemini-3.5-flash-lite fallback", str(model_err))
                used_model = 'gemini-3.5-flash-lite'
                chat = client.chats.create(
                    model='gemini-3.5-flash-lite',
                    history=formatted_contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.7,
                        max_output_tokens=2048,
                    )
                )
                response = chat.send_message(message)

            reply_text = response.text if response and response.text else "I've processed your question, but didn't receive a response text. Please try rephrasing."

            # Generate contextual follow-up study suggestions
            suggestions = _generate_fallback_suggestions(message, reply_text)

            return Response({
                "reply": reply_text,
                "suggestions": suggestions,
                "status": "success",
                "model": used_model
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("Error in StudyAssistantChatView: %s", str(e))
            error_str = str(e)

            # Friendly, non-breaking fallback message
            fallback_reply = (
                f"### 💡 Study Assistant Note\n\n"
                f"I encountered a temporary connection issue while communicating with the AI service ({error_str[:120]}).\n\n"
                f"**Here's a quick placement study tip for you:**\n"
                f"- **Data Structures**: Focus on Two Pointers, Sliding Window, and BFS/DFS traversal.\n"
                f"- **DBMS**: Be ready to write subqueries, `GROUP BY`, `HAVING`, and explain indexing.\n"
                f"- **Behavioral**: Prepare 2-3 stories demonstrating problem solving and teamwork using the STAR technique.\n\n"
                f"Please try submitting your question again in a moment!"
            )

            return Response({
                "reply": fallback_reply,
                "suggestions": [
                    "What are the top 5 dynamic programming patterns?",
                    "How to prepare for campus placement interviews?",
                    "Shortcuts for Time & Work problems"
                ],
                "status": "error_fallback",
                "detail": error_str
            }, status=status.HTTP_200_OK)
