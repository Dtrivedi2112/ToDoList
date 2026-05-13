import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should load todos from the API', () => {
    const fixture = TestBed.createComponent(App);
    const request = http.expectOne('http://localhost:5227/api/todos');

    request.flush([
      {
        id: '1',
        title: 'Write tests',
        isCompleted: false,
        priority: 'High',
        dueDate: null,
        createdAt: new Date().toISOString()
      }
    ]);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Write tests');
  });

  it('should create a todo', () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('http://localhost:5227/api/todos').flush([]);

    fixture.detectChanges();

    const component = fixture.componentInstance as unknown as {
      newTodoTitle: { set(value: string): void };
      addTodo(): void;
    };

    component.newTodoTitle.set('Review PR');
    component.addTodo();

    const request = http.expectOne('http://localhost:5227/api/todos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'Review PR', priority: 'Medium', dueDate: null });

    request.flush({
      id: '2',
      title: 'Review PR',
      isCompleted: false,
      priority: 'Medium',
      dueDate: null,
      createdAt: new Date().toISOString()
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Review PR');
  });

  it('should update completion status', () => {
    const fixture = TestBed.createComponent(App);
    const todo = {
      id: '3',
      title: 'Finish feature',
      isCompleted: false,
      priority: 'Medium',
      dueDate: null,
      createdAt: new Date().toISOString()
    };

    http.expectOne('http://localhost:5227/api/todos').flush([todo]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const checkbox = compiled.querySelector<HTMLInputElement>('.complete-checkbox');
    checkbox!.click();

    const request = http.expectOne('http://localhost:5227/api/todos/3');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      title: 'Finish feature',
      isCompleted: true,
      priority: 'Medium',
      dueDate: null
    });
    request.flush({ ...todo, isCompleted: true });
  });
});
