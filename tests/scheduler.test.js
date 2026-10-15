import test from 'node:test'
import assert from 'node:assert/strict'
import { generateSchedule } from '../server/scheduler.js'

const settings = { dailyLimit: 2, availability: { Wed: [9, 12], Thu: [9, 12] }, fixedCommitments: [{ day: 'Wed', start: 10, end: 11 }] }
const date = new Date('2026-10-14T12:00:00')

test('schedules dependency before dependent task', () => { const tasks = [{ id: 'dependent', title: 'Dependent', dueDate: '2026-10-15', estimatedHours: 1, actualHours: 0, importance: 5, complexity: 3, status: 'todo', dependencies: ['base'] }, { id: 'base', title: 'Base', dueDate: '2026-10-15', estimatedHours: 1, actualHours: 0, importance: 1, complexity: 1, status: 'todo', dependencies: [] }]; const sessions = generateSchedule({ tasks, settings, from: date }); assert.equal(sessions[0].taskId, 'base') })
test('does not overlap fixed commitment and enforces daily limit', () => { const tasks = [{ id: 'task', title: 'Task', dueDate: '2026-10-15', estimatedHours: 4, actualHours: 0, importance: 5, complexity: 3, status: 'todo', dependencies: [] }]; const sessions = generateSchedule({ tasks, settings, from: date }); assert.ok(sessions.filter((s) => s.date === '2026-10-14').reduce((sum, s) => sum + s.duration, 0) <= 2); assert.ok(!sessions.some((s) => s.date === '2026-10-14' && s.start >= 10 && s.start < 11)) })
test('flags infeasible deadline instead of overbooking', () => { const tasks = [{ id: 'urgent', title: 'Urgent', dueDate: '2026-10-14', estimatedHours: 5, actualHours: 0, importance: 5, complexity: 5, status: 'todo', dependencies: [] }]; const sessions = generateSchedule({ tasks, settings, from: date }); assert.ok(sessions.some((s) => s.status === 'at-risk')) })
