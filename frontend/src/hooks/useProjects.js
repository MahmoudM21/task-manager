import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const useProjects = () => {
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);
  const [total,       setTotal]       = useState(0);

  const abortRef  = useRef(null);
  const searchRef = useRef(''); // last search term, used by loadMore

  const fetchProjects = useCallback(async (searchQuery = '', offsetVal = 0) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    searchRef.current = searchQuery;

    const isLoadMore = offsetVal > 0;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const params = { limit: 20, offset: offsetVal };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/projects', { params, signal: controller.signal });
      const { projects: fetched, total: fetchedTotal } = res.data;

      setTotal(fetchedTotal ?? 0);
      if (isLoadMore) {
        setProjects(prev => [...prev, ...(fetched ?? [])]);
      } else {
        setProjects(fetched ?? []);
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      if (!isLoadMore) setError(err.response?.data?.error ?? 'Failed to load projects');
    } finally {
      if (isLoadMore) setLoadingMore(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects('', 0);
    return () => abortRef.current?.abort();
  }, [fetchProjects]);

  const loadMore = useCallback(() => {
    fetchProjects(searchRef.current, projects.length);
  }, [fetchProjects, projects.length]);

  const hasMore = projects.length < total;

  /* ── Mutations ───────────────────────────────────────────────────── */

  const createProject = useCallback(async (data) => {
    const res = await api.post('/projects', data);
    const created = res.data.project;
    setProjects(prev => [created, ...prev]);
    setTotal(prev => prev + 1);
    return created;
  }, []);

  const updateProject = useCallback(async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    const updated = res.data.project;
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects(prev => prev.filter(p => p.id !== id));
    setTotal(prev => Math.max(0, prev - 1));
  }, []);

  return {
    projects,
    loading,
    loadingMore,
    error,
    total,
    hasMore,
    refetch: fetchProjects,
    fetchProjects,
    loadMore,
    createProject,
    updateProject,
    deleteProject,
  };
};

export default useProjects;
