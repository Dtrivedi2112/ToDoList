import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoApi, TodoItem, TodoPriority } from './todo-api';

type TodoFilter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly todoApi = inject(TodoApi);

  protected readonly priorities: TodoPriority[] = ['Low', 'Medium', 'High'];
  protected readonly filters: { label: string; value: TodoFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' }
  ];

  protected readonly todos = signal<TodoItem[]>([]);
  protected readonly newTodoTitle = signal('');
  protected readonly newTodoPriority = signal<TodoPriority>('Medium');
  protected readonly newTodoDueDate = signal('');
  protected readonly activeFilter = signal<TodoFilter>('all');
  protected readonly editingTodoId = signal<string | null>(null);
  protected readonly editingTitle = signal('');
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly undoTodo = signal<TodoItem | null>(null);

  protected readonly activeCount = computed(() => this.todos().filter(todo => !todo.isCompleted).length);
  protected readonly completedCount = computed(() => this.todos().filter(todo => todo.isCompleted).length);
  protected readonly filteredTodos = computed(() => {
    const todos = [...this.todos()].sort(this.sortTodos);

    return todos.filter(todo => {
      if (this.activeFilter() === 'active') {
        return !todo.isCompleted;
      }

      if (this.activeFilter() === 'completed') {
        return todo.isCompleted;
      }

      return true;
    });
  });

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

    this.todoApi.add({
      title,
      priority: this.newTodoPriority(),
      dueDate: this.toApiDueDate(this.newTodoDueDate())
    }).subscribe({
      next: todo => {
        this.todos.update(todos => [...todos, todo]);
        this.newTodoTitle.set('');
        this.newTodoDueDate.set('');
      },
      error: () => this.errorMessage.set('Unable to add the todo. Please try again.'),
      complete: () => this.isSaving.set(false)
    });
  }

  protected toggleCompleted(todo: TodoItem): void {
    this.updateTodo(todo, { isCompleted: !todo.isCompleted }, 'Unable to update the todo.');
  }

  protected startEditing(todo: TodoItem): void {
    this.editingTodoId.set(todo.id);
    this.editingTitle.set(todo.title);
  }

  protected saveEdit(todo: TodoItem): void {
    const title = this.editingTitle().trim();

    if (!title) {
      return;
    }

    this.updateTodo(todo, { title }, 'Unable to rename the todo.', () => {
      this.editingTodoId.set(null);
      this.editingTitle.set('');
    });
  }

  protected cancelEdit(): void {
    this.editingTodoId.set(null);
    this.editingTitle.set('');
  }

  protected changePriority(todo: TodoItem, priority: TodoPriority): void {
    this.updateTodo(todo, { priority }, 'Unable to update priority.');
  }

  protected deleteTodo(todo: TodoItem): void {
    this.errorMessage.set(null);

    this.todoApi.delete(todo.id).subscribe({
      next: () => {
        this.todos.update(todos => todos.filter(item => item.id !== todo.id));
        this.undoTodo.set(todo);
      },
      error: () => this.errorMessage.set('Unable to delete the todo. Please try again.')
    });
  }

  protected undoDelete(): void {
    const todo = this.undoTodo();

    if (!todo) {
      return;
    }

    this.todoApi.add({
      title: todo.title,
      priority: todo.priority,
      dueDate: todo.dueDate
    }).subscribe({
      next: restored => {
        this.todos.update(todos => [...todos, restored]);
        this.undoTodo.set(null);
      },
      error: () => this.errorMessage.set('Unable to restore the deleted todo.')
    });
  }

  protected setFilter(filter: TodoFilter): void {
    this.activeFilter.set(filter);
  }

  protected formatDueDate(dueDate: string | null): string {
    if (!dueDate) {
      return 'No due date';
    }

    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dueDate));
  }

  protected trackById(_index: number, todo: TodoItem): string {
    return todo.id;
  }

  private updateTodo(
    todo: TodoItem,
    update: Parameters<TodoApi['update']>[1],
    errorMessage: string,
    onSuccess?: () => void): void {
    this.errorMessage.set(null);

    const request = {
      title: update.title ?? todo.title,
      isCompleted: update.isCompleted ?? todo.isCompleted,
      priority: update.priority ?? todo.priority,
      dueDate: update.dueDate === undefined ? todo.dueDate : update.dueDate
    };

    this.todoApi.update(todo.id, request).subscribe({
      next: updated => {
        this.todos.update(todos => todos.map(item => item.id === updated.id ? updated : item));
        onSuccess?.();
      },
      error: () => this.errorMessage.set(errorMessage)
    });
  }

  private loadTodos(): void {
    this.todoApi.getAll().subscribe({
      next: todos => this.todos.set(todos),
      error: () => this.errorMessage.set('Unable to load todos. Check that the API is running.'),
      complete: () => this.isLoading.set(false)
    });
  }

  private toApiDueDate(value: string): string | null {
    return value ? `${value}T00:00:00Z` : null;
  }

  private readonly sortTodos = (first: TodoItem, second: TodoItem): number => {
    const priorityOrder: Record<TodoPriority, number> = { High: 0, Medium: 1, Low: 2 };
    const completionOrder = Number(first.isCompleted) - Number(second.isCompleted);

    if (completionOrder !== 0) {
      return completionOrder;
    }

    const priorityDifference = priorityOrder[first.priority] - priorityOrder[second.priority];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
  };
}
