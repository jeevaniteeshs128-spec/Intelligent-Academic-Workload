const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const toDate = (value) => new Date(`${value}T12:00:00`)
const day = (value) => dayNames[toDate(value).getDay()]
const iso = (date) => date.toISOString().slice(0, 10)

export function priorityScore(task, today = new Date()) {
  const days = Math.max(0, Math.ceil((toDate(task.dueDate) - today) / 86400000))
  const urgency = Math.max(0, 12 - days)
  const remaining = Math.max(0, Number(task.estimatedHours) - Number(task.actualHours || 0))
  return urgency * 4 + Number(task.importance) * 3 + Number(task.complexity) * 2 + remaining
}

function availableSlots(date, settings) {
  const current = settings.availability?.[day(iso(date))] || []
  const [start, end] = current
  if (start === undefined) return []
  return Array.from({ length: Math.max(0, Math.floor((end - start) * 2)) }, (_, index) => start + index * 0.5)
}

export function generateSchedule({ tasks, settings, from = new Date(), days = 7 }) {
  const sessions = [], blocked = new Map(), occupied = new Map()
  const eligible = tasks.filter((task) => task.status !== 'done').sort((a, b) => priorityScore(b, from) - priorityScore(a, from))
  const ordered = []
  const addWithDependencies = (task, seen = new Set()) => { if (seen.has(task.id)) return; seen.add(task.id); (task.dependencies || []).map((id) => tasks.find((item) => item.id === id)).filter(Boolean).forEach((dep) => { if (dep.status !== 'done') addWithDependencies(dep, seen) }); if (!ordered.includes(task)) ordered.push(task) }
  eligible.forEach((task) => addWithDependencies(task))

  for (const task of ordered) {
    let remaining = Math.max(0, Number(task.estimatedHours) - Number(task.actualHours || 0))
    const deadline = toDate(task.dueDate)
    for (let offset = 0; offset < days && remaining > 0; offset++) {
      const date = new Date(from); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + offset)
      if (date > deadline) break
      const key = iso(date); const used = blocked.get(key) || 0
      const slots = availableSlots(date, settings).filter((start) => !(settings.fixedCommitments || []).some((fixed) => fixed.day === day(key) && start < fixed.end && start + 0.5 > fixed.start) && !(occupied.get(key) || new Set()).has(start))
      const capacity = Math.min(Number(settings.dailyLimit || 3) - used, slots.length * 0.5)
      let assign = Math.min(remaining, Math.max(0, capacity))
      while (assign > 0) {
        const hours = Math.min(1, assign); const start = slots.shift(); if (start === undefined) break
        sessions.push({ id: `session-${task.id}-${key}-${start}`, taskId: task.id, date: key, start, duration: hours, status: 'planned', reason: `Prioritized for ${task.dueDate}: ${task.importance}/5 importance and ${Math.ceil(remaining)}h remaining.` })
        remaining -= hours; assign -= hours; blocked.set(key, (blocked.get(key) || 0) + hours); (occupied.get(key) || occupied.set(key, new Set()).get(key)).add(start)
      }
    }
    if (remaining > 0) sessions.push({ id: `risk-${task.id}`, taskId: task.id, date: task.dueDate, start: null, duration: remaining, status: 'at-risk', reason: `Not enough available time before ${task.dueDate}. Needs ${remaining}h more.` })
  }
  return sessions
}

export function replan({ tasks, settings, existingSessions = [], today = new Date() }) {
  const preserved = existingSessions.filter((session) => session.status === 'completed' || session.date < iso(today) || session.status === 'locked')
  const openTasks = tasks.map((task) => ({ ...task, actualHours: Number(task.actualHours || 0) + existingSessions.filter((session) => session.taskId === task.id && session.status === 'completed').reduce((sum, session) => sum + Number(session.duration), 0) }))
  return [...preserved, ...generateSchedule({ tasks: openTasks, settings, from: today })]
}

export { day }
