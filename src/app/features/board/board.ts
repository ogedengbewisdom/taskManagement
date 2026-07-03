import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkDragDrop, DragDropModule, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { BottomNavComponent } from '../../shared/component/bottom-nav-component/bottom-nav-component';
import { TaskService, ITask, TaskStatus } from '../../core/services/task/task-service';
import { ToastService } from '../../core/services/toast/toast.service';

interface KanbanColumn {
  key: TaskStatus;
  label: string;
  tasks: ITask[];
  track: number;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [BottomNavComponent, DragDropModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit, OnDestroy {
  boardId!: number;
  boardName = '';
  isLoading = false;

  // columns: KanbanColumn[] = [
  //   { key: 'todo', label: 'To Do', tasks: [] },
  //   { key: 'in_progress', label: 'In Progress', tasks: [] },
  //   { key: 'done', label: 'Done', tasks: [] },
  // ];

  columns: KanbanColumn[] = [
    { key: 'todo', label: 'To Do', tasks: [], track: 3 },
    { key: 'in_progress', label: 'In Progress', tasks: [], track: 2 },
    { key: 'done', label: 'Done', tasks: [], track: 1 },
  ];

  columnIds = ['todo', 'in_progress', 'done'];

  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private taskService: TaskService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.boardId = Number(this.route.snapshot.paramMap.get('id'));
    this.boardName = this.route.snapshot.queryParamMap.get('name') ?? 'Board';

    this.loadTasks();

    // Keep columns in sync with local cache after moves/creates
    this.taskService
      .getTasksForBoard(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((tasks) => {
        this.columns = this.columns.map((col) => ({
          ...col,
          tasks: tasks.filter((t) => t.status === col.key),
        }));
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService
      .loadTasksForBoard(this.boardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to load tasks');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onTaskDrop(event: CdkDragDrop<ITask[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) return;

    const task = event.previousContainer.data[event.previousIndex];

    this.taskService.moveTask(task.id, newStatus).subscribe({
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to move task');
      },
    });
  }

  canDrop = (drag: CdkDrag<ITask>, drop: CdkDropList<ITask[]>) => {
    const task = drag.data;
    if (drop.id !== 'done') return true;
    return this.taskService.canMoveToDone(task);
  };

  goBack(): void {
    this.location.back();
  }

  openTask(taskId: number): void {
    this.router.navigate(['/app/board', this.boardId, 'task', taskId]);
  }

  openCreateTask(status: TaskStatus): void {
    this.router.navigate(['/app/board', this.boardId, 'create-task'], {
      queryParams: { status },
    });
  }

  isOverdue(task: ITask): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  }

  isDone(task: ITask): boolean {
    return task.status === 'done';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  trackByTaskId(_: number, task: ITask): number {
    return task.id;
  }

  trackByColumnKey(_: number, col: KanbanColumn): string {
    return col.key;
  }
}
