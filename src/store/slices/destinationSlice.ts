import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import type { Destination, DestinationFilters, PaginatedResponse } from '@/types';
import type { AsyncStatus } from './asyncStatus';

interface DestinationState {
  destinations: Destination[];
  featuredDestinations: Destination[];
  currentDestination: Destination | null;
  filters: DestinationFilters;
  listStatus: AsyncStatus;
  featuredStatus: AsyncStatus;
  detailStatus: AsyncStatus;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: DestinationState = {
  destinations: [],
  featuredDestinations: [],
  currentDestination: null,
  filters: {
    sortBy: 'popular',
    sortOrder: 'desc',
  },
  listStatus: 'idle',
  featuredStatus: 'idle',
  detailStatus: 'idle',
  error: null,
  total: 0,
  page: 1,
  pageSize: 12,
};

export const fetchDestinations = createAsyncThunk(
  'destinations/fetchAll',
  async (filters: DestinationFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse<Destination>>('/destinations', {
        params: filters,
      });
      return response as PaginatedResponse<Destination>;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch destinations');
    }
  }
);

export const fetchFeaturedDestinations = createAsyncThunk(
  'destinations/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Destination[]>('/destinations/featured');
      return response as Destination[];
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch featured destinations');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { destinations: DestinationState };
      return state.destinations.featuredStatus !== 'loading';
    },
  }
);

export const fetchDestinationById = createAsyncThunk(
  'destinations/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Destination>(`/destinations/${id}`);
      return response as Destination;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch destination');
    }
  }
);

const destinationSlice = createSlice({
  name: 'destinations',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<DestinationFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearCurrentDestination: (state) => {
      state.currentDestination = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.destinations = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchFeaturedDestinations.pending, (state) => {
        state.featuredStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchFeaturedDestinations.fulfilled, (state, action) => {
        state.featuredStatus = 'succeeded';
        state.featuredDestinations = action.payload;
      })
      .addCase(fetchFeaturedDestinations.rejected, (state, action) => {
        state.featuredStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchDestinationById.pending, (state) => {
        state.detailStatus = 'loading';
        state.currentDestination = null;
        state.error = null;
      })
      .addCase(fetchDestinationById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentDestination = action.payload;
      })
      .addCase(fetchDestinationById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.currentDestination = null;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentDestination,
  clearError,
} = destinationSlice.actions;

export default destinationSlice.reducer;
