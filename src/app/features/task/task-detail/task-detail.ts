import { CommonModule, Location, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ITask, TaskService } from '../../../core/services/task/task-service';
import { Button } from '../../../shared/component/button/button';
import { TextArea } from '../../../shared/component/text-area/text-area';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorState, getErrorMessage } from '../../../utils';
import { DateInput } from '../../../shared/component/date-input/date-input';
import { AssigneeSelector } from '../../../shared/component/assignee-selector/assignee-selector';
import { DashboardService, User } from '../../../core/services/dashboard/dashboard-service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, Button, TextArea, ReactiveFormsModule, DateInput, AssigneeSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private router = inject(Router);
  private taskService = inject(TaskService);
  private formBuilder = inject(FormBuilder);
  private boardService = inject(DashboardService);
  private destroy$ = new Subject<void>();
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  task = signal<ITask | undefined>(undefined);
  editTaskForm!: FormGroup;
  taskId!: number;
  boardId!: number;
  invitees: User[] = [];
  selectedUsers: User[] = [];
  isAddingItem = false;
  isSaving = signal(false);
  isCompleting = signal(false);
  isLoading = signal(true);

  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  buildForm(task: ITask): void {
    this.editTaskForm = this.formBuilder.group({
      description: [task.description ?? '', Validators.required],
      dueDate: [task.dueDate ?? null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.taskId = Number(params['taskId']);
      this.boardId = Number(params['boardId']);

      this.loadBoardMembers();

      // fetch fresh from API first
      this.taskService.fetchTaskById(this.boardId, this.taskId).subscribe({
        next: (task) => {
          this.task.set(task);
          this.selectedUsers = task.assignees ?? [];
          this.buildForm(task);
          this.isLoading.set(false);
          this.cdr.markForCheck();

          // then keep signal in sync with cache changes
          // so checklist toggles reflect immediately without save
          this.taskService
            .getTaskById(this.taskId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((updated) => {
              if (updated) {
                this.task.set(updated);
                this.cdr.markForCheck();
              }
            });
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to load task');
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
    });
  }

  // ─── Load task from API ──────────────────────────────────────────────────────

  private loadTask(): void {
    this.isLoading.set(true);
    this.taskService.fetchTaskById(this.boardId, this.taskId).subscribe({
      next: (task) => {
        this.task.set(task);
        this.selectedUsers = task.assignees ?? [];
        this.buildForm(task);
        this.isLoading.set(false);
        this.cdr.markForCheck();

        // keep signal in sync with cache for instant checklist updates
        this.taskService
          .getTaskById(this.taskId)
          .pipe(takeUntil(this.destroy$))
          .subscribe((updated) => {
            if (updated) {
              this.task.set(updated);
              this.cdr.markForCheck();
            }
          });
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to load task');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  // ─── Load board members for assignee selector ────────────────────────────────

  private loadBoardMembers(): void {
    this.boardService.getBoard(this.boardId).subscribe({
      next: (response) => {
        this.invitees = response.data.invitees;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to load board members');
      },
    });
  }

  get controls() {
    return this.editTaskForm?.controls ?? {};
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);

  goBack(): void {
    this.location.back();
  }

  // ─── Checklist ──────────────────────────────────────────────────────────────

  toggleChecklistItem(itemId: number): void {
    this.taskService.toggleChecklistItem(this.taskId, itemId).subscribe({
      next: () => this.cdr.markForCheck(),
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to update checklist item');
      },
    });
  }

  showAddItem(): void {
    this.isAddingItem = true;
    this.cdr.markForCheck();
  }

  confirmAddItem(label: string): void {
    if (!label.trim()) {
      this.cancelAddItem();
      return;
    }
    this.taskService.addChecklistItem(this.taskId, label.trim()).subscribe({
      next: () => {
        this.isAddingItem = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to add checklist item');
      },
    });
  }

  cancelAddItem(): void {
    this.isAddingItem = false;
    this.cdr.markForCheck();
  }

  removeChecklistItem(itemId: number): void {
    this.taskService.removeChecklistItem(this.taskId, itemId).subscribe({
      next: () => this.cdr.markForCheck(),
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to remove checklist item');
      },
    });
  }

  // ─── Save ────────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.editTaskForm.invalid) {
      this.editTaskForm.markAllAsTouched();
      return;
    }

    const currentTask = this.task();
    const hasUnfinishedChecklist = currentTask?.checklist.some((c) => !c.done) ?? false;

    // if task was done but checklist is now incomplete, move it back to in_progress
    const statusOverride =
      currentTask?.status === 'done' && hasUnfinishedChecklist
        ? { status: 'in_progress' as const }
        : {};

    this.isSaving.set(true);
    this.taskService
      .updateTask(this.taskId, {
        ...this.editTaskForm.value,
        assigneeIds: this.selectedUsers.map((u) => u.id),
        ...statusOverride,
      })
      .subscribe({
        next: (updatedTask) => {
          this.task.set(updatedTask);
          this.toastService.success('Task saved');
          this.isSaving.set(false);
          this.router.navigate(['/app/board', this.boardId]);
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to save task');
          this.isSaving.set(false);
        },
      });
  }

  // ─── Complete ────────────────────────────────────────────────────────────────

  onComplete(): void {
    this.isCompleting.set(true);
    this.taskService.moveTask(this.taskId, 'done').subscribe({
      next: () => {
        this.toastService.success('Task marked as complete');
        this.isCompleting.set(false);
        this.router.navigate(['/app/board', this.boardId]);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message ?? 'Complete all checklist items before marking as done',
        );
        this.isCompleting.set(false);
      },
    });
  }

  canComplete(task: ITask): boolean {
    if (!task.checklist || task.checklist.length === 0) return true;
    return task.checklist.every((item) => item.done);
  }
}
