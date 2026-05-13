namespace TodoList.Api.Contracts;

public sealed record CreateTodoRequest(string? Title, string? Priority = null, DateTimeOffset? DueDate = null);
