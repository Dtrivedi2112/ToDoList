# TODO List App

Simple full-stack TODO list application built with Angular 21 and .NET 10 Web API. The API stores TODO items in memory for the life of the process.
<img width="3189" height="1611" alt="image" src="https://github.com/user-attachments/assets/419cfcfe-f573-4118-94a9-04d3dd856fb4" />

## Tech stack

- Frontend: Angular 21.2, standalone components, signals, Vitest-based Angular tests
- Backend: .NET 10 Web API, minimal APIs, in-memory repository
- Tests: xUnit endpoint/unit tests for the API and Angular component tests for the client

## Prerequisites

- .NET 10 SDK
- Node.js 22.12+ or another Node version supported by Angular 21
- npm

## Run the API

```powershell
dotnet restore
dotnet run --project backend/TodoList.Api/TodoList.Api.csproj --launch-profile http
```

The API runs at `http://localhost:5227`.

## Run the Angular app

From a second terminal:

```powershell
cd frontend
npm install
npm start
```

The Angular app runs at `http://localhost:4200`.

## Test

```powershell
dotnet test TodoListApp.slnx
cd frontend
npm test -- --watch=false
npm run build
```

## API endpoints

- `GET /api/todos` returns the current TODO list.
- `POST /api/todos` accepts `{ "title": "...", "priority": "Medium", "dueDate": null }` and creates a TODO item.
- `PUT /api/todos/{id}` updates title, completion status, priority, or due date.
- `DELETE /api/todos/{id}` deletes an existing TODO item.

## Features

- Add and delete TODO items.
- Mark items complete.
- Inline edit item titles.
- Filter by all, active, or completed.
- Set priority and optional due date.
- Undo the most recent delete.

## Notes

- Data is intentionally in memory. Restarting the API clears the TODO list.
- CORS is configured for the Angular dev server at `http://localhost:4200`.
- The frontend expects the API at `http://localhost:5227`.
