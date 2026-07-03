import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  @Input() label = '';

  @Input() icon = '';
  @Input() iconClass = '';

  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Input() disabled = false;

  @Input() isLoading: boolean = false;

  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';

  @Input() padding = '0 24px';

  @Input() height = '56px';

  @Input() fullWidth = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() onClick = new EventEmitter<void>();

  onButtonClick(): void {
    this.onClick.emit();
  }
}
