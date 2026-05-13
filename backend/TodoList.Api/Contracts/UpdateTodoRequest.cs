namespace TodoList.Api.Contracts;

public sealed record UpdateTodoRequest(
    string? Title,
    bool? IsCompleted,
    string? Priority,
    DateTimeOffset? DueDate);
