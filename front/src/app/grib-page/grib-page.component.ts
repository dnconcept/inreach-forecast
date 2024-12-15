import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-grib-page',
  imports: [
    JsonPipe,
    NgIf,
    FormsModule
  ],
  templateUrl: './grib-page.component.html',
  styleUrl: './grib-page.component.scss',
  standalone: true,
})
export class GribPageComponent {

  api = `http://localhost:8000`;
  message: { encoded: string } & any;
  encodedMessage: string;
  decodedMessage: string;

  constructor( private http: HttpClient ) {
  }

  setFile( event: Event ) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.send(file);
      console.info('[GribPageComponent] setFile', target, target.files);
    } else {
      console.warn('[GribPageComponent] No file selected');
    }
  }

  private send(file: File) {
    const { api } = this;
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<{ message: any }>(`${api}/process_grib`, formData).subscribe({
      next: ( { message }) => {
        this.message = message;
        this.encodedMessage = message.encoded;
      },
      error: (error) => console.error('[GribPageComponent] Error sending file', error),
    });
  }

}
