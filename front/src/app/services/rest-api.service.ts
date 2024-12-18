import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RestApiService {

  api = `http://localhost:8000`;
  // api = `https://inreach-grib-api-459273175845.europe-west1.run.app`;

  constructor( private http: HttpClient ) {
  }

  async getAsync<T>( url: string, queryParams?: any ): Promise<T> {
    return firstValueFrom(this.get$<T>(url, queryParams));
  }

  get$<T>( url: string, queryParams?: any ): Observable<T> {
    return this.http.get<T>(`${this.api}${url}`, {
      params: queryParams,
    });
  }

  async postAsync<T>( url: string, body: any ): Promise<T> {
    return firstValueFrom(this.post$<T>(url, body));
  }

  post$<T>( url: string, body: any ): Observable<T> {
    return this.http.post<T>(`${this.api}${url}`, body);
  }

}
