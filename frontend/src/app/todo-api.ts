import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TodoItem {
  id: string;
  title: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TodoApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5227/api/todos';

  getAll(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.baseUrl);
  }

  add(title: string): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.baseUrl, { title });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
