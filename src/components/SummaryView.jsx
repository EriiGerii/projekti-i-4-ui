function SummaryView({ summary }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }
  
  return (
    <div className="summary-view">
      <h2>{summary.title}</h2>
      <div className="key-points">
        <h3>📌 Pikat Kryesore:</h3>
        <ul>{summary.keyPoints?.map((point, i) => <li key={i}>{point}</li>)}</ul>
      </div>
      <div className="full-summary">
        <h3>📖 Përmbledhja e Plotë:</h3>
        <p>{summary.fullSummary}</p>
      </div>
      <button onClick={() => copyToClipboard(summary.fullSummary)} className="copy-btn">
        📋 Kopjo Summary
      </button>
    </div>
  )
}
export default SummaryView