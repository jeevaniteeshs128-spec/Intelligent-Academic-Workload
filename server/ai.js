const systemPrompt = `You are StudySync AI, an academic workload planning assistant.
Return concise, actionable advice grounded only in the supplied student data.
Use short headings and bullets. Never claim to have scheduled or modified data.
If the request is ambiguous, state the assumption before answering.`

export function buildPlanningPrompt(data, userMessage) {
  const tasks = (data.tasks || []).map((task) => ({
    title: task.title,
    dueDate: task.dueDate,
    remainingHours: Math.max(0, Number(task.estimatedHours) - Number(task.actualHours || 0)),
    importance: task.importance,
    status: task.status,
    dependencies: task.dependencies || []
  }))
  return [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: `Planning context JSON:\n${JSON.stringify({ tasks, settings: data.settings, sessions: data.sessions })}` },
    { role: 'user', content: userMessage || 'Explain the current workload risks and suggest the next three actions.' }
  ]
}

export async function createPlanningAdvice(data, userMessage) {
  const apiUrl = process.env.LLM_API_URL
  const apiKey = process.env.LLM_API_KEY
  if (!apiUrl || !apiKey) {
    const error = new Error('LLM_API_URL and LLM_API_KEY are required.')
    error.status = 503
    throw error
  }
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: buildPlanningPrompt(data, userMessage),
      temperature: 0.2
    })
  })
  if (!response.ok) throw new Error(`LLM provider returned ${response.status}: ${await response.text()}`)
  const result = await response.json()
  return result.choices?.[0]?.message?.content || ''
}
