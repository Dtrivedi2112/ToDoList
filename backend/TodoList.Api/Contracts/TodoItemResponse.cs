namespace TodoList.Api.Contracts;

public sealed record TodoItemResponse(
    Guid Id,
    string Title,
    bool IsCompleted,
    string Priority,
    DateTimeOffset? DueDate,
    DateTimeOffset CreatedAt);
