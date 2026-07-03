import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard/dashboard-service';
import { ToastService } from '../../core/services/toast/toast.service';

@Component({
  selector: 'app-invite-response',
  templateUrl: './invite-response.html',
  styleUrl: './invite-response.css',
})
export class InviteResponse implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(DashboardService);
  private toastService = inject(ToastService);

  boardId!: number;
  boardName = '';
  invitedBy = '';
  state = signal<'pending' | 'accepted' | 'declined'>('pending');
  isLoading = signal(false);

  ngOnInit(): void {
    this.boardId = Number(this.route.snapshot.paramMap.get('boardId'));
    this.boardName = this.route.snapshot.queryParamMap.get('boardName') ?? 'Board';
    this.invitedBy = this.route.snapshot.queryParamMap.get('invitedBy') ?? 'Someone';
  }

  respond(status: 'accepted' | 'declined'): void {
    this.isLoading.set(true);
    this.boardService.respondToInvite(this.boardId, { status }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success(status === 'accepted' ? 'Invite accepted' : 'Invite declined');

        if (status === 'accepted') {
          // show accepted state briefly then navigate
          this.state.set('accepted');
          // setTimeout(() => {
          //   this.router.navigate(['/app/dashboard']);
          // }, 1500);
        } else {
          this.state.set('declined');
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message ?? 'Failed to respond to invite');
        this.isLoading.set(false);
      },
    });
  }

  goToDashboard(): void {
    this.router.navigateByUrl(decodeURIComponent('/app/dashboard'));
  }
}
