import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import { serializeUserPayload } from '@/api/serializers';
import type {
  DashboardStats,
  AdminReservation,
  User,
  PaginatedResponse,
  AdminListParams,
  Review,
  ContactMessage,
} from '@/types';

// ─── State ──────────────────────────────────────────────────
// NOTE: Destinations, Hotels, Packages, and RoomTypes have been
// migrated to RTK Query (linktravelApi). Remaining admin resources
// will follow in subsequent Stage B PRs.
interface AdminState {
  dashboard: DashboardStats | null;
  reservations: { data: AdminReservation[]; total: number; page: number; pageSize: number; totalPages: number };
  users: { data: User[]; total: number; page: number; pageSize: number; totalPages: number };
  reviews: { data: Review[]; total: number; page: number; pageSize: number; totalPages: number };
  contacts: { data: ContactMessage[]; total: number; page: number; pageSize: number; totalPages: number };
  loading: Record<string, boolean>;
  error: string | null;
}

const emptyPaginated = { data: [], total: 0, page: 1, pageSize: 15, totalPages: 0 };

const initialState: AdminState = {
  dashboard: null,
  reservations: { ...emptyPaginated },
  users: { ...emptyPaginated },
  reviews: { ...emptyPaginated },
  contacts: { ...emptyPaginated },
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

// ─── Reservations ───────────────────────────────────────────
export const fetchAdminReservations = createAsyncThunk(
  'admin/fetchReservations',
  async (params: AdminListParams | undefined, { rejectWithValue }) => {
    try {
      return await api.get<PaginatedResponse<AdminReservation>>(`/admin/reservations${buildQuery(params)}`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const updateReservationStatus = createAsyncThunk(
  'admin/updateReservationStatus',
  async ({ id, status }: { id: string; status: number }, { rejectWithValue }) => {
    try {
      return await api.patch<AdminReservation>(`/admin/reservations/${id}/status`, { status });
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const deleteReservation = createAsyncThunk(
  'admin/deleteReservation',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/reservations/${id}`);
      return id;
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

// ─── Reviews ────────────────────────────────────────────────
export const fetchAdminReviews = createAsyncThunk(
  'admin/fetchReviews',
  async (params: AdminListParams | undefined, { rejectWithValue }) => {
    try {
      return await api.get<PaginatedResponse<Review>>(`/admin/reviews${buildQuery(params)}`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const approveReview = createAsyncThunk(
  'admin/approveReview',
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.patch<Review>(`/admin/reviews/${id}/approve`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const rejectReview = createAsyncThunk(
  'admin/rejectReview',
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.patch<Review>(`/admin/reviews/${id}/reject`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const deleteReview = createAsyncThunk(
  'admin/deleteReview',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

// ─── Contacts ───────────────────────────────────────────────
export const fetchAdminContacts = createAsyncThunk(
  'admin/fetchContacts',
  async (params: AdminListParams | undefined, { rejectWithValue }) => {
    try {
      return await api.get<PaginatedResponse<ContactMessage>>(`/admin/contacts${buildQuery(params)}`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const markContactAsRead = createAsyncThunk(
  'admin/markContactAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      return await api.patch<ContactMessage>(`/admin/contacts/${id}/read`);
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  },
);

export const deleteContact = createAsyncThunk(
  'admin/deleteContact',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/contacts/${id}`);
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

    // Reservations
    builder
      .addCase(fetchAdminReservations.pending, (s) => setLoading(s, 'reservations', true))
      .addCase(fetchAdminReservations.fulfilled, (s, a) => {
        setLoading(s, 'reservations', false);
        const p = a.payload as PaginatedResponse<AdminReservation>;
        s.reservations = { data: p.data, total: p.total, page: p.page, pageSize: p.pageSize, totalPages: p.totalPages };
      })
      .addCase(fetchAdminReservations.rejected, (s, a) => {
        setLoading(s, 'reservations', false);
        s.error = a.payload as string;
      });

    builder
      .addCase(updateReservationStatus.fulfilled, (s, a) => {
        const updated = a.payload as AdminReservation;
        const idx = s.reservations.data.findIndex((r) => r.id === updated.id);
        if (idx !== -1) s.reservations.data[idx] = updated;
      })
      .addCase(deleteReservation.fulfilled, (s, a) => {
        s.reservations.data = s.reservations.data.filter((r) => r.id !== a.payload);
        s.reservations.total -= 1;
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

    // Reviews
    builder
      .addCase(fetchAdminReviews.pending, (s) => setLoading(s, 'reviews', true))
      .addCase(fetchAdminReviews.fulfilled, (s, a) => {
        setLoading(s, 'reviews', false);
        const p = a.payload as PaginatedResponse<Review>;
        s.reviews = { data: p.data, total: p.total, page: p.page, pageSize: p.pageSize, totalPages: p.totalPages };
      })
      .addCase(fetchAdminReviews.rejected, (s, a) => {
        setLoading(s, 'reviews', false);
        s.error = a.payload as string;
      });

    builder
      .addCase(approveReview.fulfilled, (s, a) => {
        const updated = a.payload as Review;
        const idx = s.reviews.data.findIndex((review) => review.id === updated.id);
        if (idx !== -1) s.reviews.data[idx] = updated;
      })
      .addCase(rejectReview.fulfilled, (s, a) => {
        const updated = a.payload as Review;
        const idx = s.reviews.data.findIndex((review) => review.id === updated.id);
        if (idx !== -1) s.reviews.data[idx] = updated;
      })
      .addCase(deleteReview.fulfilled, (s, a) => {
        s.reviews.data = s.reviews.data.filter((review) => review.id !== a.payload);
        s.reviews.total -= 1;
      });

    // Contacts
    builder
      .addCase(fetchAdminContacts.pending, (s) => setLoading(s, 'contacts', true))
      .addCase(fetchAdminContacts.fulfilled, (s, a) => {
        setLoading(s, 'contacts', false);
        const p = a.payload as PaginatedResponse<ContactMessage>;
        s.contacts = { data: p.data, total: p.total, page: p.page, pageSize: p.pageSize, totalPages: p.totalPages };
      })
      .addCase(fetchAdminContacts.rejected, (s, a) => {
        setLoading(s, 'contacts', false);
        s.error = a.payload as string;
      });

    builder
      .addCase(markContactAsRead.fulfilled, (s, a) => {
        const updated = a.payload as ContactMessage;
        const idx = s.contacts.data.findIndex((contact) => contact.id === updated.id);
        if (idx !== -1) s.contacts.data[idx] = updated;
      })
      .addCase(deleteContact.fulfilled, (s, a) => {
        s.contacts.data = s.contacts.data.filter((contact) => contact.id !== a.payload);
        s.contacts.total -= 1;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
