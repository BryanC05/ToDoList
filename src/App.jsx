import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import { sanitizeInput } from './utils/sanitize';

// LocalStorage key
const STORAGE_KEY = 'todolist-tasks';

// Input validation constants
const MAX_INPUT_LENGTH = 100;

/**
 * Loads tasks from localStorage
 * @returns {Object} - { todoTasks: [], doneTasks: [] }
 */
function loadTasksFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load tasks from localStorage:', error);
  }
  return { todoTasks: [], doneTasks: [] };
}

/**
 * Saves tasks to localStorage
 * @param {Array} todoTasks 
 * @param {Array} doneTasks 
 */
function saveTasksToStorage(todoTasks, doneTasks) {
  try {
    const data = JSON.stringify({ todoTasks, doneTasks });
    localStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}

/**
 * Validates that the date is not in the past
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if date is valid (today or future)
 */
function isValidDate(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateStr);
  return selectedDate >= today;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string}
 */
function getTodayDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function App() {
  // CRITICAL FIX 1: Load initial state from localStorage
  const initialTasks = loadTasksFromStorage();
  const [todoTasks, setTodoTasks] = useState(initialTasks.todoTasks);
  const [doneTasks, setDoneTasks] = useState(initialTasks.doneTasks);
  
  const [input, setInput] = useState('');
  const [date, setDate] = useState(getTodayDate);
  const [error, setError] = useState('');
  const [isPastDateWarning, setIsPastDateWarning] = useState(false);
  
  const dragTask = useRef();
  const dragFrom = useRef();

  // CRITICAL FIX 1: Save to localStorage whenever tasks change
  useEffect(() => {
    saveTasksToStorage(todoTasks, doneTasks);
  }, [todoTasks, doneTasks]);

  // HIGH FIX 5: Date validation - check when date changes
  useEffect(() => {
    if (date && !isValidDate(date)) {
      setIsPastDateWarning(true);
      setError('Warning: Selected date is in the past');
    } else {
      setIsPastDateWarning(false);
      setError('');
    }
  }, [date]);

  // HIGH FIX 3: Input validation with max length and empty check
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    
    // Enforce max length
    if (value.length > MAX_INPUT_LENGTH) {
      setError(`Task must be ${MAX_INPUT_LENGTH} characters or less`);
      return;
    }
    
    // Clear error if input is valid
    if (error && value.length <= MAX_INPUT_LENGTH) {
      setError('');
    }
    
    setInput(value);
  }, [error]);

  // CRITICAL FIX 2 + HIGH FIX 3: Sanitize and validate before adding
  const addTask = useCallback(() => {
    const trimmed = input.trim();
    
    // Input validation
    if (!trimmed) {
      setError('Task cannot be empty');
      return;
    }
    
    // HIGH FIX 5: Check date validity
    if (!isValidDate(date)) {
      setError('Cannot create task with past date. Please select today or a future date.');
      return;
    }
    
    // CRITICAL FIX 2: Sanitize input (done in rendering, but we store raw for flexibility)
    try {
      setTodoTasks(prev => [...prev, { 
        text: trimmed, 
        date, 
        id: Date.now() 
      }]);
      setInput('');
      setError('');
    } catch (err) {
      setError('Failed to add task. Please try again.');
      console.error('Error adding task:', err);
    }
  }, [input, date, error]);

  // HIGH FIX 4: Error handling with try-catch
  const deleteTask = useCallback((id, from) => {
    try {
      if (from === 'todo') {
        setTodoTasks(prev => prev.filter(t => t.id !== id));
      } else {
        setDoneTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    }
  }, []);

  // HIGH FIX 4: Error handling with try-catch
  const markDone = useCallback((id) => {
    try {
      setTodoTasks(prev => {
        const task = prev.find(t => t.id === id);
        if (task) {
          setDoneTasks(done => [...done, task]);
          return prev.filter(t => t.id !== id);
        }
        return prev;
      });
    } catch (err) {
      setError('Failed to mark task as done. Please try again.');
      console.error('Error marking task as done:', err);
    }
  }, []);

  // HIGH FIX 4: Error handling with try-catch
  const markUndone = useCallback((id) => {
    try {
      setDoneTasks(prev => {
        const task = prev.find(t => t.id === id);
        if (task) {
          setTodoTasks(todo => [...todo, task]);
          return prev.filter(t => t.id !== id);
        }
        return prev;
      });
    } catch (err) {
      setError('Failed to undo task. Please try again.');
      console.error('Error marking task as undone:', err);
    }
  }, []);

  // HIGH FIX 4: Error handling for clear all
  const clearAll = useCallback(() => {
    try {
      setTodoTasks([]);
      setDoneTasks([]);
      setError('');
    } catch (err) {
      setError('Failed to clear tasks. Please try again.');
      console.error('Error clearing tasks:', err);
    }
  }, []);

  // Unified action handler for child component
  const handleTaskAction = useCallback((action, id, listType) => {
    switch (action) {
      case 'delete':
        deleteTask(id, listType);
        break;
      case 'done':
        markDone(id);
        break;
      case 'undo':
        markUndone(id);
        break;
      default:
        break;
    }
  }, [deleteTask, markDone, markUndone]);

  // Drag and drop handlers
  const onDragStart = useCallback((task, from) => {
    dragTask.current = task;
    dragFrom.current = from;
  }, []);

  const onDrop = useCallback((to) => {
    try {
      const task = dragTask.current;
      const from = dragFrom.current;
      
      if (!task || from === to) return;
      
      if (from === 'todo' && to === 'done') {
        markDone(task.id);
      }
      if (from === 'done' && to === 'todo') {
        markUndone(task.id);
      }
      
      dragTask.current = null;
      dragFrom.current = null;
    } catch (err) {
      setError('Failed to move task. Please try again.');
      console.error('Error in drag and drop:', err);
    }
  }, [markDone, markUndone]);

  // Handle Enter key to add task
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  }, [addTask]);

  return (
    <div className="todo-container">
      <h1 className="accent">To Do List</h1>
      
      {/* Error display */}
      {error && (
        <div className={`error-message ${isPastDateWarning ? 'warning' : 'error'}`} style={{
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '4px',
          backgroundColor: isPastDateWarning ? '#fff3cd' : '#f8d7da',
          color: isPastDateWarning ? '#856404' : '#721c24',
          border: `1px solid ${isPastDateWarning ? '#ffc107' : '#f5c6cb'}`
        }}>
          {error}
        </div>
      )}
      
      <div className="input-group">
        <input
          id='task-input'
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={`Add a new task... (max ${MAX_INPUT_LENGTH} chars)`}
          maxLength={MAX_INPUT_LENGTH}
          disabled={isPastDateWarning}
          aria-label="Task input"
        />
        <input
          id='pick-date'
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Task due date"
        />
        <button 
          className="accent" 
          onClick={addTask}
          disabled={!input.trim() || isPastDateWarning}
          aria-label="Add task"
        >
          Add
        </button>
        <button 
          className="accent" 
          style={{ marginLeft: 10 }} 
          onClick={clearAll}
          disabled={todoTasks.length === 0 && doneTasks.length === 0}
          aria-label="Clear all tasks"
        >
          Clear All
        </button>
      </div>
      
      <div className="todo-columns">
        {/* MEDIUM FIX 6: Extracted reusable component */}
        <TodoList
          title="To Do"
          tasks={todoTasks}
          listType="todo"
          onDragStart={onDragStart}
          onDrop={onDrop}
          onAction={handleTaskAction}
        />

        <TodoList
          title="Done"
          tasks={doneTasks}
          listType="done"
          onDragStart={onDragStart}
          onDrop={onDrop}
          onAction={handleTaskAction}
        />
      </div>
    </div>
  );
}

export default App;
