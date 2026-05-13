namespace TodoList.Api.Features.Todos;

public sealed record TodoItem(
    Guid Id,
    string Title,
    bool IsCompleted,
    string Priority,
    DateTimeOffset? DueDate,
    DateTimeOffset CreatedAt);
