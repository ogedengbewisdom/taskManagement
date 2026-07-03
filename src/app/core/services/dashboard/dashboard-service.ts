import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type TBoardStatus = 'active' | 'archived' | 'recent';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface IResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  status: string;
  timestamp: string;
}

export interface Board {
  id: number;
  boardName: string;
  status: TBoardStatus;
  invitees: User[];
  ownerId: number;
  createdAt: string;
}

export interface CreateBoardPayload {
  boardName: string;
}

export interface UpdateBoardPayload {
  boardName?: string;
  status?: 'active' | 'archived';
}

export interface AddMemberPayload {
  userId: number;
}

export interface RespondInvitePayload {
  status: 'accepted' | 'declined';
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/v1/boards`;

  // ─── Boards ────────────────────────────────────────────────────────────────

  getMyBoards(): Observable<IResponse<Board[]>> {
    return this.http.get<IResponse<Board[]>>(this.BASE);
  }

  getBoardById(boardId: number): Observable<IResponse<Board>> {
    return this.http.get<IResponse<Board>>(`${this.BASE}/${boardId}`);
  }

  createBoard(payload: CreateBoardPayload): Observable<IResponse<Board>> {
    return this.http.post<IResponse<Board>>(this.BASE, payload);
  }

  updateBoard(boardId: number, payload: UpdateBoardPayload): Observable<IResponse<Board>> {
    return this.http.patch<IResponse<Board>>(`${this.BASE}/${boardId}`, payload);
  }

  deleteBoard(boardId: number): Observable<IResponse<void>> {
    return this.http.delete<IResponse<void>>(`${this.BASE}/${boardId}`);
  }

  // ─── Members ───────────────────────────────────────────────────────────────

  getBoard(boardId: number): Observable<IResponse<Board>> {
    return this.http.get<IResponse<Board>>(`${this.BASE}/${boardId}`);
  }

  getBoardMembers(boardId: number): Observable<IResponse<User[]>> {
    return this.http.get<IResponse<User[]>>(`${this.BASE}/${boardId}/members`);
  }

  getUsers(boardId?: number): Observable<IResponse<{ users: User[]; total: number }>> {
    const params = boardId ? `?boardId=${boardId}` : '';
    return this.http.get<IResponse<{ users: User[]; total: number }>>(
      `${environment.apiUrl}/v1/users${params}`,
    );
  }

  addMember(boardId: number, payload: AddMemberPayload): Observable<IResponse<any>> {
    return this.http.post<IResponse<any>>(`${this.BASE}/${boardId}/members`, payload);
  }

  removeMember(boardId: number, userId: number): Observable<IResponse<void>> {
    return this.http.delete<IResponse<void>>(`${this.BASE}/${boardId}/members/${userId}`);
  }

  respondToInvite(boardId: number, payload: RespondInvitePayload): Observable<IResponse<any>> {
    return this.http.patch<IResponse<any>>(`${this.BASE}/${boardId}/members/respond`, payload);
  }

  reinvite(boardId: number, userId: number): Observable<IResponse<any>> {
    return this.http.post<IResponse<any>>(`${this.BASE}/${boardId}/members/${userId}/reinvite`, {});
  }

  // ─── Keep for components that still use invitees locally ──────────────────

  getInvitees(boardId: number): Observable<IResponse<User[]>> {
    return this.getBoardMembers(boardId);
  }

  archiveBoard(boardId: number): Observable<IResponse<void>> {
    return this.http.patch<IResponse<void>>(`${this.BASE}/${boardId}/archive`, {});
  }

  unarchiveBoard(boardId: number): Observable<IResponse<void>> {
    return this.http.patch<IResponse<void>>(`${this.BASE}/${boardId}/unarchive`, {});
  }
}
