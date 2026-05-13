using TodoList.Api.Contracts;

namespace TodoList.Api.Features.Todos;

public static class TodoEndpoints
{
    public static IEndpointRouteBuilder MapTodoEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/todos")
            .WithTags("Todos");

        group.MapGet("/", (ITodoStore store) =>
            Results.Ok(store.GetAll().Select(ToResponse)));

        group.MapPost("/", (CreateTodoRequest request, ITodoStore store) =>
        {
            var validation = ValidateTodoInput(request.Title, request.Priority);
            if (validation.ErrorMessage is not null)
            {
                return Results.BadRequest(new { message = validation.ErrorMessage });
            }

            var item = store.Add(validation.Title!, validation.Priority!, request.DueDate);

            return Results.Created($"/api/todos/{item.Id}", ToResponse(item));
        });

        group.MapPut("/{id:guid}", (Guid id, UpdateTodoRequest request, ITodoStore store) =>
        {
            var validation = ValidateTodoInput(request.Title, request.Priority, allowMissingTitle: true);
            if (validation.ErrorMessage is not null)
            {
                return Results.BadRequest(new { message = validation.ErrorMessage });
            }

            var update = new TodoUpdate(
                validation.Title,
                request.IsCompleted,
                validation.Priority,
                request.DueDate);

            var item = store.Update(id, update);

            return item is null ? Results.NotFound() : Results.Ok(ToResponse(item));
        });

        group.MapDelete("/{id:guid}", (Guid id, ITodoStore store) =>
            store.Delete(id) ? Results.NoContent() : Results.NotFound());

        return app;
    }

    private static TodoItemResponse ToResponse(TodoItem item) =>
        new(item.Id, item.Title, item.IsCompleted, item.Priority, item.DueDate, item.CreatedAt);

    private static TodoInputValidation ValidateTodoInput(
        string? title,
        string? priority,
        bool allowMissingTitle = false)
    {
        var normalizedTitle = title?.Trim();
        var normalizedPriority = NormalizePriority(priority, defaultWhenMissing: !allowMissingTitle);

        if (!allowMissingTitle && string.IsNullOrWhiteSpace(normalizedTitle))
        {
            return new TodoInputValidation(null, null, "Todo title is required.");
        }

        if (normalizedTitle?.Length > 200)
        {
            return new TodoInputValidation(null, null, "Todo title must be 200 characters or fewer.");
        }

        if (!string.IsNullOrWhiteSpace(priority) && normalizedPriority is null)
        {
            return new TodoInputValidation(null, null, "Priority must be Low, Medium, or High.");
        }

        return new TodoInputValidation(normalizedTitle, normalizedPriority, null);
    }

    private static string? NormalizePriority(string? priority, bool defaultWhenMissing)
    {
        if (string.IsNullOrWhiteSpace(priority))
        {
            return defaultWhenMissing ? "Medium" : null;
        }

        return priority.Trim().ToLowerInvariant() switch
        {
            "low" => "Low",
            "medium" => "Medium",
            "high" => "High",
            _ => null
        };
    }

    private sealed record TodoInputValidation(string? Title, string? Priority, string? ErrorMessage);
}
