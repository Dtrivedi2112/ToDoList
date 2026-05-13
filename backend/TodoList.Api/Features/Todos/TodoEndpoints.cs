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
            var title = request.Title?.Trim();

            if (string.IsNullOrWhiteSpace(title))
            {
                return Results.BadRequest(new { message = "Todo title is required." });
            }

            if (title.Length > 200)
            {
                return Results.BadRequest(new { message = "Todo title must be 200 characters or fewer." });
            }

            var item = store.Add(title);

            return Results.Created($"/api/todos/{item.Id}", ToResponse(item));
        });

        group.MapDelete("/{id:guid}", (Guid id, ITodoStore store) =>
            store.Delete(id) ? Results.NoContent() : Results.NotFound());

        return app;
    }

    private static TodoItemResponse ToResponse(TodoItem item) =>
        new(item.Id, item.Title, item.CreatedAt);
}
