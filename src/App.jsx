// src/App.jsx

import { useState, useRef } from 'react'
import './App.css'
import { generateContentFromText } from './services/groqApi'

// Komponenti për Summary View
function SummaryView({ summary, onCopy }) {
  return (
    <div className="summary-view">
      <div className="view-header">
        <h2>{summary.title}</h2>
        <button onClick={() => onCopy(summary.fullSummary, 'Summary')} className="copy-btn">
          📋 Kopjo Summary
        </button>
      </div>
      <div className="key-points">
        <h3>📌 Pikat Kryesore:</h3>
        <ul>
          {summary.keyPoints?.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="full-summary">
        <h3>📖 Përmbledhja e Plotë:</h3>
        <p>{summary.fullSummary}</p>
      </div>
    </div>
  )
}

// Komponenti për Quiz View
function QuizView({ quiz, onCopy }) {
  return (
    <div className="quiz-view">
      <div className="view-header">
        <h2>📋 Quiz - Testo Veten!</h2>
        <button onClick={() => onCopy(JSON.stringify(quiz, null, 2), 'Quiz')} className="copy-btn">
          📋 Kopjo Quiz
        </button>
      </div>
      {quiz.questions?.map((q, idx) => (
        <div key={idx} className="quiz-question">
          <p className="question-text">
            <strong>{idx + 1}. {q.question}</strong>
          </p>
          <div className="options">
            {q.options?.map((opt, optIdx) => (
              <label key={optIdx} className="option">
                <input type="radio" name={`q${idx}`} value={opt} />
                {opt}
              </label>
            ))}
          </div>
          <details className="answer-hint">
            <summary>🔍 Shiko përgjigjen</summary>
            <p><strong>Përgjigja e saktë:</strong> {q.correctAnswer}</p>
            <p><strong>Shpjegimi:</strong> {q.explanation}</p>
          </details>
        </div>
      ))}
    </div>
  )
}

// Komponenti për Escape Room View
function EscapeRoomView({ escapeRoom, onCopy }) {
  return (
    <div className="escape-view">
      <div className="view-header">
        <h2>🎮 {escapeRoom.theme}</h2>
        <button onClick={() => onCopy(escapeRoom.backstory, 'Escape Room Story')} className="copy-btn">
          📋 Kopjo Story
        </button>
      </div>
      <p className="backstory">{escapeRoom.backstory}</p>
      <div className="puzzles">
        <h3>🔐 Zgjidh enigmat për të shpëtuar:</h3>
        {escapeRoom.puzzles?.map((puzzle, idx) => (
          <div key={idx} className="puzzle">
            <p className="puzzle-question">
              <strong>Enigma {idx + 1}:</strong> {puzzle.question}
            </p>
            <div className="puzzle-options">
              {puzzle.options?.map((opt, optIdx) => (
                <label key={optIdx} className="puzzle-option">
                  <input type="radio" name={`puzzle${idx}`} value={opt} />
                  {opt}
                </label>
              ))}
            </div>
            <details className="puzzle-answer">
              <summary>🔑 Shiko përgjigjen</summary>
              <p><strong>Përgjigja e saktë:</strong> {puzzle.correctAnswer}</p>
            </details>
          </div>
        ))}
      </div>
      {escapeRoom.successMessage && (
        <div className="success-message">
          🎉 {escapeRoom.successMessage}
        </div>
      )}
    </div>
  )
}

function App() {
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [escapeRoom, setEscapeRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('summary')
  const [charCount, setCharCount] = useState(0)
  const [copiedMessage, setCopiedMessage] = useState('')
  
  // Për të parandaluar double submit
  const isSubmitting = useRef(false)

  const MAX_CHARS = 8000

  const handleTextChange = (e) => {
    const text = e.target.value
    setInputText(text)
    setCharCount(text.length)
    
    // Pastro error kur fillon të shkruan
    if (error) setError('')
  }

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '\n\n[...Teksti është prerë për shkak të gjatësisë...]'
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedMessage(`✅ ${type} u kopjua në clipboard!`)
    setTimeout(() => setCopiedMessage(''), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ========== EDGE CASE 1: INPUT BOSH ==========
    if (!inputText.trim()) {
      setError('⚠️ Ju lutem shkruani ose ngjisni një tekst përpara se të dërgoni.')
      return
    }
    
    // ========== EDGE CASE 2: INPUT SHUMË I GJATË ==========
    if (inputText.length > MAX_CHARS) {
      setError(`⚠️ Teksti është shumë i gjatë (${inputText.length} karaktere). Maksimumi është ${MAX_CHARS} karaktere. Teksti do të pritet automatikisht.`)
    }
    
    // ========== EDGE CASE 3: PARANDALO DOUBLE SUBMIT ==========
    if (isSubmitting.current) {
      setError('⚠️ Ju tashmë keni dërguar një kërkesë. Ju lutem pritni të përfundojë.')
      return
    }

    // Pastro error-in e mëparshëm dhe rezultatet
    setError('')
    setSummary(null)
    setQuiz(null)
    setEscapeRoom(null)
    setIsLoading(true)
    isSubmitting.current = true

    // Prit tekstin nëse është shumë i gjatë
    const textToSend = truncateText(inputText, MAX_CHARS)

    try {
      const result = await generateContentFromText(textToSend)
      
      setSummary(result.summary)
      setQuiz(result.quiz)
      setEscapeRoom(result.escapeRoom)
      
    } catch (err) {
      // ========== EDGE CASE 4: API FAILURE / NETWORK ERROR ==========
      console.error('API Error:', err)
      
      if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
        setError('🌐 Gabim lidhjeje! Kontrolloni internetin tuaj dhe provoni përsëri.')
      } else if (err.message.includes('429') || err.message.includes('rate')) {
        setError('⏳ Shumë kërkesa në një kohë! Ju lutem prisni 30 sekonda dhe provoni përsëri.')
      } else if (err.message.includes('API key') || err.message.includes('401') || err.message.includes('403')) {
        setError('🔑 Problem me autentifikimin e API. Kontaktoni mbështetjen.')
      } else if (err.message.includes('timed out') || err.message.includes('timeout')) {
        setError('⏰ Kërkesa zgjati shumë. Provoni përsëri me një tekst më të shkurtër.')
      } else {
        setError(`❌ ${err.message || 'Ndodhi një gabim. Ju lutem provoni përsëri.'}`)
      }
    } finally {
      setIsLoading(false)
      isSubmitting.current = false
    }
  }

  const clearAll = () => {
    setInputText('')
    setCharCount(0)
    setError('')
    setSummary(null)
    setQuiz(null)
    setEscapeRoom(null)
    setCopiedMessage('')
  }

  return (
    <div className="container">
      <div className="ai-card">
        <div className="header">
          <h1>📚 AI Study Assistant Pro</h1>
          <p className="subtitle">Ngjisni tekstin tuaj për Summary, Quiz dhe Escape Room Game</p>
        </div>

        <div className="content">
          <form onSubmit={handleSubmit} className="ai-form">
            <div className="input-group">
              <textarea
                className="ai-textarea"
                value={inputText}
                onChange={handleTextChange}
                placeholder="Ngjisni tekstin tuaj këtu (nga PDF, artikull, ose shënime)..."
                disabled={isLoading}
                rows={6}
              />
              <div className="input-footer">
                <span className={`char-counter ${charCount > MAX_CHARS ? 'warning' : ''}`}>
                  {charCount} / {MAX_CHARS} karaktere
                  {charCount > MAX_CHARS && ' (Tejkalim!)'}
                </span>
                <div className="button-group">
                  {inputText && !isLoading && (
                    <button type="button" className="clear-button" onClick={clearAll}>
                      🗑️ Pastro
                    </button>
                  )}
                  <button type="submit" className="ai-button" disabled={isLoading}>
                    {isLoading ? '⏳ Duke përpunuar...' : '✨ Gjenero'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <div className="spinner-container">
                <div className="spinner"></div>
                <p className="loading-text">
                  AI po analizon tekstin tuaj
                  <span className="dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </p>
                <p className="loading-hint">Kjo mund të zgjasë deri në 30 sekonda</p>
              </div>
            </div>
          )}

          {/* Copy Success Message */}
          {copiedMessage && (
            <div className="copy-success">
              <span>📋</span> {copiedMessage}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <p className="error-message">{error}</p>
                {error.includes('shumë i gjatë') && (
                  <button className="error-action" onClick={() => {
                    const truncated = inputText.slice(0, MAX_CHARS)
                    setInputText(truncated)
                    setCharCount(truncated.length)
                    setError('')
                  }}>
                    📝 Prit tekstin automatikisht
                  </button>
                )}
                {error.includes('provoni përsëri') && (
                  <button className="error-action" onClick={() => handleSubmit(new Event('submit'))}>
                    🔄 Provo përsëri
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {summary && !isLoading && (
            <div className="result-container">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  📝 Summary
                </button>
                <button 
                  className={`tab ${activeTab === 'quiz' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quiz')}
                >
                  ❓ Quiz ({quiz?.questions?.length || 0})
                </button>
                <button 
                  className={`tab ${activeTab === 'escape' ? 'active' : ''}`}
                  onClick={() => setActiveTab('escape')}
                >
                  🎮 Escape Room
                </button>
              </div>

              {activeTab === 'summary' && summary && (
                <SummaryView summary={summary} onCopy={copyToClipboard} />
              )}

              {activeTab === 'quiz' && quiz && (
                <QuizView quiz={quiz} onCopy={copyToClipboard} />
              )}

              {activeTab === 'escape' && escapeRoom && (
                <EscapeRoomView escapeRoom={escapeRoom} onCopy={copyToClipboard} />
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !summary && !error && (
            <div className="empty-state">
              <div className="empty-icon">📖✨</div>
              <p>Ngjisni një tekst dhe klikoni "Gjenero"</p>
              <p className="empty-hint">AI do të krijojë përmbledhje, kuize dhe lojëra për të mësuar më lehtë!</p>
            </div>
          )}
        </div>

        <div className="footer">
          <p>Powered by Groq AI | 4+ Edge Cases Protected | Copy to Clipboard | No Crashes</p>
        </div>
      </div>
    </div>
  )
}

export default App