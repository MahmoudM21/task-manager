import React, { useState, useCallback, useRef } from 'react';
import { Plus, FolderOpen, Search, X, AlertTriangle, FolderKanban, ListTodo, CheckCircle2, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import useProjects from '../hooks/useProjects';
import { sanitizeFormData } from '../utils/sanitize';

/* ─── Stats row ─────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div
    className="flex items-center gap-3 rounded-xl px-4 py-3 flex-1 min-w-[120px]"
    style={{ background: 'var(--color-bg)' }}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <div>
      <p className="font-medium leading-none" style={{ fontSize: '22px', color: 'var(--brand-950)' }}>
        {value}
      </p>
      <p className="mt-0.5" style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
        {label}
      </p>
    </div>
  </div>
);

const StatsRow = ({ projects }) => {
  const totalProjects = projects.length;
  const totalTasks    = projects.reduce((s, p) => s + (p.todo_count || 0) + (p.in_progress_count || 0) + (p.done_count || 0), 0);
  const totalDone     = projects.reduce((s, p) => s + (p.done_count || 0), 0);
  const inProgress    = projects.reduce((s, p) => s + (p.in_progress_count || 0), 0);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <StatCard icon={FolderKanban} value={totalProjects} label="total projects"  color="bg-indigo-100 text-indigo-600" />
      <StatCard icon={ListTodo}     value={totalTasks}    label="total tasks"     color="bg-violet-100 text-violet-600" />
      <StatCard icon={CheckCircle2} value={totalDone}     label="completed"       color="bg-emerald-100 text-emerald-600" />
      <StatCard icon={Clock}        value={inProgress}    label="in progress"     color="bg-amber-100 text-amber-600" />
    </div>
  );
};

/* ─── Skeleton card ─────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="card p-5 space-y-3 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 bg-gray-100 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-full" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="flex gap-1.5">
      {[60, 80, 50].map(w => (
        <div key={w} className="h-5 bg-gray-100 rounded-full" style={{ width: `${w}px` }} />
      ))}
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full w-full" />
  </div>
);

/* ─── Empty state ───────────────────────────────────────────────── */
const EmptyState = ({ onNew, search }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 animate-fade-in">
    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-5">
      <FolderOpen className="w-10 h-10 text-indigo-300" />
    </div>
    {search ? (
      <>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No projects match "{search}"</h3>
        <p className="text-sm text-gray-400">Try a different search term.</p>
      </>
    ) : (
      <>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs text-center">
          Create your first project to start organizing tasks and getting AI insights.
        </p>
        <button onClick={onNew} className="btn-primary">
          <Plus className="w-4 h-4" /> Create First Project
        </button>
      </>
    )}
  </div>
);

/* ─── Project Modal ─────────────────────────────────────────────── */
const ProjectModal = ({ mode, initial, onClose, onSubmit, loading, error }) => {
  const [name, setName]       = useState(initial?.name        || '');
  const [desc, setDesc]       = useState(initial?.description || '');
  const [nameErr, setNameErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setNameErr('Project name is required.'); return; }
    onSubmit({ name: name.trim(), description: desc.trim() });
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="modal-title" className="text-base font-bold text-gray-900">
            {mode === 'create' ? 'New Project' : 'Edit Project'}
          </h2>
          <button onClick={onClose} aria-label="Close modal" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {error && (
            <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <label htmlFor="proj-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Project name <span className="text-red-500" aria-hidden>*</span>
            </label>
            <input
              id="proj-name"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setNameErr(''); }}
              placeholder="e.g. Website Redesign"
              maxLength={200}
              className={`input-field ${nameErr ? 'input-error' : ''}`}
              autoFocus
            />
            {nameErr && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {nameErr}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="proj-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="proj-desc"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="What is this project about?"
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              ) : mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Delete Confirm ────────────────────────────────────────────── */
const DeleteConfirm = ({ project, onClose, onConfirm, loading, error }) => (
  <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl shadow-card-lg w-full max-w-sm animate-scale-in p-6">
      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <h2 id="delete-title" className="text-base font-bold text-gray-900 mb-2">Delete project?</h2>
      <p className="text-sm text-gray-500 mb-4">
        <strong className="text-gray-700">"{project.name}"</strong> and all its tasks will be permanently deleted. This cannot be undone.
      </p>
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

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const {
    projects, loading, error,
    fetchProjects, loadMore, loadingMore, hasMore,
    createProject, updateProject, deleteProject,
  } = useProjects();

  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null);
  const [delProj,    setDelProj]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [modalError, setModalError] = useState('');
  const [delError,   setDelError]   = useState('');

  const debounceRef = useRef(null);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProjects(val, 0);
    }, 300);
  }, [fetchProjects]);

  const closeModal  = () => { setModal(null);    setModalError(''); };
  const closeDelete = () => { setDelProj(null);  setDelError('');   };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createProject(sanitizeFormData(data));
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to create project');
    } finally { setSaving(false); }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await updateProject(modal.id, sanitizeFormData(data));
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to update project');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(delProj.id);
      closeDelete();
    } catch (err) {
      setDelError(err.response?.data?.error || 'Failed to delete project');
    } finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Projects</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? '…' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={handleSearchChange}
                className="input-field pl-9 pr-4 py-2 text-sm w-52"
                aria-label="Search projects"
              />
            </div>
            <button onClick={() => setModal('create')} className="btn-primary whitespace-nowrap">
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>

        {/* Stats row — only when there are projects */}
        {!loading && projects.length > 0 && <StatsRow projects={projects} />}

        {/* Fetch error */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => fetchProjects(search, 0)} className="ml-auto text-xs font-semibold underline hover:no-underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : projects.length === 0 ? (
            <EmptyState onNew={() => setModal('create')} search={search} />
          ) : (
            projects.map(p => (
              <ProjectCard key={p.id} project={p} onEdit={setModal} onDelete={setDelProj} />
            ))
          )}
        </div>

        {/* Load more */}
        {!loading && hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-secondary px-8"
            >
              {loadingMore ? (
                <><span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> Loading…</>
              ) : 'Load more'}
            </button>
          </div>
        )}
      </main>

      {modal && (
        <ProjectModal
          mode={modal === 'create' ? 'create' : 'edit'}
          initial={modal !== 'create' ? modal : undefined}
          onClose={closeModal}
          onSubmit={modal === 'create' ? handleCreate : handleEdit}
          loading={saving}
          error={modalError}
        />
      )}

      {delProj && (
        <DeleteConfirm
          project={delProj}
          onClose={closeDelete}
          onConfirm={handleDelete}
          loading={deleting}
          error={delError}
        />
      )}
    </div>
  );
}
