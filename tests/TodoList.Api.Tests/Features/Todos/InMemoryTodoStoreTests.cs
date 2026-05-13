using TodoList.Api.Features.Todos;

namespace TodoList.Api.Tests.Features.Todos;

public sealed class InMemoryTodoStoreTests
{
    [Fact]
    public void Add_stores_todo()
    {
        var store = new InMemoryTodoStore();

        var item = store.Add("Buy milk", "High", DateTimeOffset.UtcNow.Date);

        Assert.Equal("Buy milk", item.Title);
        Assert.Equal("High", item.Priority);
        Assert.False(item.IsCompleted);
        Assert.Collection(
            store.GetAll(),
            stored => Assert.Equal(item.Id, stored.Id));
    }

    [Fact]
    public void Update_changes_existing_todo()
    {
        var store = new InMemoryTodoStore();
        var item = store.Add("Draft", "Medium", null);

        var updated = store.Update(item.Id, new TodoUpdate("Ship it", true, "High", null));

        Assert.NotNull(updated);
        Assert.Equal("Ship it", updated.Title);
        Assert.True(updated.IsCompleted);
        Assert.Equal("High", updated.Priority);
    }

    [Fact]
    public void Delete_removes_existing_todo()
    {
        var store = new InMemoryTodoStore();
        var item = store.Add("Ship test", "Medium", null);

        var deleted = store.Delete(item.Id);

        Assert.True(deleted);
        Assert.Empty(store.GetAll());
    }

    [Fact]
    public void Delete_returns_false_for_unknown_todo()
    {
        var store = new InMemoryTodoStore();

        var deleted = store.Delete(Guid.NewGuid());

        Assert.False(deleted);
    }
}
