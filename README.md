# TaskSpace — Frontend

A mobile-first Task Management application built with Angular 21.

---

## Tech Stack

- **Framework** — Angular 21 (Standalone Components)
- **Drag & Drop** — @angular/cdk/drag-drop
- **Styling** — CSS Variables, Plus Jakarta Sans font
- **Icons** — Material Symbols Rounded
- **HTTP** — Angular HttpClient
- **Forms** — Angular Reactive Forms
- **State** — Signals + BehaviorSubject

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- Angular CLI v21

```bash
# Install Angular CLI globally
npm install -g @angular/cli@21
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ogedengbewisdom/taskManagement.git
cd taskManagement
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create the environment files:

```bash
# src/environments/environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

```bash
# src/environments/environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api',
};
```

### 4. Start the development server

```bash
ng serve
```

App runs at **http://localhost:4200**

---

## Project Structure

```
src/
└── app/
    ├── auth/                      # Login, Signup, Forgot/Reset Password
    ├── core/
    │   ├── guards/                # Auth guard
    │   ├── services/
    │   │   ├── auth/              # Auth service + token management
    │   │   ├── dashboard/         # Board service (API calls)
    │   │   ├── task/              # Task service (API + local cache)
    │   │   └── toast/             # Toast notification service
    ├── features/
    │   ├── dashboard/             # Board listing page
    │   ├── board/
    │   │   ├── board.component    # Kanban board view
    │   │   └── board-form/        # Create / Edit board form
    │   ├── task/
    │   │   ├── create-task/       # Create task form
    │   │   └── task-detail/       # Task detail + edit
    │   └── invite-response/       # Accept / Decline board invite
    └── shared/
        └── component/
            ├── button/
            ├── text-input/
            ├── password-input/
            ├── text-area/
            ├── date-input/
            ├── assignee-selector/
            ├── user-search-selector/
            ├── select-status/
            ├── board-card/
            ├── bottom-nav/
            └── header/
```

---

## Available Scripts

```bash
# Start development server
ng serve

# Build for production
ng build

# Run unit tests
ng test

# Lint the project
ng lint
```

---

## App Routes

| Route                              | Page                  | Protected |
| ---------------------------------- | --------------------- | --------- |
| `/auth/login`                      | Login                 | No        |
| `/auth/signup`                     | Sign Up               | No        |
| `/auth/forgot-password`            | Forgot Password       | No        |
| `/auth/reset-password`             | Reset Password        | No        |
| `/app/dashboard`                   | Board List            | Yes       |
| `/app/board/:id`                   | Kanban Board          | Yes       |
| `/app/board/:boardId/task/:taskId` | Task Detail           | Yes       |
| `/app/board/:boardId/create-task`  | Create Task           | Yes       |
| `/app/boards/new`                  | Create Board          | Yes       |
| `/app/boards/:boardId/edit`        | Edit Board            | Yes       |
| `/app/boards/:boardId/invite`      | Accept/Decline Invite | Yes       |

---

## Authentication Flow

1. User signs up or logs in
2. JWT token stored in localStorage
3. Auth guard checks token expiry on every protected route
4. If expired, user is redirected to `/auth/login?redirectUrl=<original-url>`
5. After login, user is redirected back to the original URL

---

## Key Features

- **Kanban Board** — Drag and drop tasks between To Do, In Progress, and Done columns
- **Task Management** — Create, edit, complete, and delete tasks
- **Checklist** — Add, toggle, and remove checklist items on tasks
- **Board Members** — Invite members via email, accept or decline invites
- **Progress Tracking** — Board cards show task completion progress
- **Archive Boards** — Owner can archive and unarchive boards
- **Responsive** — Mobile-first design, works on desktop too

---

## Notes

- The app uses `OnPush` change detection on most components — if data is not updating, ensure `cdr.markForCheck()` is called after signal or state updates
- Task counts and progress on the dashboard are derived from the local task cache — call `loadTasksForBoard()` to warm the cache on dashboard load
- Drag and drop requires `@angular/cdk@21` — do not install a higher version as it requires Angular 22+
