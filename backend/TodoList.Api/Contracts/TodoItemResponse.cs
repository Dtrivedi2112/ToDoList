namespace TodoList.Api.Contracts;

public sealed record TodoItemResponse(Guid Id, string Title, DateTimeOffset CreatedAt);
