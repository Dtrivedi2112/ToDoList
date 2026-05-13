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
      { id: '1', title: 'Write tests', createdAt: new Date().toISOString() }
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
    expect(request.request.body).toEqual({ title: 'Review PR' });

    request.flush({ id: '2', title: 'Review PR', createdAt: new Date().toISOString() });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Review PR');
  });
});
