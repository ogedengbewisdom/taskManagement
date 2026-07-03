import { Location } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService, User } from '../../../core/services/dashboard/dashboard-service';
import { errorState, getErrorMessage } from '../../../utils';
import { Button } from '../../../shared/component/button/button';
import { UserSearchSelector } from '../../../shared/component/user-search-selector/user-search-selector';
import { TextInput } from '../../../shared/component/text-input/text-input';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-board-form',
  imports: [ReactiveFormsModule, Button, UserSearchSelector, TextInput],
  templateUrl: './board-form.html',
  styleUrl: './board-form.css',
})
export class BoardForm implements OnInit {
  private location = inject(Location);
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(DashboardService);
  private toastService = inject(ToastService);

  boardForm!: FormGroup;
  allUsers: User[] = [];
  selectedUsers: User[] = [];
  boardId: number | null = null;
  isEditMode = false;
  isLoading = signal(false);
  boardMembers: any[] = [];

  buildForm() {
    this.boardForm = this.formBuilder.group({
      boardName: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.buildForm();
    this.loadUsers();

    this.route.params.subscribe((params) => {
      const boardId = Number(params['boardId']);
      if (!boardId) return;

      this.isEditMode = true;
      this.boardId = boardId;
      this.loadBoard(boardId);
      this.loadUsers(boardId);
      this.loadMembers(boardId);
    });
  }

  private loadMembers(boardId: number): void {
    this.boardService.getBoardMembers(boardId).subscribe({
      next: (response) => {
        // exclude owner from the list — owner is always there
        this.boardMembers = response.data.filter((m: any) => m.role !== 'owner');
      },
      error: () => {},
    });
  }

  addMember(user: User): void {
    if (!this.boardId) return;
    this.boardService.addMember(this.boardId, { userId: user.id }).subscribe({
      next: (response) => {
        this.toastService.success(response.message ?? 'Member invited');
        this.refreshMembersAndUsers(); // sync both lists
      },
      error: (error) => {
        this.toastService.error(error.error?.message ?? 'Failed to add member');
      },
    });
  }

  removeMember(userId: number): void {
    if (!this.boardId) return;
    this.boardService.removeMember(this.boardId, userId).subscribe({
      next: () => {
        this.toastService.success('Member removed');
        this.refreshMembersAndUsers(); // sync both lists
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to remove member');
      },
    });
  }

  reinviteMember(userId: number): void {
    if (!this.boardId) return;
    this.boardService.reinvite(this.boardId, userId).subscribe({
      next: () => {
        this.toastService.success('Invite resent');
        this.loadMembers(this.boardId!);
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to reinvite member');
      },
    });
  }

  private refreshMembersAndUsers(): void {
    this.loadMembers(this.boardId!);
    this.loadUsers(this.boardId!);
  }

  private loadUsers(boardId?: number): void {
    this.boardService.getUsers(boardId).subscribe({
      next: (response) => {
        console.log(response.data);
        this.allUsers = response.data.users;
      },
      error: () => {},
    });
  }
  private loadBoard(boardId: number): void {
    this.boardService.getBoard(boardId).subscribe({
      next: (response) => {
        const board = response.data;
        this.boardForm.patchValue({ boardName: board.boardName });
        this.selectedUsers = [...board.invitees];
      },
      error: (error) => {
        this.toastService.error(error.error?.message ?? 'Failed to load board');
      },
    });
  }

  // addMember(user: User): void {
  //   console.log({ user });
  //   if (!this.boardId) return;
  //   this.boardService.addMember(this.boardId, { userId: user.id }).subscribe({
  //     next: (response) => {
  //       console.log(response);
  //       this.toastService.success(response.message ?? 'Member added successfully');
  //       // remove from available list immediately
  //       this.allUsers = this.allUsers.filter((u) => u.id !== user.id);
  //     },
  //     error: (error) => {
  //       this.toastService.error(error.error?.message ?? 'Failed to add member');
  //       // revert the selectedUsers if API fails
  //       this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  //     },
  //   });
  // }

  get controls() {
    return this.boardForm.controls;
  }

  errorMessage = (formInputName: string) => getErrorMessage(formInputName, this.controls);
  hasError = (formInputName: string) => errorState(formInputName, this.controls);

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.boardForm.invalid) {
      this.boardForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { boardName } = this.boardForm.value;

    if (this.isEditMode && this.boardId) {
      // edit flow stays the same
      this.boardService.updateBoard(this.boardId, { boardName }).subscribe({
        next: () => {
          this.toastService.success('Board updated successfully');
          this.isLoading.set(false);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to update board');
          this.isLoading.set(false);
        },
      });
    } else {
      // create flow — chain invite calls after board is created
      this.boardService.createBoard({ boardName }).subscribe({
        next: (response) => {
          const newBoardId = response.data.id;

          if (this.selectedUsers.length === 0) {
            this.toastService.success('Board created successfully');
            this.isLoading.set(false);
            this.router.navigate(['/app/dashboard']);
            return;
          }

          // invite all selected users sequentially
          const invites = this.selectedUsers.map((user) =>
            this.boardService.addMember(newBoardId, { userId: user.id }).toPromise(),
          );

          Promise.allSettled(invites).then((results) => {
            const failed = results.filter((r) => r.status === 'rejected').length;
            if (failed > 0) {
              this.toastService.error(`Board created but ${failed} invite(s) failed`);
            } else {
              this.toastService.success('Board created and members invited');
            }
            this.isLoading.set(false);
            this.router.navigate(['/app/dashboard']);
          });
        },
        error: (err) => {
          this.toastService.error(err.error?.message ?? 'Failed to create board');
          this.isLoading.set(false);
        },
      });
    }
  }
}
