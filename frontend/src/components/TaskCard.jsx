import React, { useState } from 'react';
import { Trash2, Calendar, ChevronDown, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       dot: 'bg-gray-400'    },
  { value: 'in_progress', label: 'In Progress',  dot: 'bg-indigo-500'  },
  { value: 'done',        label: 'Done',         dot: 'bg-emerald-500' },
];

const STATUS_STYLE = {
  todo:        'status-todo',
  in_progress: 'status-in-progress',
  done:        'status-done',
};

// Parse a YYYY-MM-DD string as local date (avoids UTC midnight timezone shift)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getDueDateMeta(task) {
  if (!task.due_date || task.status === 'done') return null;

  const dueDate  = parseLocalDate(task.due_date);
  const today    = new Date();
  today.setHours(0, 0, 0, 0);
  const in2Days  = new Date(today);
  in2Days.setDate(today.getDate() + 2);

  const label = 'Due ' + dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (task.is_overdue || dueDate < today) return { label, variant: 'overdue' };
  if (dueDate <= in2Days)                  return { label, variant: 'soon'    };
  return                                          { label, variant: 'normal'  };
}

const DUE_VARIANT = {
  overdue: 'text-red-600',
  soon:    'text-amber-600',
  normal:  'text-gray-400',
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const [changing,     setChanging]     = useState(false);
  const [statusError,  setStatusError]  = useState(null);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (newStatus === task.status) return;
    setChanging(true);
    setStatusError(null);
    try {
      await onStatusChange(task.id, newStatus);
    } catch (err) {
      setStatusError(err.message || 'Failed to update status');
      setTimeout(() => setStatusError(null), 3000);
    } finally {
      setChanging(false);
    }
  };

  const created  = new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dueMeta  = getDueDateMeta(task);
  const current  = STATUS_OPTIONS.find(o => o.value === task.status);

  return (
    <article className="card group flex flex-col gap-3 p-4 hover:border-indigo-100 transition-colors">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Due date — shown below description when present */}
          {dueMeta && (
            <p className={`flex items-center gap-1 text-[11px] font-medium mt-1.5 ${DUE_VARIANT[dueMeta.variant]}`}>
              {dueMeta.variant === 'overdue'
                ? <AlertCircle className="w-3 h-3 flex-shrink-0" />
                : <Calendar    className="w-3 h-3 flex-shrink-0" />
              }
              {dueMeta.label}
            </p>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer mt-0.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2">
        {/* Status select */}
        <div className="flex flex-col gap-1">
          <div className="relative flex items-center">
            <span className={`absolute left-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${current?.dot}`} />
            <select
              value={task.status}
              onChange={handleStatusChange}
              disabled={changing}
              aria-label="Change task status"
              className={`appearance-none pl-5 pr-6 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer transition-all disabled:opacity-50 ${STATUS_STYLE[task.status]}`}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 w-3 h-3 pointer-events-none text-current opacity-60" />
            {changing && (
              <span className="absolute right-6 w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin opacity-60" />
            )}
          </div>
          {statusError && (
            <p role="alert" className="text-[10px] text-red-500 leading-tight">{statusError}</p>
          )}
        </div>

        {/* Created date */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0">
          <Calendar className="w-3 h-3" />
          {created}
        </div>
      </div>
    </article>
  );
}
