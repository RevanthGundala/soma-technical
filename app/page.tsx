"use client"
import { useState, useEffect } from 'react';
import { calculateCriticalPath } from '../lib/graph';
import type { Todo } from '../lib/graph';
import DependencyGraph from './components/DependencyGraph';

export default function Home() {
  const [newTodo, setNewTodo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [dependencies, setDependencies] = useState<number[]>([]);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [criticalPath, setCriticalPath] = useState<number[]>([]);
  const [est, setEst] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
      const { criticalPath, est } = calculateCriticalPath(data);
      setCriticalPath(criticalPath);
      setEst(est);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, dueDate: newDueDate, dependencies }),
      });
      setNewTodo('');
      setNewDueDate('');
      setDependencies([]);
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleUpdateTodo = async () => {
    if (!editingTodoId || !newTodo.trim()) return;
    try {
      const res = await fetch(`/api/todos/${editingTodoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo, dueDate: newDueDate, dependencies }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error);
        return;
      }

      setNewTodo('');
      setNewDueDate('');
      setDependencies([]);
      setEditingTodoId(null);
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setNewTodo(todo.title);
    setNewDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '');
    setDependencies(todo.dependencies.map(dep => dep.id));
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setNewTodo('');
    setNewDueDate('');
    setDependencies([]);
  };

  const handleDeleteTodo = async (id:any) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-500 to-red-500 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Things To Do App</h1>
        <div className="flex mb-6">
          <input
            type="text"
            className="flex-grow p-3 rounded-l-full focus:outline-none text-gray-700"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          
          />
          <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="p-3 focus:outline-none text-gray-700" />
          {editingTodoId ? (
            <>
              <button
                onClick={handleUpdateTodo}
                className="bg-green-500 text-white p-3 rounded-r-full hover:bg-green-600 transition duration-300"
              >
                Update
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white p-3 ml-2 rounded-full hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddTodo}
              className="bg-white text-indigo-600 p-3 rounded-r-full hover:bg-gray-100 transition duration-300"
            >
              Add
            </button>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="dependencies" className="block text-white mb-2">Dependencies</label>
          <select
            multiple
            id="dependencies"
            name="dependencies"
            className="w-full p-2 rounded"
            value={dependencies.map(String)}
            onChange={(e) => setDependencies(Array.from(e.target.selectedOptions, option => Number(option.value)))}
          >
            {todos.map(todo => (
              <option key={todo.id} value={todo.id}>{todo.title}</option>
            ))}
          </select>
        </div>
        <ul>
          {todos.map((todo: Todo) => (
            <li
              key={todo.id}
              className={`flex justify-between items-center bg-white bg-opacity-90 p-4 mb-4 rounded-lg shadow-lg ${criticalPath.includes(todo.id) ? 'border-2 border-red-500' : ''}`}
            >
              <div>
                <span className="text-gray-800">{todo.title}</span>
                <p className="text-sm text-gray-600">
                  Earliest Start: Day {est.get(todo.id)}
                </p>
                {todo.imageUrl && (
                  <img src={todo.imageUrl} alt={todo.title} className="w-32 h-32 object-cover rounded-md mt-2" />
                )}
                {todo.dependencies && todo.dependencies.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-bold">Dependencies:</h4>
                    <ul className="list-disc list-inside">
                      {todo.dependencies.map(dep => (
                        <li key={dep.id} className="text-sm">{dep.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="text-right">
                {todo.dueDate && (
                  <span className={`text-sm ${new Date(todo.dueDate) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </span>
                )}
                <button
                  onClick={() => handleEditClick(todo)}
                  className="text-blue-500 hover:text-blue-700 transition duration-300 mt-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition duration-300 mt-2"
                >
                  {/* Delete Icon */}
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
        <DependencyGraph todos={todos} criticalPath={criticalPath} />
      </div>
    </div>
  );
}
