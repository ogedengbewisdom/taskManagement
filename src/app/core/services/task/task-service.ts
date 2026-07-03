import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IResponse } from '../dashboard/dashboard-service';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ITask {
  id: number;
  boardId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  assignees: { id: number; firstName: string; lastName: string }[];
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: number;
  label: string;
  done: boolean;
}

export interface CreateTaskPayload {
  boardId: number;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  assigneeIds?: number[];
  checklist?: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  assigneeIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/v1/boards`;

  // ─── Local cache — BehaviorSubject keeps board view reactive ───────────────
  private _tasks = new BehaviorSubject<ITask[]>([]);
  tasks$ = this._tasks.asObservable();

  // ─── Board tasks ────────────────────────────────────────────────────────────

  loadTasksForBoard(boardId: number): Observable<ITask[]> {
    return this.http.get<IResponse<ITask[]>>(`${this.BASE}/${boardId}/tasks`).pipe(
      map((res) => res.data),
      tap((tasks) => {
        const current = this._tasks.getValue();

        const otherBoards = current.filter((t) => t.boardId !== boardId);

        this._tasks.next([...otherBoards, ...tasks]);
      }),
    );
  }

  getTasksForBoard(boardId: number): Observable<ITask[]> {
    return this.tasks$.pipe(map((tasks) => tasks.filter((t) => t.boardId === boardId)));
  }

  getTaskById(taskId: number): Observable<ITask | undefined> {
    return this.tasks$.pipe(map((tasks) => tasks.find((t) => t.id === taskId)));
  }

  // ─── Create ─────────────────────────────────────────────────────────────────

  createTask(payload: CreateTaskPayload): Observable<ITask> {
    const { boardId, checklist, assignees, ...rest } = payload as any;

    const body = {
      ...rest,
      checklist: (checklist ?? []).map((c: any) => (typeof c === 'string' ? c : c.label)),
      assigneeIds: (assignees ?? []).map((u: any) => (typeof u === 'number' ? u : u.id)),
    };

    return this.http.post<IResponse<ITask>>(`${this.BASE}/${boardId}/tasks`, body).pipe(
      map((res) => res.data),
      tap((task) => {
        this._tasks.next([...this._tasks.getValue(), task]);
      }),
    );
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  updateTask(
    taskId: number,
    payload: UpdateTaskPayload & { assignees?: any[] },
  ): Observable<ITask> {
    const task = this._tasks.getValue().find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found in local cache');

    const body: any = { ...payload };

    // convert assignees array of User objects → assigneeIds
    if (payload.assignees) {
      body.assigneeIds = payload.assignees.map((u: any) => (typeof u === 'number' ? u : u.id));
      delete body.assignees;
    }

    return this.http
      .patch<IResponse<ITask>>(`${this.BASE}/${task.boardId}/tasks/${taskId}`, body)
      .pipe(
        map((res) => res.data),
        tap((updated) => {
          this._tasks.next(this._tasks.getValue().map((t) => (t.id === taskId ? updated : t)));
        }),
      );
  }

  // ─── Move ───────────────────────────────────────────────────────────────────

  moveTask(taskId: number, newStatus: TaskStatus): Observable<ITask> {
    const task = this._tasks.getValue().find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found in local cache');

    return this.http
      .patch<
        IResponse<ITask>
      >(`${this.BASE}/${task.boardId}/tasks/${taskId}/move`, { status: newStatus })
      .pipe(
        map((res) => res.data),
        tap((updated) => {
          this._tasks.next(this._tasks.getValue().map((t) => (t.id === taskId ? updated : t)));
        }),
      );
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  deleteTask(taskId: number): Observable<void> {
    const task = this._tasks.getValue().find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found in local cache');

    return this.http.delete<void>(`${this.BASE}/${task.boardId}/tasks/${taskId}`).pipe(
      tap(() => {
        this._tasks.next(this._tasks.getValue().filter((t) => t.id !== taskId));
      }),
    );
  }

  // ─── Checklist ──────────────────────────────────────────────────────────────

  toggleChecklistItem(taskId: number, itemId: number): Observable<ChecklistItem> {
    const task = this._tasks.getValue().find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found in local cache');

    return this.http
      .patch<
        IResponse<ChecklistItem>
      >(`${this.BASE}/${task.boardId}/tasks/${taskId}/checklist/${itemId}/toggle`, {})
      .pipe(
        map((res) => res.data),
        tap((updated) => {
          this._tasks.next(
            this._tasks.getValue().map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    checklist: t.checklist.map((c) => (c.id === itemId ? updated : c)),
                  }
                : t,
            ),
          );
        }),
      );
  }

  fetchTaskById(boardId: number, taskId: number): Observable<ITask> {
    return this.http.get<IResponse<ITask>>(`${this.BASE}/${boardId}/tasks/${taskId}`).pipe(
      map((res) => res.data),
      tap((task) => {
        const current = this._tasks.getValue();
        const exists = current.find((t) => t.id === taskId);
        if (exists) {
          this._tasks.next(current.map((t) => (t.id === taskId ? task : t)));
        } else {
          this._tasks.next([...current, task]);
        }
      }),
    );
  }

  addChecklistItem(taskId: number, label: string): Observable<ChecklistItem> {
    const task = this._tasks.getValue().find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found in local cache');

    return this.http
      .post<
        IResponse<ChecklistItem>
      >(`${this.BASE}/${task.boardId}/tasks/${taskId}/checklist`, { label })
      .pipe(
        map((res) => res.data),
        tap((newItem) => {
          this._tasks.next(
            this._tasks
              .getValue()
              .map((t) => (t.id === taskId ? { ...t, checklist: [...t.checklist, newItem] } : t)),
          );
        }),
      );
  }

  removeChecklistItem(taskId: number, itemId: number): Observable<void> {
    const task = this._tasks.getValue().find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found in local cache');

    return this.http
      .delete<void>(`${this.BASE}/${task.boardId}/tasks/${taskId}/checklist/${itemId}`)
      .pipe(
        tap(() => {
          this._tasks.next(
            this._tasks
              .getValue()
              .map((t) =>
                t.id === taskId
                  ? { ...t, checklist: t.checklist.filter((c) => c.id !== itemId) }
                  : t,
              ),
          );
        }),
      );
  }

  // ─── Dashboard counts — derived from local cache ─────────────────────────

  getTotalTasks(boardId: number): Observable<number> {
    return this.getTasksForBoard(boardId).pipe(map((t) => t.length));
  }

  getCompletedTasks(boardId: number): Observable<number> {
    return this.getTasksForBoard(boardId).pipe(
      map((tasks) => tasks.filter((t) => t.status === 'done').length),
    );
  }

  canMoveToDone(task: ITask): boolean {
    return task.checklist.every((item) => item.done);
  }
}
