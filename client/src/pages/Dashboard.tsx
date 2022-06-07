import React, { FormEvent, useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState<any>({});
  const [todos, setTodos] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const getTodos = async function () {
      const token = localStorage.getItem("token")!;

      const decoded = jwt.decode(token);
      const res = await fetch(`http://localhost:5000/api/todos/`, {
        headers: {
          "x-access-token": token,
        },
      });
      const data = await res.json();
      setTodos(data.todos);
      setUser(decoded);
    };
    getTodos();
  }, []);

  const handleAddTodo = async function (e: FormEvent) {
    e.preventDefault();
    setTitle("");
    const token = localStorage.getItem("token")!;

    const res = await fetch(`http://localhost:5000/api/todos/`, {
      method: "POST",
      headers: {
        "x-access-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
      }),
    });
    const data = await res.json();

    setTodos([...todos, data.todos]);
  };

  const handleDeleteTodo = async function (id: string) {
    console.log(id);
    const token = localStorage.getItem("token")!;
    const res = await fetch("http://localhost:5000/api/todos/", {
      method: "DELETE",
      headers: {
        "x-access-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    });
    const data = await res.json();
    setTodos(todos.filter((todo) => todo._id !== id));
  };

  const signOut = function name() {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="d-flex justify-content-between">
      <div style={{ maxWidth: "300px" }} className="m-4">
        <form style={{ display: "flex" }} onSubmit={handleAddTodo}>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-primary ml-3">Add</button>
        </form>
        <ul className="list-group">
          {todos.map((todo: any) => (
            <li
              className="list-group-item d-flex justify-content-between"
              key={todo._id}
            >
              <span className="mt-2">{todo.title}</span>
              <button
                className="btn btn-danger float-right"
                onClick={() => handleDeleteTodo(todo._id)}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="d-flex">
        <h5 className="mt-4">Signed in as {user.name}</h5>
        <button
          className="btn btn-secondary m-4"
          style={{ height: "40px" }}
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
