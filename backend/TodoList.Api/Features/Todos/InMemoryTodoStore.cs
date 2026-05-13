namespace TodoList.Api.Features.Todos;

public sealed class InMemoryTodoStore : ITodoStore
{
    private readonly Lock _lock = new();
    private readonly List<TodoItem> _items = [];

    public IReadOnlyCollection<TodoItem> GetAll()
    {
        lock (_lock)
        {
            return _items
                .OrderBy(item => item.CreatedAt)
                .ToArray();
        }
    }

    public TodoItem Add(string title)
    {
        var item = new TodoItem(Guid.NewGuid(), title, DateTimeOffset.UtcNow);

        lock (_lock)
        {
            _items.Add(item);
        }

        return item;
    }

    public bool Delete(Guid id)
    {
        lock (_lock)
        {
            var item = _items.FirstOrDefault(candidate => candidate.Id == id);

            if (item is null)
            {
                return false;
            }

            _items.Remove(item);
            return true;
        }
    }
}
