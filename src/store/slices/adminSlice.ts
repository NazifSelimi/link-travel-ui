import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import type { DashboardStats } from '@/types';

// ─── State ──────────────────────────────────────────────────
// NOTE: All admin resources except Dashboard have been migrated to
// RTK Query (linktravelApi). Dashboard is the last remaining piece
// and migrates next; this file disappears entirely after that.
interface AdminState {
  dashboard: DashboardStats | null;
  loading: Record<string, boolean>;
  error: string | null;
}

const initialState: AdminState = {
  dashboard: null,
  loading: {},
  error: null,
};

// ─── Dashboard ──────────────────────────────────────────────
export const fetchDashboard = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await api.get<DashboardStats>('/admin/dashboard');
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

// ─── Slice ──────────────────────────────────────────────────
function setLoading(state: AdminState, key: string, val: boolean) {
  state.loading[key] = val;
  if (val) state.error = null;
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (s) => setLoading(s, 'dashboard', true))
      .addCase(fetchDashboard.fulfilled, (s, a) => {
        setLoading(s, 'dashboard', false);
        s.dashboard = a.payload as DashboardStats;
      })
      .addCase(fetchDashboard.rejected, (s, a) => {
        setLoading(s, 'dashboard', false);
        s.error = a.payload as string;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
