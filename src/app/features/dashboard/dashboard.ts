import { Component, computed, OnInit, signal } from '@angular/core';
import {
  Board,
  DashboardService,
  TBoardStatus,
} from '../../core/services/dashboard/dashboard-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/component/header/header';
import { BoardCard } from '../../shared/component/board-card/board-card';
import { BottomNavComponent } from '../../shared/component/bottom-nav-component/bottom-nav-component';
import { Button } from '../../shared/component/button/button';
import { TaskService } from '../../core/services/task/task-service';
import { ToastService } from '../../core/services/toast/toast.service';
import { combineLatest, map, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth-service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Header, BoardCard, BottomNavComponent, Button],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  filters: { label: string; value: TBoardStatus }[] = [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' },
    { label: 'Recent', value: 'recent' },
  ];

  // ─── Signals ───────────────────────────────────────────────────────────────

  private allBoards = signal<Board[]>([]);
  selectedFilter = signal<TBoardStatus>('active');
  isLoading = signal(false);

  // Derived signal — filters allBoards whenever selectedFilter or allBoards change
  boards = computed(() => {
    const filter = this.selectedFilter();
    const all = this.allBoards();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    if (filter === 'recent') {
      return all.filter((b) => new Date(b.createdAt) >= oneWeekAgo);
    }

    return all.filter((b) => b.status === filter);
  });

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private taskService: TaskService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  // ─── API call ──────────────────────────────────────────────────────────────

  loadBoards(): void {
    this.isLoading.set(true);
    this.dashboardService.getMyBoards().subscribe({
      next: (response) => {
        this.allBoards.set(response.data);
        this.isLoading.set(false);
        // warm the task cache for every board
        this.loadTasksForAllBoards(response.data);
      },
      error: (error) => {
        this.toastService.error(error.error?.message ?? 'Failed to load boards');
        this.isLoading.set(false);
      },
    });
  }

  // loadBoards(): void {
  //   this.isLoading.set(true);
  //   this.dashboardService.getMyBoards().subscribe({
  //     next: (response) => {
  //       this.allBoards.set(response.data);
  //       this.isLoading.set(false);
  //       // warm the task cache for every board
  //       this.loadTasksForAllBoards(response.data);
  //     },
  //     error: (error) => {
  //       this.toastService.error(error.error?.message ?? 'Failed to load boards');
  //       this.isLoading.set(false);
  //     },
  //   });
  // }

  private loadTasksForAllBoards(boards: Board[]): void {
    boards.forEach((board) => {
      this.taskService.loadTasksForBoard(board.id).subscribe();
    });
  }

  isOwner(ownerId: number): boolean {
    return Number(this.authService.getUserData()?.id) === ownerId;
  }

  archiveBoard(event: { id: number; currentStatus: string }): void {
    const isArchived = event.currentStatus === 'archived';
    const request$ = isArchived
      ? this.dashboardService.unarchiveBoard(event.id)
      : this.dashboardService.archiveBoard(event.id);

    request$.subscribe({
      next: () => {
        this.toastService.success(isArchived ? 'Board unarchived' : 'Board archived');
        this.loadBoards();
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to update board status');
      },
    });
  }

  // private loadTasksForAllBoards(boards: Board[]): void {
  //   boards.forEach((board) => {
  //     this.taskService.loadTasksForBoard(board.id).subscribe();
  //   });
  // }
  // ─── Filter ────────────────────────────────────────────────────────────────

  setFilter(filter: TBoardStatus): void {
    this.selectedFilter.set(filter);
    // boards computed signal updates automatically — no extra call needed
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  openBoard(board: Board): void {
    this.router.navigate(['/app/board', board.id], {
      queryParams: { name: board.boardName },
    });
  }

  createBoard(): void {
    this.router.navigate(['/app/boards/new']);
  }

  editBoard(boardId: number): void {
    this.router.navigate(['/app/boards', boardId, 'edit']);
  }

  // ─── Task counts (still from TaskService until tasks API is wired) ─────────

  getTaskCount(boardId: number): Observable<number> {
    return this.taskService.getTotalTasks(boardId);
  }

  getProgress(boardId: number): Observable<number> {
    return combineLatest([
      this.taskService.getTotalTasks(boardId),
      this.taskService.getCompletedTasks(boardId),
    ]).pipe(map(([total, done]) => (total === 0 ? 0 : Math.round((done / total) * 100))));
  }
}
