import { Location, formatDate } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TextInput } from '../../../shared/component/text-input/text-input';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorState, getErrorMessage } from '../../../utils';
import { TextArea } from '../../../shared/component/text-area/text-area';
import { DateInput } from '../../../shared/component/date-input/date-input';
import { ActivatedRoute } from '@angular/router';
import { DashboardService, User } from '../../../core/services/dashboard/dashboard-service';
import { AssigneeSelector } from '../../../shared/component/assignee-selector/assignee-selector';
import { IOption, SelectStatus } from '../../../shared/component/select-status/select-status';
import { TaskService } from '../../../core/services/task/task-service';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-create-task',
  imports: [TextInput, ReactiveFormsModule, TextArea, DateInput, AssigneeSelector, SelectStatus],
  templateUrl: './create-task.html',
  styleUrl: './create-task.css',
})
export class CreateTask implements OnInit {
  private location = inject(Location);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private boardService = inject(DashboardService);
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  taskForm!: FormGroup;
  invitees: User[] = [];
  selectedUsers: User[] = [];
  boardName = signal<string>('');
  isLoading = false;

  today = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  options: IOption[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  buildForm() {
    this.taskForm = this.formBuilder.group({
      boardId: [],
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      status: ['', Validators.required],
      checklist: this.formBuilder.array([]),
    });
  }

  ngOnInit() {
    this.buildForm();
    this.route.params.subscribe((params) => {
      const boardId = Number(params['boardId']);
      this.taskForm.patchValue({ boardId });

      this.boardService.getBoard(boardId).subscribe({
        next: (response) => {
          this.invitees = response.data.invitees;
          this.boardName.set(response.data.boardName);
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to load board');
        },
      });
    });

    this.route.queryParams.subscribe((query) => {
      const status = query['status'] ?? 'todo';
      this.taskForm.patchValue({ status });
    });
  }

  get checklist() {
    return this.taskForm.get('checklist') as FormArray;
  }

  addChecklistItem() {
    this.checklist.push(
      this.formBuilder.group({
        id: [this.checklist.length + 1],
        label: ['', Validators.required],
        done: [false],
      }),
    );
  }

  removeChecklistItem(index: number) {
    this.checklist.removeAt(index);
  }

  addLabel() {}
  addAttachment() {}

  get controls() {
    return this.taskForm.controls;
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { boardId, title, description, dueDate, status, checklist } = this.taskForm.value;

    this.taskService
      .createTask({
        boardId,
        title,
        description,
        dueDate,
        status,
        assigneeIds: this.selectedUsers.map((u) => u.id),
        // send only labels as string[] — backend expects string[]
        checklist: checklist.map((c: any) => c.label),
      })
      .subscribe({
        next: () => {
          this.toastService.success('Task created successfully');
          this.isLoading = false;
          this.goBack();
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to create task');
          this.isLoading = false;
        },
      });
  }
}
