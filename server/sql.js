import pg from 'pg'

const { Pool } = pg

function getPool() {
  if (!process.env.DATABASE_URL) return null
  return new Pool({ connectionString: process.env.DATABASE_URL })
}

export async function syncSqlStore(data) {
  const pool = getPool()
  if (!pool) return null
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(`CREATE TABLE IF NOT EXISTS courses (
      id text PRIMARY KEY, name text NOT NULL, code text NOT NULL, color text
    ); CREATE TABLE IF NOT EXISTS tasks (
      id text PRIMARY KEY, title text NOT NULL, course_id text REFERENCES courses(id),
      due_date date NOT NULL, estimated_hours numeric NOT NULL, actual_hours numeric DEFAULT 0,
      importance integer DEFAULT 3, complexity integer DEFAULT 3, status text DEFAULT 'todo',
      dependencies jsonb DEFAULT '[]'::jsonb, notes text DEFAULT ''
    );`)
    await client.query('DELETE FROM tasks')
    await client.query('DELETE FROM courses')
    for (const course of data.courses) {
      await client.query('INSERT INTO courses (id, name, code, color) VALUES ($1,$2,$3,$4)', [course.id, course.name, course.code, course.color])
    }
    for (const task of data.tasks) {
      await client.query(`INSERT INTO tasks
        (id,title,course_id,due_date,estimated_hours,actual_hours,importance,complexity,status,dependencies,notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [task.id, task.title, task.courseId, task.dueDate, task.estimatedHours, task.actualHours || 0, task.importance, task.complexity, task.status, JSON.stringify(task.dependencies || []), task.notes || ''])
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
  return pool
}

export async function queryTasksWithCourses() {
  const pool = getPool()
  if (!pool) return null
  const result = await pool.query(`SELECT t.id, t.title, t.due_date, t.estimated_hours,
    t.actual_hours, t.status, c.id AS course_id, c.name AS course_name, c.code AS course_code
    FROM tasks t
    INNER JOIN courses c ON c.id = t.course_id
    ORDER BY t.due_date ASC`)
  await pool.end()
  return result.rows
}
