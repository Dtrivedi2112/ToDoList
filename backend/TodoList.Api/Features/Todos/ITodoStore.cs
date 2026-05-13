namespace TodoList.Api.Features.Todos;

public interface ITodoStore
{
    IReadOnlyCollection<TodoItem> GetAll();

    TodoItem Add(string title);

    bool Delete(Guid id);
}
