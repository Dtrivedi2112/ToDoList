using TodoList.Api.Features.Todos;

namespace TodoList.Api.Tests.Features.Todos;

public sealed class InMemoryTodoStoreTests
{
    [Fact]
    public void Add_stores_todo()
    {
        var store = new InMemoryTodoStore();

        var item = store.Add("Buy milk");

        Assert.Equal("Buy milk", item.Title);
        Assert.Collection(
            store.GetAll(),
            stored => Assert.Equal(item.Id, stored.Id));
    }

    [Fact]
    public void Delete_removes_existing_todo()
    {
        var store = new InMemoryTodoStore();
        var item = store.Add("Ship test");

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
