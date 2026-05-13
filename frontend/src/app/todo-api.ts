import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type TodoPriority = 'Low' | 'Medium' | 'High';

export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TodoPriority;
  dueDate: string | null;
  createdAt: string;
}

export interface CreateTodoRequest {
  title: string;
  priority: TodoPriority;
  dueDate: string | null;
}

export interface UpdateTodoRequest {
  title?: string;
  isCompleted?: boolean;
  priority?: TodoPriority;
  dueDate?: string | null;
}

@Injectable({ providedIn: 'root' })
export class TodoApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5227/api/todos';

  getAll(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.baseUrl);
  }

  add(request: CreateTodoRequest): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.baseUrl, request);
  }

  update(id: string, request: UpdateTodoRequest): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
