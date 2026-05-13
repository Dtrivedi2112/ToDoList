namespace TodoList.Api.Features.Todos;

public sealed class InMemoryTodoStore : ITodoStore
{
    private readonly Lock _lock = new();
    private readonly List<TodoItem> _items = [];

    // Return a snapshot so callers cannot mutate the store's private list.
    public IReadOnlyCollection<TodoItem> GetAll()
    {
        lock (_lock)
        {
            return _items
                .OrderBy(item => item.CreatedAt)
                .ToArray();
        }
    }

    public TodoItem Add(string title, string priority, DateTimeOffset? dueDate)
    {
        var item = new TodoItem(Guid.NewGuid(), title, false, priority, dueDate, DateTimeOffset.UtcNow);

        lock (_lock)
        {
            _items.Add(item);
        }

        return item;
    }

    public TodoItem? Update(Guid id, TodoUpdate update)
    {
        lock (_lock)
        {
            var index = _items.FindIndex(candidate => candidate.Id == id);

            if (index < 0)
            {
                return null;
            }

            var existing = _items[index];
            var updated = existing with
            {
                Title = update.Title ?? existing.Title,
                IsCompleted = update.IsCompleted ?? existing.IsCompleted,
                Priority = update.Priority ?? existing.Priority,
                DueDate = update.DueDate
            };

            _items[index] = updated;
            return updated;
        }
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
