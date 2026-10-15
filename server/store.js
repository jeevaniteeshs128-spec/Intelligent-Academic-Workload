import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const file = path.join(process.cwd(), 'data', 'studysync.json')
const seed = {
  settings: { dailyLimit: 3, availability: { Mon: [18, 21], Tue: [18, 21], Wed: [16, 21], Thu: [18, 21], Fri: [15, 19], Sat: [10, 16], Sun: [12, 17] }, fixedCommitments: [{ day: 'Mon', start: 19, end: 20, label: 'Gym' }] },
  courses: [{ id: 'course-cs', name: 'Data Structures', code: 'CS 204', color: '#00796B' }, { id: 'course-design', name: 'Interaction Design', code: 'DES 118', color: '#D97706' }],
  tasks: [
    { id: 'task-graph', title: 'Graph algorithms problem set', courseId: 'course-cs', dueDate: '2026-10-19', estimatedHours: 4, actualHours: 1, importance: 5, complexity: 4, status: 'in-progress', dependencies: [], notes: 'Shortest paths and spanning trees' },
    { id: 'task-research', title: 'Research methods reading', courseId: 'course-design', dueDate: '2026-10-21', estimatedHours: 2, actualHours: 0, importance: 3, complexity: 2, status: 'todo', dependencies: [], notes: '' },
    { id: 'task-critique', title: 'Prototype critique deck', courseId: 'course-design', dueDate: '2026-10-24', estimatedHours: 5, actualHours: 0, importance: 4, complexity: 3, status: 'todo', dependencies: ['task-research'], notes: '' }
  ], sessions: []
}

export async function loadStore() {
  try { return JSON.parse(await fs.readFile(file, 'utf8')) } catch { await saveStore(seed); return structuredClone(seed) }
}
export async function saveStore(data) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(data, null, 2)); return data }
export function id(prefix) { return `${prefix}-${randomUUID().slice(0, 8)}` }
