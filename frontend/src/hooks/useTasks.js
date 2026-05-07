import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const VALID_STATUSES = new Set(['todo', 'in_progress', 'done']);

const useTasks = (projectId, statusFilter = null) => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const abortRef = useRef(null);

  // Keep a ref of the latest tasks array so rollback doesn't need tasks as a dep
  const latestTasksRef = useRef([]);
  useEffect(() => { latestTasksRef.current = tasks; }, [tasks]);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params = statusFilter && VALID_STATUSES.has(statusFilter)
        ? { status: statusFilter }
        : {};

      const res = await api.get(`/projects/${projectId}/tasks`, {
        params,
        signal: controller.signal,
      });

      setTasks(res.data.tasks ?? []);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError(err.response?.data?.error ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, statusFilter]);

  useEffect(() => {
    fetchTasks();
    return () => abortRef.current?.abort();
  }, [fetchTasks]);

  /* ── Mutations ───────────────────────────────────────────────────── */

  const createTask = useCallback(async (data) => {
    const res = await api.post(`/projects/${projectId}/tasks`, data);
    const created = res.data.task;
    setTasks(prev => [...prev, created]);
    return created;
  }, [projectId]);

  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    // 1. Snapshot current tasks for rollback
    const previousTasks = latestTasksRef.current;

    // 2. Optimistically update UI immediately
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      // 3. Sync with server
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
    } catch {
      // 4. Rollback on failure
      setTasks(previousTasks);
      // 5. Surface error to caller
      throw new Error('Failed to update task status. Please try again.');
    }
  }, []);

  const updateTask = useCallback(async (taskId, data) => {
    const res = await api.put(`/tasks/${taskId}`, data);
    const updated = res.data.task;
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    return updated;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    fetchTasks,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
  };
};

export default useTasks;
