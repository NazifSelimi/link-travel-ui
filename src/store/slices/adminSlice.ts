import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import { serializeUserPayload } from '@/api/serializers';
import type {
  DashboardStats,
  User,
  PaginatedResponse,
  AdminListParams,
} from '@/types';

// ─── State ──────────────────────────────────────────────────
// NOTE: Most admin resources (Destinations, Hotels, Packages, RoomTypes,
// Reservations, Reviews, Contacts) have been migrated to RTK Query
// (linktravelApi). Users and Dashboard remain on this slice — they
// migrate in the final Stage B PRs.
interface AdminState {
  dashboard: DashboardStats | null;
  users: { data: User[]; total: number; page: number; pageSize: number; totalPages: number };
  loading: Record<string, boolean>;
  error: string | null;
}

const emptyPaginated = { data: [], total: 0, page: 1, pageSize: 15, totalPages: 0 };

const initialState: AdminState = {
  dashboard: null,
  users: { ...emptyPaginated },
  loading: {},
  error: null,
};

// ─── Helpers ────────────────────────────────────────────────
function buildQuery(params?: AdminListParams) {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.page) q.set('page', String(params.page));
  if (params.per_page) q.set('per_page', String(params.per_page));
  if (params.status) q.set('status', params.status);
  if (params.role) q.set('role', params.role);
  if (params.hotel_id) q.set('hotel_id', params.hotel_id);
  const str = q.toString();
  return str ? `?${str}` : '';
}

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

// ─── Users ──────────────────────────────────────────────────
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: AdminListParams | undefined, { rejectWithValue }) => {
    try {
      return await api.get<PaginatedResponse<User>>(`/admin/users${buildQuery(params)}`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      return await api.put<User>(`/admin/users/${id}`, serializeUserPayload(data));
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${id}`);
      return id;
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
    // Dashboard
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

    // Users
    builder
      .addCase(fetchAdminUsers.pending, (s) => setLoading(s, 'users', true))
      .addCase(fetchAdminUsers.fulfilled, (s, a) => {
        setLoading(s, 'users', false);
        const p = a.payload as PaginatedResponse<User>;
        s.users = { data: p.data, total: p.total, page: p.page, pageSize: p.pageSize, totalPages: p.totalPages };
      })
      .addCase(fetchAdminUsers.rejected, (s, a) => {
        setLoading(s, 'users', false);
        s.error = a.payload as string;
      });

    builder
      .addCase(updateUser.fulfilled, (s, a) => {
        const updated = a.payload as User;
        const idx = s.users.data.findIndex((u) => u.id === updated.id);
        if (idx !== -1) s.users.data[idx] = updated;
      })
      .addCase(deleteUser.fulfilled, (s, a) => {
        s.users.data = s.users.data.filter((u) => u.id !== a.payload);
        s.users.total -= 1;
      });


  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
