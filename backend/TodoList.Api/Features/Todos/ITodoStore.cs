namespace TodoList.Api.Features.Todos;

public interface ITodoStore
{
    IReadOnlyCollection<TodoItem> GetAll();

    TodoItem Add(string title, string priority, DateTimeOffset? dueDate);

    TodoItem? Update(Guid id, TodoUpdate update);

    bool Delete(Guid id);
}

public sealed record TodoUpdate(string? Title, bool? IsCompleted, string? Priority, DateTimeOffset? DueDate);
