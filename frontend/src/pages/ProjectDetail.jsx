import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Sparkles, X, AlertTriangle, CheckCircle2,
  Clock, Circle, RefreshCw, Pencil,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import useTasks from '../hooks/useTasks';
import api from '../api/axios';
import { sanitizeFormData } from '../utils/sanitize';

/* ─── Filter tab ────────────────────────────────────────────────── */
const TAB_CONFIG = [
  { key: 'all',         label: 'All',         Icon: null         },
  { key: 'todo',        label: 'To Do',       Icon: Circle       },
  { key: 'in_progress', label: 'In Progress', Icon: Clock        },
  { key: 'done',        label: 'Done',        Icon: CheckCircle2 },
];

const FilterTab = ({ tab, active, count, onClick }) => {
  const { Icon } = tab;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {tab.label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );
};

/* ─── Skeleton tasks ────────────────────────────────────────────── */
const SkeletonTask = () => (
  <div className="card p-4 space-y-2 animate-pulse">
    <div className="flex gap-2">
      <div className="flex-1 h-4 bg-gray-100 rounded-lg" />
      <div className="w-4 h-4 bg-gray-100 rounded" />
    </div>
    <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
    <div className="flex gap-2 items-center justify-between">
      <div className="h-5 w-20 bg-gray-100 rounded-full" />
      <div className="h-3 w-16 bg-gray-100 rounded" />
    </div>
  </div>
);

/* ─── Add Task Modal ────────────────────────────────────────────── */
const today = new Date().toISOString().split('T')[0];

const AddTaskModal = ({ onClose, onSubmit, loading, error }) => {
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [status,  setStatus]  = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [titleErr, setErr]    = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setErr('Task title is required.'); return; }
    onSubmit({
      title:       title.trim(),
      description: desc.trim(),
      status,
      due_date:    dueDate || null,
    });
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="task-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="task-modal-title" className="text-base font-bold text-gray-900">Add Task</h2>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-500" aria-hidden>*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErr(''); }}
              placeholder="e.g. Design the homepage"
              maxLength={300}
              className={`input-field ${titleErr ? 'input-error' : ''}`}
              autoFocus
            />
            {titleErr && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {titleErr}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="Any additional details…"
              className="input-field resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="task-status" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Initial status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="input-field bg-white cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Due date */}
          <div>
            <label htmlFor="task-due" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Due date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              min={today}
              onChange={e => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</>
              ) : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Delete Task Confirm ────────────────────────────────────────── */
const DeleteTaskConfirm = ({ onClose, onConfirm, loading, error }) => (
  <div role="dialog" aria-modal="true" aria-labelledby="del-task-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-sm animate-scale-in p-6">
      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <h2 id="del-task-title" className="text-base font-bold text-gray-900 mb-2">Delete task?</h2>
      <p className="text-sm text-gray-500 mb-4">This task will be permanently deleted. This cannot be undone.</p>
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 mb-4">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1">
          {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting…</> : 'Yes, delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ─── AI Summary Panel ──────────────────────────────────────────── */
const AiPanel = ({ state, data, error, onClose, onRetry, onRefresh }) => {
  if (state === 'idle') return null;

  return (
    <div className="animate-slide-up">
      {state === 'loading' && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-900">Analyzing your tasks…</p>
            <div className="mt-2 space-y-1.5">
              {[100, 80, 60].map(w => (
                <div key={w} className="skeleton h-2.5 rounded-full" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900 mb-1">AI analysis failed</p>
            <p className="text-xs text-red-600 mb-3">{error}</p>
            <button onClick={onRetry} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
          <button onClick={onClose} aria-label="Dismiss" className="p-1 text-red-400 hover:text-red-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {state === 'success' && (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-indigo-900">AI Insights</p>
                <p className="text-xs text-indigo-400">{data.tasksAnalyzed} tasks analyzed</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onRefresh}
                aria-label="Refresh AI insights"
                title="Force refresh"
                className="p-1 text-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={onClose} aria-label="Close insights" className="p-1 text-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-line">{data.summary}</p>
        </div>
      )}
    </div>
  );
};

/* ─── Empty column ──────────────────────────────────────────────── */
const EmptyColumn = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
    <p className="text-sm font-medium">No {label.toLowerCase()} tasks</p>
  </div>
);

/* ─── Main ──────────────────────────────────────────────────────── */
export default function ProjectDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  // Fetch single project directly — no need to load all projects
  const [project,     setProject]     = useState(null);
  const [projLoading, setProjLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setProjLoading(true);
    api.get(`/projects/${id}`)
      .then(res => setProject(res.data.project))
      .catch(() => setProject(null))
      .finally(() => setProjLoading(false));
  }, [id]);

  const { tasks, loading: tasksLoading, error, createTask, updateTaskStatus, deleteTask } = useTasks(id);

  const [activeTab,    setActiveTab]    = useState('all');
  const [showModal,    setShowModal]    = useState(false);
  const [addLoading,   setAddLoading]   = useState(false);
  const [addError,     setAddError]     = useState('');
  const [pendingDelId, setPendingDelId] = useState(null);
  const [delLoading,   setDelLoading]   = useState(false);
  const [delError,     setDelError]     = useState('');
  const [aiState,      setAiState]      = useState('idle');
  const [aiData,       setAiData]       = useState(null);
  const [aiError,      setAiError]      = useState('');

  // Cache: { data, taskCount, fetchedAt } — avoids redundant API calls within 5 min
  const summaryCache = useRef({ data: null, taskCount: null, fetchedAt: null });

  const counts = {
    all:         tasks.length,
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  };

  const visibleTasks = activeTab === 'all'
    ? tasks
    : tasks.filter(t => t.status === activeTab);

  const closeAddModal = () => { setShowModal(false); setAddError(''); };

  const handleAddTask = async (data) => {
    setAddLoading(true);
    try {
      const clean = sanitizeFormData(data);
      await createTask(clean);
      closeAddModal();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to create task');
    } finally { setAddLoading(false); }
  };

  const handleDelete = (taskId) => {
    setPendingDelId(taskId);
    setDelError('');
  };

  const confirmDelete = async () => {
    setDelLoading(true);
    try {
      await deleteTask(pendingDelId);
      setPendingDelId(null);
    } catch (err) {
      setDelError(err.response?.data?.error || 'Failed to delete task');
    } finally { setDelLoading(false); }
  };

  const cancelDelete = () => { setPendingDelId(null); setDelError(''); };

  const fetchAi = async () => {
    const now   = Date.now();
    const cache = summaryCache.current;
    const TTL   = 5 * 60 * 1000; // 5 minutes

    // Serve from cache if fresh and task count unchanged
    if (
      cache.data &&
      cache.fetchedAt &&
      (now - cache.fetchedAt) < TTL &&
      cache.taskCount === tasks.length
    ) {
      setAiData(cache.data);
      setAiState('success');
      return;
    }

    setAiState('loading');
    setAiError('');
    try {
      const res = await api.post(`/ai/summarize/${id}`);
      summaryCache.current = { data: res.data, taskCount: tasks.length, fetchedAt: Date.now() };
      setAiData(res.data);
      setAiState('success');
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Rate limit reached. Max 5 AI requests per hour.'
        : err.response?.data?.error || 'AI analysis failed.';
      setAiError(msg);
      setAiState('error');
    }
  };

  const handleRefreshAi = () => {
    summaryCache.current = { data: null, taskCount: null, fetchedAt: null };
    fetchAi();
  };

  const closeAi = () => { setAiState('idle'); setAiData(null); setAiError(''); };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 mb-6 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Projects
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            {projLoading ? (
              <div className="h-7 w-48 skeleton rounded-xl mb-2" />
            ) : (
              <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                {project?.name || 'Project'}
                <button
                  aria-label="Edit project name"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </h1>
            )}
            {project?.description && (
              <p className="text-sm text-gray-400 mt-0.5 max-w-lg">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={aiState === 'loading' ? undefined : fetchAi}
              disabled={aiState === 'loading'}
              className="btn-secondary text-sm gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
            >
              {aiState === 'loading' ? (
                <><span className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" /> Analyzing…</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> AI Insights</>
              )}
            </button>
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {/* AI Panel */}
        {aiState !== 'idle' && (
          <div className="mb-6">
            <AiPanel state={aiState} data={aiData} error={aiError} onClose={closeAi} onRetry={fetchAi} onRefresh={handleRefreshAi} />
          </div>
        )}

        {/* Fetch error */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {TAB_CONFIG.map(tab => (
            <FilterTab
              key={tab.key}
              tab={tab}
              active={activeTab === tab.key}
              count={counts[tab.key] || 0}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* Tasks */}
        {tasksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonTask key={i} />)}
          </div>
        ) : visibleTasks.length === 0 ? (
          <EmptyColumn label={TAB_CONFIG.find(t => t.key === activeTab)?.label || 'matching'} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {visibleTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddTaskModal
          onClose={closeAddModal}
          onSubmit={handleAddTask}
          loading={addLoading}
          error={addError}
        />
      )}

      {pendingDelId && (
        <DeleteTaskConfirm
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          loading={delLoading}
          error={delError}
        />
      )}
    </div>
  );
}
