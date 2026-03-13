'use client';

import { create } from 'zustand';
import { WorkflowApplication, WorkflowStatus } from '@/types/workflow';
import {
  fetchAllApplications,
  fetchMyApplications,
  fetchApplicationById,
  createApplication,
  updateApplicationStatus,
} from '@/lib/api';

interface WorkflowState {
  applications: WorkflowApplication[];
  currentApplication: WorkflowApplication | null;
  isLoading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchByProponent: (email: string) => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  createApp: (data: Partial<WorkflowApplication>) => Promise<WorkflowApplication>;
  updateStatus: (
    id: string,
    status: WorkflowStatus,
    remarks?: string
  ) => Promise<void>;
  clearError: () => void;
  setCurrentApplication: (app: WorkflowApplication | null) => void;
}

export const useWorkflowStore = create<WorkflowState>()((set, get) => ({
  applications: [],
  currentApplication: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const apps = await fetchAllApplications();
      set({ applications: apps, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch applications.';
      set({ error: message, isLoading: false });
    }
  },

  fetchByProponent: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const apps = await fetchMyApplications(email);
      set({ applications: apps, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch applications.';
      set({ error: message, isLoading: false });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const app = await fetchApplicationById(id);
      set({ currentApplication: app, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch application.';
      set({ error: message, isLoading: false });
    }
  },

  createApp: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newApp = await createApplication(data);
      set((state) => ({
        applications: [...state.applications, newApp],
        isLoading: false,
      }));
      return newApp;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create application.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateStatus: async (id, status, remarks) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateApplicationStatus(id, status, remarks);
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? updated : a)),
        currentApplication:
          state.currentApplication?.id === id ? updated : state.currentApplication,
        isLoading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status.';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  setCurrentApplication: (app) => set({ currentApplication: app }),
}));
