import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { User } from '../../../core/services/dashboard/dashboard-service';

@Component({
  selector: 'app-assignee-selector',
  imports: [],
  templateUrl: './assignee-selector.html',
  styleUrl: './assignee-selector.css',
})
export class AssigneeSelector {
  @Input() invitees: User[] = [];

  @Input() selectedUsers: User[] = [];
  
  @Output() selectedUsersChange = new EventEmitter<User[]>();

  dropdownOpen = signal(false);

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  addUser(user: User): void {
    const exists = this.selectedUsers.some(
      u => u.id === user.id
    );
  
    if (exists) return;
  
    this.selectedUsers = [...this.selectedUsers, user];
  
    this.selectedUsersChange.emit(
      this.selectedUsers
    );
  
    this.dropdownOpen.set(false);
  }

  removeUser(userId: number): void {
    this.selectedUsers =
      this.selectedUsers.filter(
        user => user.id !== userId
      );
  
    this.selectedUsersChange.emit(
      this.selectedUsers
    );
  }

  get availableInvitees(): User[] {
    return this.invitees.filter(
      invitee =>
        !this.selectedUsers.some(
          selected => selected.id === invitee.id
        )
    );
  }
}
