import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Clock, CheckCircle2, Circle, Pencil, Trash2, Calendar } from 'lucide-react';

const StatBadge = ({ icon: Icon, count, label, className }) => (
  <span className={`badge gap-1 ${className}`}>
    <Icon className="w-3 h-3" />
    {count} {label}
  </span>
);

export default function ProjectCard({ project, onDelete, onEdit }) {
  const total    = parseInt(project.total_tasks)        || 0;
  const done     = parseInt(project.done_count)         || 0;
  const todo     = parseInt(project.todo_count)         || 0;
  const inProg   = parseInt(project.in_progress_count)  || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const created = new Date(project.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <article className="card card-hover group flex flex-col cursor-default">
      {/* Card header */}
      <div className="p-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon + name */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Folder className="w-4.5 h-4.5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <Link
                to={`/projects/${project.id}`}
                className="block text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors truncate leading-tight"
              >
                {project.name}
              </Link>
              {project.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions (show on hover) */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onEdit(project)}
              aria-label="Edit project"
              className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(project)}
              aria-label="Delete project"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <StatBadge icon={Circle}       count={todo}   label="Todo"        className="status-todo" />
          <StatBadge icon={Clock}        count={inProg} label="In progress" className="status-in-progress" />
          <StatBadge icon={CheckCircle2} count={done}   label="Done"        className="status-done" />
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400 font-medium">{total} tasks total</span>
            <span className="text-xs font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {created}
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Open →
        </Link>
      </div>
    </article>
  );
}
