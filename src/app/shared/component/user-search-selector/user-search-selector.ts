import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/services/dashboard/dashboard-service';

@Component({
  selector: 'app-user-search-selector',
  imports: [FormsModule],
  templateUrl: './user-search-selector.html',
  styleUrl: './user-search-selector.css',
})
export class UserSearchSelector {
  @Input() allUsers: User[] = [];
  @Input() selectedUsers: User[] = [];
  @Output() selectedUsersChange = new EventEmitter<User[]>();
  @Output() userAdded = new EventEmitter<User>();

  dropdownOpen = signal(false);
  searchTerm = signal('');

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
    if (!this.dropdownOpen()) {
      this.searchTerm.set('');
    }
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
    this.searchTerm.set('');
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  // Users not yet selected, filtered by the current search term.
  get filteredUsers(): User[] {
    const term = this.searchTerm().trim().toLowerCase();

    const available = this.allUsers.filter(
      (user) => !this.selectedUsers.some((selected) => selected.id === user.id),
    );

    if (!term) return available;

    return available.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(term),
    );
  }

  addUser(user: User): void {
    const exists = this.selectedUsers.some((u) => u.id === user.id);
    if (exists) return;

    this.selectedUsers = [...this.selectedUsers, user];
    this.selectedUsersChange.emit(this.selectedUsers);
    this.userAdded.emit(user);
    this.searchTerm.set('');
    this.closeDropdown();
  }

  removeUser(userId: number): void {
    this.selectedUsers = this.selectedUsers.filter((user) => user.id !== userId);
    this.selectedUsersChange.emit(this.selectedUsers);
  }
}
