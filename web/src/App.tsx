import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import { useForm } from "react-hook-form";

type TodoTypes = {
  id: string;
  todo: string;
};

type AddTodoType = {
  todo: string;
  editTodoName: string;
};

console.log({env: import.meta.env})

function App() {
  const { register, handleSubmit, reset } = useForm<AddTodoType>();
  const [todos, setTodos] = useState<TodoTypes[]>([]);
  const [isEdit, setIsEdit] = useState({ id: "", todo: "" });

  const addTodo = async (event: AddTodoType) => {
    const { todo } = event;
    console.log(todo);
    await axios
      .post(`http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/add`, {
        data: {
          todo,
        },
      })
      .then((response) => {
        console.log(response.data);
        const todo = response.data;
        setTodos((preTodos) => [todo, ...preTodos]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteTodo = async (id: string) => {
    console.log(id);

    await axios
      .delete(`http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/delete`, {
        data: {
          id,
        },
      })
      .then((response) => {
        console.log(response);
        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
      })
      .catch((e) => {
        console.log(e.message);
        setTodos(todos);
      });
  };

  const editTodo = async ({ editTodoName }: AddTodoType) => {
    await axios
      .put(`http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/update`, {
        data: {
          id: isEdit.id,
          todo: editTodoName,
        },
      })
      .then((response) => {
        console.log(response.data);
        const newTodos = todos.map((todo) => {
          return todo.id === response.data.id ? response.data : todo;
        });
        setIsEdit({ id: "", todo: "" });
        setTodos(newTodos);
        reset();
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  useEffect(() => {
    axios.get(`http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}`).then((response) => {
      console.log(response.data.todos);
      const { todos } = response.data;
      setTodos(todos);
    });
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit(addTodo)}>
        <input {...register("todo")} type="text" />
        <button type="submit">add</button>
      </form>
      {todos.map((todo) => (
        <div key={todo.id} style={{ display: "flex" }}>
          {isEdit.id === todo.id ? (
            <form onSubmit={handleSubmit(editTodo)}>
              <input {...register("editTodoName")} type="text" />
              <button>send</button>
            </form>
          ) : (
            <>
              <p>{todo.todo}</p>
              <button
                onClick={() => setIsEdit({ id: todo.id, todo: todo.todo })}
              >
                edit
              </button>
            </>
          )}

          <button onClick={() => deleteTodo(todo.id)}>delete</button>
        </div>
      ))}
    </>
  );
}

export default App;
