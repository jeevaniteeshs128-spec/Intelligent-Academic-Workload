# Product Requirements Document (PRD)

## Project Title: StudySync AI (Intelligent Academic Workload & Schedule Planner)
- **Document Version**: 1.0.0
- **Status**: Approved & Implementation Ready
- **Target Audience**: University Students, Academic Advisors, Course Instructors

---

## 1. Executive Summary & Product Vision

### 1.1 Overview
**StudySync AI** is an intelligent, deterministic academic workload and assignment planning platform designed to solve student deadline anxiety and cognitive overload. While conventional calendar applications and static to-do lists expect users to manually estimate, block, and continuously adjust their calendar slots, StudySync AI automates the generation of adaptive, daily-capped study schedules based on assignment complexities, dependencies, user availability, and existing commitments.

### 1.2 Vision Statement
To empower students to achieve academic excellence without burnout by transforming ambiguous course requirements and looming deadlines into actionable, balanced daily study blocks with transparent, explainable recommendations.

---

## 2. Problem Statement & Market Opportunity

### 2.1 The Problem
University students routinely handle between 4 to 6 concurrent courses, each presenting disparate assignment structures, unpredictable effort requirements, and hard deadlines. Traditional planning tools fail students in three key ways:
1. **Static Task Lists**: Conventional tools (e.g., Todoist, Trello) display what is due, but not *when* or *how long* to work on tasks, leading to deadline bunching and last-minute cramming.
2. **Calendar Fragmentation & Cognitive Fatigue**: Manually estimating hours, factoring in prerequisites, avoiding personal commitments (e.g., gym, part-time jobs), and re-arranging blocks when life happens creates high friction. Students abandon calendars within weeks.
3. **Black-box AI Distrust**: Many modern AI planners use unconstrained LLMs that hallucinate dates, drop prerequisite dependencies, or fail to explain why a particular task is prioritized over another.

### 2.2 The Solution
StudySync AI provides a deterministic, zero-credential academic planning engine paired with a modern React dashboard:
- Calculates priority scores based on deadline proximity, importance, complexity, and remaining effort.
- Automatically places tasks into valid availability windows, avoiding recurring fixed commitments and enforcing a daily study hour limit.
- Enables dynamic replanning that respects past and completed work.
- Automatically flags infeasible deadlines with proactive alerts rather than overbooking the student's calendar.
- Offers a credential-free syllabus/assignment text parser for rapid schedule population.

---

## 3. Target User Personas

### Persona 1: Alex Rivera — The Overwhelmed CS Major
- **Background**: 3rd-year Computer Science undergraduate taking 5 technical courses.
- **Pain Points**: Large coding assignments with multi-step milestones (e.g., research before coding, testing before submission). Tendency to underestimate workload and pull all-nighters.
- **Goals**: Wants a system that respects task prerequisites (dependencies), splits massive 10-hour projects into manageable daily chunks, and alerts him early if an assignment cannot realistically fit before the deadline.

### Persona 2: Maya Patel — The Working / Interdisciplinary Student
- **Background**: Design and Business double major who works a 15-hour/week part-time job and attends daily sports practice.
- **Pain Points**: Highly rigid, non-negotiable availability blocks. When an unexpected shift is added or an assignment runs over time, her entire weekly calendar breaks.
- **Goals**: Needs a planner where non-study commitments are strictly preserved, study sessions never exceed 3 hours a day, and one-click replanning instantly recovers the rest of the week without manual drag-and-drop.

---

## 4. Goals and Non-Goals

### 4.1 Goals
- **Deterministic & Explainable Scheduling**: Provide an algorithm that guarantees repeatable, mathematically verified schedules with clear textual rationale (e.g., "Prioritized for Oct 19: 5/5 importance and 3h remaining").
- **Strict Constraint Enforcement**: Never violate user-configured daily limits (e.g., max 3h/day) or overlap with fixed weekly commitments.
- **Prerequisite Dependency Management**: Guarantee that prerequisite assignments (e.g., research or readings) are scheduled and completed before downstream dependent projects.
- **Adaptive Replanning**: Allow students to log actual hours, mark sessions completed, or trigger a re-plan that retains history and recalibrates future sessions.
- **Zero-Credential Syllabus Import**: Enable students to paste raw syllabus text or assignment outlines and extract assignments locally without external API dependencies or privacy concerns.
- **Progress & Risk Analytics**: Expose transparent metrics on course completion, planned vs. actual hours, overloaded days, and deadline risks.

### 4.2 Non-Goals
- **LMS Replacement**: StudySync AI is not a submission portal or gradebook; it does not replace Canvas, Blackboard, or Moodle.
- **LLM Hallucinations in Core Logic**: Core schedule generation will not rely on nondeterministic generative AI prompts for temporal math.
- **Multi-user Group Scheduling**: MVP focuses on single-student personal productivity; collaborative team scheduling is out of scope for v1.0.

---

## 5. User Stories & Acceptance Criteria

### US-1: Task Management
- **As a student**, I want to create, update, and delete assignments with estimated hours, importance, complexity, and dependencies.
- **Acceptance Criteria**:
  - Task fields must include title, course code/id, due date, estimated hours, actual hours, importance (1-5), complexity (1-5), status (`todo`, `in-progress`, `done`), and dependency IDs.
  - Deleting a task must cascade and remove all associated scheduled sessions.

### US-2: Deterministic Schedule Generation
- **As a student**, I want to generate a 7-day study plan with one click that maps my tasks into discrete study blocks.
- **Acceptance Criteria**:
  - Scheduled sessions must not exceed the configured `dailyLimit`.
  - Sessions must fall strictly within the user's weekly day availability windows (e.g., Mon 18:00 - 21:00).
  - Sessions must never overlap with fixed commitments (e.g., Gym, lectures).
  - Dependent tasks must not have sessions scheduled prior to their prerequisites.

### US-3: Deadline Risk & Infeasible Workload Detection
- **As a student**, I want to know immediately if an assignment cannot be finished before its due date under current constraints.
- **Acceptance Criteria**:
  - If available capacity before the deadline is less than the remaining task hours, the system generates an `at-risk` session flag detailing the deficit.
  - The risk must appear prominently in the Overview and Analytics views.

### US-4: Dynamic Replanning
- **As a student**, I want to replan my remaining week when my progress deviates from the initial plan.
- **Acceptance Criteria**:
  - Past sessions (`date < today`) and sessions marked `completed` or `locked` must be preserved.
  - Remaining open hours are recalculated and redistributed across the remaining available days.

### US-5: Raw Syllabus & Outline Text Import
- **As a student**, I want to paste raw assignment notes or syllabus text to extract tasks automatically.
- **Acceptance Criteria**:
  - System extracts dates in standard formats (`YYYY-MM-DD`, `MM/DD/YYYY`, `DD/MM/YYYY`) and normalizes them.
  - Previews candidate assignments with customizable parameters prior to confirmation.
  - Confirmed tasks are bulk-persisted to the active task pool.

---

## 6. Functional Requirements

| Req ID | Module | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-01** | Bootstrap API | System shall return all courses, tasks, sessions, and settings in a single payload on boot. | P0 |
| **FR-02** | Task CRUD | Create, read, update, and delete tasks with validation for required fields (`title`, `courseId`, `dueDate`, `estimatedHours`). | P0 |
| **FR-03** | Priority Engine | Compute dynamic priority score using urgency decay, importance weight, complexity weight, and remaining hours. | P0 |
| **FR-04** | Topological Dependency | Resolve task dependencies to ensure prerequisite tasks precede dependent tasks in the scheduling pipeline. | P0 |
| **FR-05** | Availability & Collision Engine | Discretize daily windows into 30-minute slots; filter out conflicts with fixed commitments and previously occupied slots. | P0 |
| **FR-06** | Session Allocation | Allocate up to 1-hour session chunks up to the configured daily limit; persist generated sessions. | P0 |
| **FR-07** | Replan Workflow | Preserve finished and locked sessions, recalculate open task work, and regenerate forward-looking schedule. | P0 |
| **FR-08** | Document Import | Parse unformatted text lines, detect date patterns, generate candidate list, and provide preview/confirmation workflow. | P1 |
| **FR-09** | Preferences & Settings | Allow users to configure daily study limits, daily start/end availability windows, and fixed commitment intervals. | P1 |
| **FR-10** | Analytics & Insights | Calculate completion percentage, planned vs. actual hours, overloaded days, and active deadline risks. | P1 |

---

## 7. Non-Functional Requirements (NFRs)

### 7.1 Performance & Responsiveness
- Schedule generation for a typical semester workload (up to 50 active tasks and 100 sessions) must complete in under **50ms**.
- Initial dashboard bootstrap load time must be under **300ms** over local network.
- The React client must maintain 60 FPS transitions across all view switches.

### 7.2 Usability & Explainability
- Every scheduled session must include an explainable reason string explaining why it was scheduled on that day and time.
- Clean typography and distinct visual status pills (`planned`, `completed`, `at-risk`) for immediate glanceability.

### 7.3 Reliability & Determinism
- The scheduling algorithm must be purely deterministic: identical tasks, availability, and settings must produce identical session placements every execution.
- Persistence must be atomic with recursive directory creation to prevent data loss.

### 7.4 Data Privacy & Security
- Zero required cloud credentials for baseline functionality.
- All student data is stored locally in `data/studysync.json` by default, ensuring complete data ownership.

### 7.5 Portability & Extensibility
- Clean repository pattern in `server/store.js` allowing seamless replacement of JSON filesystem persistence with MongoDB or PostgreSQL without altering API routes or frontend code.

---

## 8. Success Metrics & Key Performance Indicators (KPIs)

1. **Schedule Feasibility Rate**: $> 95\%$ of scheduled tasks completed within their planned deadlines without last-minute deadline slips.
2. **Planning Efficiency**: Reduction in weekly planning overhead from $\sim 45$ minutes of manual calendar juggling to $< 2$ minutes using automated generation.
3. **Replanning Resilience**: $100\%$ preservation of completed and locked study blocks when recalculating schedules.
4. **Zero Overlap Guarantee**: $0$ scheduling conflicts with defined recurring fixed commitments.
