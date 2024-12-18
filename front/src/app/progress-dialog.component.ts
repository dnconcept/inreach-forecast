import { Component, inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogContent } from '@angular/material/dialog';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-progress-dialog',
  template: `
    <mat-dialog-content>
      <p>{{ dialogData?.message }}</p>
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </mat-dialog-content>
  `,
  imports: [
    MatDialogContent,
    MatProgressBar
  ],
  standalone: true
})
export class ProgressDialogComponent {
  @Input() message: string;
  readonly dialogData = inject(MAT_DIALOG_DATA);
}
