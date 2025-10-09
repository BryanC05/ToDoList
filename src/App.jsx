
import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [todoTasks, setTodoTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [input, setInput] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const dragTask = useRef();
  const dragFrom = useRef();

  const addTask = () => {
    if (!input.trim()) return;
    setTodoTasks([...todoTasks, { text: input, date, id: Date.now() }]);
    setInput('');
  };

  const deleteTask = (id, from) => {
    if (from === 'todo') setTodoTasks(todoTasks.filter(t => t.id !== id));
    else setDoneTasks(doneTasks.filter(t => t.id !== id));
  };

  const markDone = (id) => {
    const task = todoTasks.find(t => t.id === id);
    if (task) {
      setTodoTasks(todoTasks.filter(t => t.id !== id));
      setDoneTasks([...doneTasks, task]);
    }
  };

  const markUndone = (id) => {
    const task = doneTasks.find(t => t.id === id);
    if (task) {
      setDoneTasks(doneTasks.filter(t => t.id !== id));
      setTodoTasks([...todoTasks, task]);
    }
  };

  // Drag and drop handlers
  const onDragStart = (task, from) => {
    dragTask.current = task;
    dragFrom.current = from;
  };
  const onDrop = (to) => {
    const task = dragTask.current;
    const from = dragFrom.current;
    if (!task || from === to) return;
    if (from === 'todo' && to === 'done') markDone(task.id);
    if (from === 'done' && to === 'todo') markUndone(task.id);
    dragTask.current = null;
    dragFrom.current = null;
  };

  return (
    <div className="todo-container">
      <h1 className="accent">To Do List</h1>
      <div className="input-group">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..."
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button className="accent" onClick={addTask}>Add</button>
        <button className="accent" style={{ marginLeft: 10 }} onClick={() => { setTodoTasks([]); setDoneTasks([]); }}>Clear All</button>
      </div>
      <div className="todo-columns">
        <div className="todo-list-column"
          onDragOver={e => e.preventDefault()}
          onDrop={() => onDrop('todo')}
        >
          <h2>To Do</h2>
          <ul id="todo-list">
            {todoTasks.map(task => (
              <li
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task, 'todo')}
                className="todo-task"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={false}
                    title="Mark as done"
                    onChange={() => markDone(task.id)}
                  />
                  <span style={{ marginRight: '10px', color: '#1565c0' }}>{task.date}</span>
                </div>
                <div style={{ flex: 1, marginLeft: '10px', wordBreak: 'break-word' }}>{task.text}</div>
                <button className="delete-btn" onClick={() => deleteTask(task.id, 'todo')}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="todo-list-column"
          onDragOver={e => e.preventDefault()}
          onDrop={() => onDrop('done')}
        >
          <h2>Done</h2>
          <ul id="done-list">
            {doneTasks.map(task => (
              <li
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task, 'done')}
                className="todo-task done"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={true}
                    title="Mark as undone"
                    onChange={() => markUndone(task.id)}
                  />
                  <span style={{ marginRight: '10px', color: '#1565c0' }}>{task.date}</span>
                </div>
                <div style={{ flex: 1, marginLeft: '10px', wordBreak: 'break-word' }}>{task.text}</div>
                <button className="delete-btn" onClick={() => deleteTask(task.id, 'done')}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
