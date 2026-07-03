import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const FEATURE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    // component: ,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'board/:id',
        loadComponent: () => import('./board/board').then((m) => m.Board),
      },
      {
        path: 'board/:boardId/task/:taskId',
        loadComponent: () => import('./task/task-detail/task-detail').then((m) => m.TaskDetail),
      },
      {
        path: 'board/:boardId/create-task',
        loadComponent: () => import('./task/create-task/create-task').then((m) => m.CreateTask),
      },
      {
        path: 'boards/new',
        loadComponent: () => import('./board/board-form/board-form').then((m) => m.BoardForm),
      },
      {
        path: 'boards/:boardId/edit',
        loadComponent: () => import('./board/board-form/board-form').then((m) => m.BoardForm),
      },
      {
        path: 'boards/:boardId/invite',
        loadComponent: () =>
          import('./invite-response/invite-response').then((m) => m.InviteResponse),
      },
    ],
  },
];
