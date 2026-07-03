import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Board } from '../../../core/services/dashboard/dashboard-service';

@Component({
  selector: 'app-board-card',
  imports: [],
  templateUrl: './board-card.html',
  styleUrl: './board-card.css',
})
export class BoardCard {
  @Input() board!: Board;
  @Input() totalTasks: number = 0;
  @Input() progress!: number;
  @Output() onClick = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<number>();
  @Input() isOwner!: boolean;
  @Output() onArchive = new EventEmitter<{ id: number; currentStatus: string }>();
  onEditClick(event: MouseEvent): void {
    event.stopPropagation();
    this.onEdit.emit(this.board.id);
  }



onArchiveClick(event: MouseEvent): void {
  event.stopPropagation();
  this.onArchive.emit({ id: this.board.id, currentStatus: this.board.status });
}
}
