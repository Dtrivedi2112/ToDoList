import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoApi, TodoItem } from './todo-api';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly todoApi = inject(TodoApi);

  protected readonly todos = signal<TodoItem[]>([]);
  protected readonly newTodoTitle = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly remainingCount = computed(() => this.todos().length);

  constructor() {
    this.loadTodos();
  }

  protected addTodo(): void {
    const title = this.newTodoTitle().trim();

    if (!title) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.todoApi.add(title).subscribe({
      next: todo => {
        this.todos.update(todos => [...todos, todo]);
        this.newTodoTitle.set('');
      },
      error: () => this.errorMessage.set('Unable to add the todo. Please try again.'),
      complete: () => this.isSaving.set(false)
    });
  }

  protected deleteTodo(todo: TodoItem): void {
    this.errorMessage.set(null);

    this.todoApi.delete(todo.id).subscribe({
      next: () => this.todos.update(todos => todos.filter(item => item.id !== todo.id)),
      error: () => this.errorMessage.set('Unable to delete the todo. Please try again.')
    });
  }

  protected trackById(_index: number, todo: TodoItem): string {
    return todo.id;
  }

  private loadTodos(): void {
    this.todoApi.getAll().subscribe({
      next: todos => this.todos.set(todos),
      error: () => this.errorMessage.set('Unable to load todos. Check that the API is running.'),
      complete: () => this.isLoading.set(false)
    });
  }
}
