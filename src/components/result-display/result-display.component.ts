import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-result-display',
  templateUrl: './result-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultDisplayComponent {
  imageUrl = input.required<string>();
  startOver = output<void>();

  fullImageUrl = computed(() => `data:image/jpeg;base64,${this.imageUrl()}`);

  onStartOver(): void {
    this.startOver.emit();
  }
}
