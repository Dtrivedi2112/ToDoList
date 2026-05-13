using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoList.Api.Contracts;

namespace TodoList.Api.Tests.Features.Todos;

public sealed class TodoEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TodoEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Post_creates_todo_and_get_returns_it()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("  Buy sourdough  ", "High"));

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var created = await createResponse.Content.ReadFromJsonAsync<TodoItemResponse>();
        Assert.NotNull(created);
        Assert.Equal("Buy sourdough", created.Title);
        Assert.Equal("High", created.Priority);
        Assert.False(created.IsCompleted);

        var todos = await _client.GetFromJsonAsync<TodoItemResponse[]>("/api/todos");

        Assert.Contains(todos!, todo => todo.Id == created.Id);
    }

    [Fact]
    public async Task Post_rejects_blank_title()
    {
        var response = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest(" "));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_removes_existing_todo()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Delete me"));
        var created = await createResponse.Content.ReadFromJsonAsync<TodoItemResponse>();

        var deleteResponse = await _client.DeleteAsync($"/api/todos/{created!.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Put_updates_existing_todo()
    {
        var createResponse = await _client.PostAsJsonAsync("/api/todos", new CreateTodoRequest("Update me"));
        var created = await createResponse.Content.ReadFromJsonAsync<TodoItemResponse>();

        var updateResponse = await _client.PutAsJsonAsync(
            $"/api/todos/{created!.Id}",
            new UpdateTodoRequest("Updated title", true, "Low", null));

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var updated = await updateResponse.Content.ReadFromJsonAsync<TodoItemResponse>();
        Assert.NotNull(updated);
        Assert.Equal("Updated title", updated.Title);
        Assert.True(updated.IsCompleted);
        Assert.Equal("Low", updated.Priority);
    }
}
