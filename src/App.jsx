// src/App.jsx
// AI Study Assistant - Projekti i 4 UI: Summary, Quiz dhe Escape Room Game

import { useState } from 'react'
import './App.css'
import { generateContentFromText } from './services/groqApi'

function App() {
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [escapeRoom, setEscapeRoom] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('summary')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputText.trim()) {
      setError('Ju lutem shkruani ose ngjisni një tekst.')
      return
    }

    setIsLoading(true)
    setError('')
    setSummary(null)
    setQuiz(null)
    setEscapeRoom(null)

    try {
      const result = await generateContentFromText(inputText)
      setSummary(result.summary)
      setQuiz(result.quiz)
      setEscapeRoom(result.escapeRoom)
    } catch (err) {
      setError(err.message || 'Ndodhi një gabim. Ju lutem provoni përsëri.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="ai-card">
        <div className="header">
          <h1>📚 AI Study Assistant</h1>
          <p className="subtitle">Ngjisni tekstin tuaj për Summary, Quiz dhe Escape Room Game</p>
        </div>

        <div className="content">
          <form onSubmit={handleSubmit} className="ai-form">
            <div className="input-group">
              <textarea
                className="ai-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ngjisni tekstin tuaj këtu (nga PDF, artikull, ose shënime)..."
                disabled={isLoading}
                rows={6}
              />
              <button type="submit" className="ai-button" disabled={isLoading}>
                {isLoading ? '⏳ Duke përpunuar...' : '✨ Gjenero'}
              </button>
            </div>
          </form>

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
              </div>
            </div>
          )}

          {error && (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p className="error-message">{error}</p>
            </div>
          )}

          {summary && (
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
                  ❓ Quiz
                </button>
                <button 
                  className={`tab ${activeTab === 'escape' ? 'active' : ''}`}
                  onClick={() => setActiveTab('escape')}
                >
                  🎮 Escape Room
                </button>
              </div>

              {activeTab === 'summary' && summary && (
                <div className="summary-view">
                  <h2>{summary.title}</h2>
                  <div className="key-points">
                    <h3>📌 Key Points:</h3>
                    <ul>
                      {summary.keyPoints?.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="full-summary">
                    <h3>📖 Full Summary:</h3>
                    <p>{summary.fullSummary}</p>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && quiz && (
                <div className="quiz-view">
                  <h2>📋 Multiple Choice Quiz</h2>
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
              )}

              {activeTab === 'escape' && escapeRoom && (
                <div className="escape-view">
                  <div className="escape-header">
                    <h2>🎮 {escapeRoom.theme}</h2>
                    <p className="backstory">{escapeRoom.backstory}</p>
                  </div>
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
              )}
            </div>
          )}

          {!isLoading && !summary && !error && (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <p>Ngjisni një tekst dhe klikoni "Gjenero" për të marrë summary, quiz dhe escape room game</p>
            </div>
          )}
        </div>

        <div className="footer">
          <p>Powered by Groq AI | Study Smarter with Games</p>
        </div>
      </div>
    </div>
  )
}

export default App