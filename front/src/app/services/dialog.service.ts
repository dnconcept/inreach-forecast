import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressDialogComponent } from '../progress-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {

  constructor( private snack: MatSnackBar, private dialog: MatDialog ) {
  }

  async executeAsync<T>( asyncMethod: Promise<T>, {
    progressMsg
  }: { progressMsg?: string }
    = { progressMsg: 'Opération en cours' } ): Promise<T | undefined> {
    const ref = this.dialog.open(ProgressDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        message: progressMsg,
      }
    });
    try {
      const result = await asyncMethod;
      ref.close();
      return result;
    } catch (e) {
      ref.close();
      this.flashError(e);
    }
    return undefined;
  }

  flashInfo( message: string ) {
    return this.createFlash(message, 'info');
  }

  flashWarn( message: string ) {
    return this.createFlash(message, 'warn');
  }

  flashError( serverError: any ) {
    console.warn(serverError);
    const message = serverError.error ? serverError.error.message : serverError.message;
    return this.createFlash(message, 'warn');
  }

  private createFlash( message: string, type: 'info' | 'warn' ) {
    this.snack.open(message, type);
  }

}
