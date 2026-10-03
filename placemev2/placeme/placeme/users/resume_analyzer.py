import re
from collections import Counter

STOPWORDS = {
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
    'boy', 'did', 'she', 'use', 'her', 'many', 'than', 'them', 'then',
    'this', 'that', 'with', 'have', 'from', 'they', 'will', 'would',
    'there', 'their', 'what', 'about', 'which', 'when', 'make', 'like',
    'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your',
    'good', 'some', 'could', 'them', 'other', 'after', 'first', 'well',
    'also', 'where', 'much', 'should', 'through', 'work', 'working',
    'role', 'team', 'company', 'including', 'ability', 'skills',
    'experience', 'years', 'required', 'preferred', 'responsibilities',
    'qualifications', 'description', 'position', 'candidate', 'must',
    'able', 'using', 'used', 'such', 'within', 'across', 'based',
}

SECTION_PATTERNS = {
    'education': re.compile(
        r'\b(education|academic|degree|university|college|b\.?tech|bachelor|master)\b',
        re.I,
    ),
    'experience': re.compile(
        r'\b(experience|employment|work history|internship|professional)\b',
        re.I,
    ),
    'skills': re.compile(
        r'\b(skills|technical skills|technologies|competencies|expertise)\b',
        re.I,
    ),
    'projects': re.compile(
        r'\b(projects|project experience|portfolio)\b',
        re.I,
    ),
    'summary': re.compile(
        r'\b(summary|profile|objective|about me)\b',
        re.I,
    ),
}


def extract_text_from_pdf(file_obj):
    from pypdf import PdfReader

    reader = PdfReader(file_obj)
    parts = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)

    return '\n'.join(parts)


def extract_text_from_docx(file_obj):
    from docx import Document

    document = Document(file_obj)
    return '\n'.join(
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    )


def extract_text_from_file(uploaded_file):
    name = (uploaded_file.name or '').lower()

    if name.endswith('.pdf'):
        return extract_text_from_pdf(uploaded_file)

    if name.endswith('.docx'):
        return extract_text_from_docx(uploaded_file)

    if name.endswith('.doc'):
        raise ValueError(
            'Legacy .doc files are not supported. '
            'Please upload PDF or DOCX.'
        )

    raise ValueError(
        'Unsupported file type. Upload PDF or DOCX.'
    )


def tokenize(text):
    words = re.findall(
        r'\b[a-z][a-z0-9+#.-]{2,}\b',
        text.lower(),
    )

    return [
        word
        for word in words
        if word not in STOPWORDS and len(word) > 2
    ]


def extract_jd_keywords(jd_text, limit=30):
    tokens = tokenize(jd_text)
    frequency = Counter(tokens)

    keywords = []

    for word, count in frequency.most_common(limit * 2):
        if count >= 1 and word not in keywords:
            keywords.append(word)

        if len(keywords) >= limit:
            break

    return keywords


def detect_sections(resume_text):
    return {
        name: bool(pattern.search(resume_text))
        for name, pattern in SECTION_PATTERNS.items()
    }


def build_suggestions(
    missing_keywords,
    sections,
    resume_text,
    word_count,
    keyword_score,
):
    suggestions = []

    for keyword in missing_keywords[:10]:
        suggestions.append({
            'type': 'keyword',
            'priority': 'high',
            'message': (
                f"Add the keyword \"{keyword}\" — "
                f"it appears in the job description "
                f"but not in your resume."
            ),
        })

    section_labels = {
        'education': 'Education',
        'experience': 'Experience',
        'skills': 'Skills',
        'projects': 'Projects',
        'summary': 'Professional Summary',
    }

    for key, label in section_labels.items():
        if not sections.get(key):
            suggestions.append({
                'type': 'section',
                'priority': 'medium',
                'message': (
                    f"Add a clear \"{label}\" section "
                    f"with a standard heading."
                ),
            })

    if not re.search(
        r'[\w.-]+@[\w.-]+\.\w+',
        resume_text,
    ):
        suggestions.append({
            'type': 'contact',
            'priority': 'high',
            'message': (
                'Include a professional email address '
                'at the top of your resume.'
            ),
        })

    if not re.search(
        r'\+?\d[\d\s.-]{8,}\d',
        resume_text,
    ):
        suggestions.append({
            'type': 'contact',
            'priority': 'medium',
            'message': (
                'Add a phone number so recruiters '
                'can reach you easily.'
            ),
        })

    if word_count < 250:
        suggestions.append({
            'type': 'length',
            'priority': 'medium',
            'message': (
                'Your resume looks short. Add more '
                'detail about projects, skills, and impact.'
            ),
        })
    elif word_count > 1000:
        suggestions.append({
            'type': 'length',
            'priority': 'medium',
            'message': (
                'Resume may be too long for ATS. '
                'Aim for 1–2 pages (about 400–800 words).'
            ),
        })

    if keyword_score < 50:
        suggestions.append({
            'type': 'general',
            'priority': 'high',
            'message': (
                'Tailor your resume to this job: mirror '
                'important terms from the description in '
                'your skills and experience bullets.'
            ),
        })

    if not suggestions:
        suggestions.append({
            'type': 'general',
            'priority': 'low',
            'message': (
                'Strong match! Proofread once more and '
                'quantify achievements with numbers where possible.'
            ),
        })

    return suggestions


def analyze_resume(resume_text, job_description):
    resume_clean = resume_text.strip()
    jd_clean = job_description.strip()

    resume_lower = resume_clean.lower()
    jd_keywords = extract_jd_keywords(jd_clean)

    resume_token_set = set(tokenize(resume_lower))

    matched_keywords = [
        keyword
        for keyword in jd_keywords
        if keyword in resume_token_set
        or keyword in resume_lower
    ]

    missing_keywords = [
        keyword
        for keyword in jd_keywords
        if keyword not in matched_keywords
    ]

    if jd_keywords:
        keyword_score = round(
            (len(matched_keywords) / len(jd_keywords)) * 100
        )
    else:
        keyword_score = 50

    sections = detect_sections(resume_clean)
    sections_found = [
        name
        for name, found in sections.items()
        if found
    ]
    section_score = round(
        (len(sections_found) / len(sections)) * 100
    )

    has_email = bool(
        re.search(
            r'[\w.-]+@[\w.-]+\.\w+',
            resume_clean,
        )
    )
    has_phone = bool(
        re.search(
            r'\+?\d[\d\s.-]{8,}\d',
            resume_clean,
        )
    )
    contact_score = (50 if has_email else 0) + (
        50 if has_phone else 0
    )

    word_count = len(resume_clean.split())

    if 300 <= word_count <= 900:
        length_score = 100
    elif word_count < 300:
        length_score = max(40, 60 + word_count // 10)
    else:
        length_score = max(50, 100 - (word_count - 900) // 20)

    formatting_score = 85
    if resume_clean.count('|') > 5:
        formatting_score -= 15
    if resume_clean.count('\t') > 10:
        formatting_score -= 10

    overall_score = round(
        keyword_score * 0.45
        + section_score * 0.25
        + contact_score * 0.15
        + length_score * 0.10
        + formatting_score * 0.05
    )
    overall_score = max(0, min(100, overall_score))

    suggestions = build_suggestions(
        missing_keywords,
        sections,
        resume_clean,
        word_count,
        keyword_score,
    )

    if overall_score >= 80:
        grade = 'Excellent'
    elif overall_score >= 65:
        grade = 'Good'
    elif overall_score >= 50:
        grade = 'Fair'
    else:
        grade = 'Needs work'

    return {
        'score': overall_score,
        'grade': grade,
        'breakdown': {
            'keyword_match': keyword_score,
            'sections': section_score,
            'contact_info': contact_score,
            'length': length_score,
            'formatting': formatting_score,
        },
        'matched_keywords': matched_keywords,
        'missing_keywords': missing_keywords,
        'sections_found': sections_found,
        'word_count': word_count,
        'suggestions': suggestions,
    }
