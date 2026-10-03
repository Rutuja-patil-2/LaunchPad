import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  Code,
  Briefcase,
  Calculator,
  HelpCircle,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  Lightbulb,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { aiStudyAssistant } from '../services/apiClient'

// Helper for rendering syntax-highlighted code block with Copy button
const CodeSnippet = ({ language, code }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shadow-md text-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-slate-300 font-mono border-b border-slate-700">
        <span className="text-[11px] font-semibold uppercase text-purple-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-slate-700"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-slate-100 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// Custom Markdown formatter component
const MarkdownViewer = ({ content }) => {
  if (!content) return null

  // Split code blocks from regular text
  const parts = content.split(/(```[\s\S]*?```)/g)

  const renderInline = (str, keyPrefix = '') => {
    const tokens = str.split(/(\*\*.*?\*\*|`.*?`)/g)
    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={`${keyPrefix}-${i}`} className="font-semibold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        )
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={`${keyPrefix}-${i}`}
            className="bg-purple-50 text-purple-700 font-mono text-[11px] px-1.5 py-0.5 rounded border border-purple-100"
          >
            {token.slice(1, -1)}
          </code>
        )
      }
      return token
    })
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n')
          let language = ''
          let code = ''
          if (lines.length > 0 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
            language = lines[0].trim()
            code = lines.slice(1).join('\n')
          } else {
            code = lines.join('\n')
          }
          return <CodeSnippet key={index} language={language} code={code} />
        }

        // Render regular lines
        const lines = part.split('\n')
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim()
              if (!trimmed) {
                return <div key={lIdx} className="h-1" />
              }

              // Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="font-bold text-slate-900 text-sm mt-2 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    {renderInline(trimmed.replace('### ', ''), `h3-${lIdx}`)}
                  </h4>
                )
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="font-bold text-slate-900 text-base mt-2.5 mb-1 text-brand-600">
                    {renderInline(trimmed.replace('## ', ''), `h2-${lIdx}`)}
                  </h3>
                )
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="font-extrabold text-slate-900 text-lg mt-3 mb-1.5">
                    {renderInline(trimmed.replace('# ', ''), `h1-${lIdx}`)}
                  </h2>
                )
              }

              // Bullet list
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-brand-500 font-bold mt-1 text-xs">•</span>
                    <span className="flex-1">{renderInline(trimmed.slice(2), `bullet-${lIdx}`)}</span>
                  </div>
                )
              }

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-semibold text-brand-600 text-xs mt-0.5 min-w-[18px]">
                      {numMatch[1]}.
                    </span>
                    <span className="flex-1">{renderInline(numMatch[2], `num-${lIdx}`)}</span>
                  </div>
                )
              }

              return <p key={lIdx}>{renderInline(line, `p-${lIdx}`)}</p>
            })}
          </div>
        )
      })}
    </div>
  )
}

const STUDY_MODES = [
  { id: 'study', label: 'All-Round Study', icon: BookOpen },
  { id: 'code', label: 'DSA & Coding', icon: Code },
  { id: 'interview', label: 'Interview Prep', icon: Briefcase },
  { id: 'aptitude', label: 'Aptitude Tricks', icon: Calculator },
  { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle }
]

const QUICK_STARTERS = [
  {
    topic: 'DSA & Coding',
    icon: Code,
    color: 'from-blue-500 to-indigo-600',
    questions: [
      'Explain QuickSort vs MergeSort with time complexity',
      'Top 5 dynamic programming patterns for coding rounds',
      'Explain Binary Search and its boundary conditions with code'
    ]
  },
  {
    topic: 'Core CS Subjects',
    icon: GraduationCap,
    color: 'from-purple-500 to-pink-600',
    questions: [
      'Explain the 4 Pillars of OOP with real-world examples',
      'What are ACID properties in DBMS with banking examples?',
      'Explain the difference between Process and Thread in OS'
    ]
  },
  {
    topic: 'Placement & HR',
    icon: Briefcase,
    color: 'from-emerald-500 to-teal-600',
    questions: [
      "How to answer 'Tell me about yourself' for campus placements?",
      'Common technical interview questions for TCS & Infosys',
      'How to explain my project architecture effectively?'
    ]
  },
  {
    topic: 'Aptitude & Formulas',
    icon: Calculator,
    color: 'from-amber-500 to-orange-600',
    questions: [
      'Shortcuts to solve Time & Work problems quickly',
      'Speed, Distance, and Time tricks for aptitude tests',
      'Generate a 14-day study plan for placement preparation'
    ]
  }
]

export const StudyChatbot = ({
  user,
  variant = 'embedded', // 'embedded' | 'floating'
  onClose,
  initialOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeMode, setActiveMode] = useState('study')
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const studentName = user?.first_name || user?.username || 'Student'

  const initialGreeting = {
    role: 'assistant',
    content: `Hi **${studentName}**! 👋 I'm your **Launchpad Study AI** mentor powered by Google Gemini.\n\nI can help you master **Data Structures, core CS subjects, aptitude shortcuts, company-specific interview questions (TCS, Infosys, etc.)**, or design a **custom study plan**.\n\nWhat would you like to prepare today? Choose a suggestion below or type any topic!`,
    suggestions: [
      'Explain QuickSort vs MergeSort with time complexity',
      'What are ACID properties in DBMS with examples?',
      'Top interview questions for campus placements',
      'Generate a 14-day placement preparation roadmap'
    ]
  }

  const [messages, setMessages] = useState([initialGreeting])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || isLoading) return

    const userMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      // Prepare conversation history (exclude initial intro greeting if it's the only one)
      const historyPayload = updatedMessages
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await aiStudyAssistant.sendMessage({
        message: text,
        history: historyPayload,
        mode: activeMode,
        student_context: {
          name: studentName,
          branch: user?.branch || user?.department || ''
        }
      })

      const data = response.data
      const aiReply = {
        role: 'assistant',
        content: data.reply || 'Here is your study guide for this topic.',
        suggestions: data.suggestions || []
      }

      setMessages((prev) => [...prev, aiReply])
    } catch (err) {
      console.error('AI Study Assistant error:', err)
      const errorMessage =
        err?.response?.data?.reply ||
        err?.response?.data?.error ||
        "I'm having a brief issue reaching the AI study server. Please verify your connection or try again."

      setError(errorMessage)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Connection Note:**\n\n${errorMessage}\n\n*Quick Study Tip:* Practice writing simple SQL queries and reviewing sorting algorithms while I reconnect!`,
          suggestions: [
            'Explain Binary Search with code',
            'Common HR interview questions',
            'Time and Work problem shortcuts'
          ]
        }
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat session refreshed! What topic would you like to study next, **${studentName}**?`,
        suggestions: [
          'Top 5 dynamic programming patterns for coding rounds',
          'Explain the 4 Pillars of OOP with examples',
          'How to solve Time & Work aptitude problems',
          'Tell me about yourself - sample answer'
        ]
      }
    ])
    setError(null)
  }

  // =========================================================================
  // EMBEDDED VIEW (RENDERED ON DASHBOARD AS A HIGH-VALUE STUDY HUB)
  // =========================================================================
  if (variant === 'embedded') {
    return (
      <div className="rounded-2xl border border-purple-100 bg-white shadow-xl overflow-hidden transition-all duration-300">
        {/* TOP GRADIENT HEADER */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 px-6 py-4 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg text-white">AI Study Companion</h2>
                  <span className="text-[10px] font-semibold tracking-wider uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-xs text-purple-100">
                  Your 24/7 placement prep tutor for DSA, Core Subjects, Aptitude & Interviews
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
                title="Start new study session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Session</span>
              </button>
            </div>
          </div>

          {/* STUDY MODE SELECTOR PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar border-t border-white/10 mt-3">
            <span className="text-[11px] text-purple-200 font-medium mr-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" /> Mode:
            </span>
            {STUDY_MODES.map((mode) => {
              const Icon = mode.icon
              const isActive = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-purple-700 shadow-md font-semibold'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {mode.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* CHAT MESSAGES BODY */}
        <div className="h-[460px] overflow-y-auto p-5 bg-gradient-to-b from-slate-50/50 to-white space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-brand-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <MarkdownViewer content={msg.content} />

                    {/* FOLLOW-UP SUGGESTIONS */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-500" /> Next questions:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              disabled={isLoading}
                              className="text-xs text-left bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors flex items-center gap-1 group"
                            >
                              <span>{sug}</span>
                              <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm mt-0.5">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
          ))}

          {/* LOADING INDICATOR */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-brand-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-xs p-3.5 shadow-sm flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></span>
                  <span
                    className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></span>
                  <span
                    className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  ></span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Launchpad Study AI is thinking...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK QUESTION STARTER CARDS (Only when messages <= 1) */}
        {messages.length <= 1 && (
          <div className="px-5 py-3 bg-purple-50/50 border-t border-purple-100">
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Popular Placement Questions — Click to ask:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_STARTERS.flatMap((cat) =>
                cat.questions.slice(0, 1).map((q, idx) => (
                  <button
                    key={`${cat.topic}-${idx}`}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="p-2 text-left bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg text-xs text-slate-700 transition-all flex items-start gap-2 shadow-xs group"
                  >
                    <cat.icon className="w-3.5 h-3.5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 line-clamp-1">{q}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all mt-0.5" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* INPUT FORM */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask any question about DSA, DBMS, Aptitude, or Placement prep...`}
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all disabled:opacity-60 bg-slate-50/50"
              />
              <span className="absolute right-3 top-3 text-[10px] text-slate-400 font-mono hidden sm:inline">
                ↵ Enter
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Active model: Gemini 3.8 Flash
            </span>
            <span>Tailored for campus recruitment</span>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // FLOATING WIDGET (FAB + POPUP DRAWER)
  // =========================================================================
  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 text-white shadow-2xl hover:shadow-purple-500/30 transition-all font-semibold text-sm group border-2 border-white/40"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>
          <span>Study AI Assistant</span>
          <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        </motion.button>
      )}

      {/* FLOATING CHAT DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white flex flex-col transition-all duration-300 ${
              isExpanded
                ? 'bottom-4 right-4 left-4 top-4 md:left-auto md:w-[750px] md:h-[90vh]'
                : 'bottom-4 right-4 w-[92vw] sm:w-[420px] h-[580px]'
            }`}
          >
            {/* FLOATING HEADER */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-brand-600 px-4 py-3 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Launchpad Study AI
                    <span className="text-[9px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.2 rounded">
                      Gemini
                    </span>
                  </h3>
                  <p className="text-[11px] text-purple-200">Study & Placement Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden sm:block"
                  title={isExpanded ? 'Restore size' : 'Expand window'}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MODE SELECTION BAR */}
            <div className="px-3 py-1.5 bg-purple-50 border-b border-purple-100 flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
              {STUDY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    activeMode === mode.id
                      ? 'bg-purple-600 text-white font-semibold shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-purple-100 border border-slate-200'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* MESSAGES SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-7 h-7 rounded-md bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div>
                        <MarkdownViewer content={msg.content} />

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">
                              Suggestions:
                            </p>
                            <div className="flex flex-col gap-1">
                              {msg.suggestions.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => handleSendMessage(sug)}
                                  disabled={isLoading}
                                  className="text-left text-[11px] text-purple-700 bg-purple-50 hover:bg-purple-100 p-1.5 rounded border border-purple-100 transition-colors"
                                >
                                  → {sug}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-[11px] mt-0.5">
                      {studentName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-purple-100 w-fit">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  <span>Generating study answer...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT FOOTER */}
            <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask study question..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default StudyChatbot
