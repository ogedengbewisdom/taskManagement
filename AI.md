# Task Manager — AI-Assisted Development Log

A summary of the key prompts and decisions made during the planning and building of the Task Manager Angular MVP.

---

## 1. Wireframe Analysis

**Prompt:**

> Analyze the attached wireframes and provide the major pages, reusable components, Angular component hierarchy, folder structure, smart vs dumb components, data models, assumptions, and MVP features.

**AI Response Summary:**

- Identified 5 screens: Dashboard, Board View, Task Detail, Create Task, Notifications
- Defined reusable components: `TaskCard`, `ProgressBar`, `Avatar`, `BottomNav`, `AppHeader`, etc.
- Proposed a feature-based folder structure: `core/`, `shared/`, `features/`
- Distinguished smart components (pages that own services) from dumb ones (pure `@Input`/`@Output`)
- Defined data models: `Board`, `Task`, `ChecklistItem`, `Notification`, `User`

---

## 2. Clarifying the Dashboard

**Prompt:**

> Is the first wireframe a list of tasks or a list of boards? And there is no Create Board form — how does a user create a board?

**AI Response Summary:**

- Confirmed the dashboard shows a **Board list**, not tasks
- Noted there is no Create Board form in the wireframes — only a `+ Create Board` button
- Recommended confirming with the designer, but suggested a simple modal with just a name field as a safe MVP assumption

---

## 3. MVP Feature List

**Prompt:**

> Give me an MVP feature list, then cut it to what you'd build first.

**AI Response Summary:**

- Full list of 14 features identified
- Cut to 5 that form a complete usable loop:
  1. Dashboard with hardcoded board list
  2. Board View with To Do and In Progress columns
  3. Create Task (title + due date only)
  4. Task Detail (read-only)
  5. Mark Complete (only status transition)

---

## 4. Building the MVP

**Prompt:**

> Build the task management priority MVP — dashboard with clickable boards, board view with x-axis overflow, task movement between columns, task detail, and create task form. Follow the wireframe design strictly.

**AI Response Summary:**

- Built a fully interactive prototype with all 5 screens
- Kanban board scrolls horizontally with 3 columns: To Do, In Progress, Done
- Tasks move between columns via a Move button calling `taskService.moveTask()`
- Create Task form drops new tasks into To Do of the selected board
- Task Detail shows title, description, assignees, due date, checklist, and activity

---

## 5. Generating Angular Code

**Prompt:**

> Build the board view with Kanban columns. I already have my Angular app set up. Here is a sample of my code.

**AI Response Summary:**

- Generated `task.model.ts` with `Task`, `ChecklistItem`, `TaskStatus` interfaces
- Generated `task.service.ts` as a singleton `BehaviorSubject`
  -based service with `addTask()`, `getTasksForBoard()`, `getTotalTasks()`, `getCompletedTasks()`
- Generated `board-view.component.ts/.html/.css` matching the wireframe design
- Provided `WIRING_NOTES.ts` with routing snippet, board card click handler, and dashboard observable pattern

---

## 6. Drag and Drop — Native HTML5

**Prompt:**

> Can we drag tasks between columns instead of using a button?

**AI Response Summary:**

- Implemented native HTML5 Drag and Drop API with `draggable="true"`, `(dragstart)`, `(dragover)`, `(drop)` events
- Used `data-column` attribute on each column for drop target detection
- Added visual feedback: `.col--drag-over` highlight and `.task-card--dragging` opacity

---

## 7. Drag and Drop — Mobile Emulator Issue

**Prompt:**

> Drag works on desktop but not in Chrome mobile emulator. Double-clicking navigates instead of dragging.

**AI Response Summary:**

- Root cause: HTML5 Drag and Drop API does not fire on touch/pointer events used by Chrome's mobile emulator
- Switched to Pointer Events API with `setPointerCapture` and a movement threshold to separate tap from drag
- Added `touch-action: none` on task cards to prevent browser scroll interference

---

## 8. Switching to Angular CDK Drag Drop

**Prompt:**

> Is there a package that makes this easier and easier to understand?

**AI Response Summary:**

- Recommended `@angular/cdk/drag-drop` — official Angular package, works on touch and desktop out of the box
- Install: `npm install @angular/cdk@21` (version matched to Angular 21)
- Replaced all custom pointer logic with `cdkDropList`, `cdkDrag`, `cdkDragHandle` directives
- `onTaskDrop(event: CdkDragDrop<Task[]>)` calls `taskService.moveTask()` on drop
- `cdkDragHandle` separates drag gesture from click — tap navigates, drag moves


AI Reflection

How AI was used

Explained unfamiliar NestJS, Angular, and TypeORM concepts.
Suggested project structure and implementation approaches.
Reviewed existing code and identified potential bugs.
Assisted with debugging backend and frontend issues.

Where AI suggestions were refined

Reworked the task caching strategy after identifying issues with a shared BehaviorSubject.
Adjusted invitation handling to reload related entities before sending emails.
Simplified some suggested implementations after testing them in the project.

Should I use a transaction when creating a task and its checklist?
A transaction would only become necessary if you were performing several independent database operations that all had to succeed or fail together.

Explain findOneByOrFail like I'm a beginner.
