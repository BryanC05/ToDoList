import React from 'react';
import { sanitizeInput } from '../utils/sanitize';

/**
 * Reusable TodoList component to reduce code duplication
 * Renders a list of tasks with drag-and-drop support
 * 
 * @param {string} title - Column title (To Do / Done)
 * @param {Array} tasks - Array of task objects
 * @param {string} listType - 'todo' or 'done'
 * @param {Function} onDragStart - Drag start handler
 * @param {Function} onDrop - Drop handler
 * @param {Function} onAction - Action handler (done/undo/delete)
 */
function TodoList({ title, tasks, listType, onDragStart, onDrop, onAction }) {
  const isDone = listType === 'done';
  
  return (
    <div 
      className="todo-list-column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(listType)}
    >
      <h2>{title}</h2>
      <ul id={`${listType}-list`}>
        {tasks.length === 0 ? (
          <li 
            className="empty-message" 
            style={{ color: '#888', fontStyle: 'italic', listStyle: 'none', padding: '10px' }}
          >
            No tasks
          </li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              draggable
              onDragStart={() => onDragStart(task, listType)}
              className={`todo-task ${isDone ? 'done' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* CRITICAL FIX 2: XSS Protection - Sanitize user input before rendering */}
                <span dangerouslySetInnerHTML={{ __html: sanitizeInput(task.text) }} />
                <span style={{ fontSize: '12px', color: '#888', marginLeft: '10px' }}>
                  {task.date}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                {isDone ? (
                  <>
                    <button 
                      className="bdn-small bdn-secondary" 
                      onClick={() => onAction('undo', task.id)}
                      aria-label={`Undo task: ${task.text}`}
                    >
                      Undo
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="bdn-small bdn-success" 
                      onClick={() => onAction('done', task.id)}
                      aria-label={`Mark done: ${task.text}`}
                    >
                      Done
                    </button>
                  </>
                )}
                <button 
                  className="bdn-small bdn-danger" 
                  onClick={() => onAction('delete', task.id, listType)}
                  aria-label={`Delete task: ${task.text}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default TodoList;
