export function extractCandidates(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const datePattern = /(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/
  return lines.map((line, index) => {
    const match = line.match(datePattern); if (!match) return null
    const normalized = match[1].includes('-') && match[1].length === 10 ? match[1] : new Date(match[1]).toISOString().slice(0, 10)
    return { id: `candidate-${index}`, title: line.replace(match[0], '').replace(/[:\-–]+$/, '').trim() || `Imported assignment ${index + 1}`, dueDate: normalized, estimatedHours: 2, importance: 3, complexity: 3 }
  }).filter(Boolean)
}
