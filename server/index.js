import express from 'express'
import cors from 'cors'
import { loadStore, saveStore, id } from './store.js'
import { generateSchedule, replan } from './scheduler.js'
import { extractCandidates } from './parser.js'

export const app = express()
app.use(cors()); app.use(express.json({ limit: '2mb' }))
const required = (body, fields) => fields.filter((field) => body[field] === undefined || body[field] === '')

app.get('/api/bootstrap', async (_, res) => { const data = await loadStore(); res.json(data) })
app.post('/api/tasks', async (req, res) => { const missing = required(req.body, ['title', 'courseId', 'dueDate', 'estimatedHours']); if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` }); const data = await loadStore(); const task = { id: id('task'), actualHours: 0, importance: 3, complexity: 3, status: 'todo', dependencies: [], notes: '', ...req.body, estimatedHours: Number(req.body.estimatedHours) }; data.tasks.push(task); await saveStore(data); res.status(201).json(task) })
app.patch('/api/tasks/:id', async (req, res) => { const data = await loadStore(); const task = data.tasks.find((item) => item.id === req.params.id); if (!task) return res.status(404).json({ error: 'Task not found' }); Object.assign(task, req.body); await saveStore(data); res.json(task) })
app.delete('/api/tasks/:id', async (req, res) => { const data = await loadStore(); data.tasks = data.tasks.filter((task) => task.id !== req.params.id); data.sessions = data.sessions.filter((session) => session.taskId !== req.params.id); await saveStore(data); res.status(204).end() })
app.post('/api/schedule/generate', async (_, res) => { const data = await loadStore(); data.sessions = generateSchedule({ tasks: data.tasks, settings: data.settings }); await saveStore(data); res.json(data.sessions) })
app.post('/api/schedule/replan', async (_, res) => { const data = await loadStore(); data.sessions = replan({ tasks: data.tasks, settings: data.settings, existingSessions: data.sessions }); await saveStore(data); res.json(data.sessions) })
app.patch('/api/sessions/:id', async (req, res) => { const data = await loadStore(); const session = data.sessions.find((item) => item.id === req.params.id); if (!session) return res.status(404).json({ error: 'Session not found' }); Object.assign(session, req.body); await saveStore(data); res.json(session) })
app.post('/api/import/preview', async (req, res) => { if (!req.body.text) return res.status(400).json({ error: 'Paste syllabus or assignment text to import.' }); res.json({ candidates: extractCandidates(req.body.text), source: 'deterministic-text-parser' }) })
app.post('/api/import/confirm', async (req, res) => { const data = await loadStore(); const created = (req.body.candidates || []).map((candidate) => ({ id: id('task'), courseId: data.courses[0]?.id || '', actualHours: 0, status: 'todo', dependencies: [], notes: 'Imported and confirmed', ...candidate })); data.tasks.push(...created); await saveStore(data); res.status(201).json(created) })
app.put('/api/settings', async (req, res) => { const data = await loadStore(); data.settings = { ...data.settings, ...req.body }; await saveStore(data); res.json(data.settings) })
app.get('/api/analytics', async (_, res) => { const data = await loadStore(); const total = data.tasks.reduce((sum, task) => sum + Number(task.estimatedHours), 0); const done = data.tasks.filter((task) => task.status === 'done').length; const planned = data.sessions.filter((session) => session.status === 'planned').reduce((sum, session) => sum + Number(session.duration), 0); const actual = data.tasks.reduce((sum, task) => sum + Number(task.actualHours || 0), 0); const overloadedDays = Object.entries(data.sessions.reduce((map, session) => { if (session.status !== 'at-risk') map[session.date] = (map[session.date] || 0) + Number(session.duration); return map }, {})).filter(([, hours]) => hours > data.settings.dailyLimit).map(([date, hours]) => ({ date, hours })); res.json({ totalHours: total, completedTasks: done, taskCount: data.tasks.length, plannedHours: planned, actualHours: actual, completion: data.tasks.length ? Math.round(done / data.tasks.length * 100) : 0, overloadedDays, risks: data.sessions.filter((session) => session.status === 'at-risk') }) })

if (process.env.NODE_ENV !== 'test') app.listen(process.env.PORT || 4000, () => console.log('StudySync API running on http://localhost:4000'))
