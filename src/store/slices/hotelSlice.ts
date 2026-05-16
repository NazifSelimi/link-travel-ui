import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import type { Hotel, HotelFilters, PaginatedResponse } from '@/types';
import type { AsyncStatus } from './asyncStatus';

interface HotelState {
  hotels: Hotel[];
  featuredHotels: Hotel[];
  currentHotel: Hotel | null;
  filters: HotelFilters;
  listStatus: AsyncStatus;
  featuredStatus: AsyncStatus;
  detailStatus: AsyncStatus;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: HotelState = {
  hotels: [],
  featuredHotels: [],
  currentHotel: null,
  filters: {
    sortBy: 'rating',
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

export const fetchHotels = createAsyncThunk(
  'hotels/fetchAll',
  async (filters: HotelFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse<Hotel>>('/hotels', {
        params: filters,
      });
      return response as PaginatedResponse<Hotel>;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch hotels');
    }
  }
);

export const fetchFeaturedHotels = createAsyncThunk(
  'hotels/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Hotel[]>('/hotels/featured');
      return response as Hotel[];
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch featured hotels');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { hotels: HotelState };
      return state.hotels.featuredStatus !== 'loading';
    },
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Hotel>(`/hotels/${id}`);
      return response as Hotel;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch hotel');
    }
  }
);

export const fetchHotelsByDestination = createAsyncThunk(
  'hotels/fetchByDestination',
  async (destinationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse<Hotel>>(`/destinations/${destinationId}/hotels`);
      return response as PaginatedResponse<Hotel>;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch hotels for destination');
    }
  }
);

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<HotelFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.hotels = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchFeaturedHotels.pending, (state) => {
        state.featuredStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchFeaturedHotels.fulfilled, (state, action) => {
        state.featuredStatus = 'succeeded';
        state.featuredHotels = action.payload;
      })
      .addCase(fetchFeaturedHotels.rejected, (state, action) => {
        state.featuredStatus = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.detailStatus = 'loading';
        state.currentHotel = null;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.currentHotel = null;
        state.error = action.payload as string;
      })
      .addCase(fetchHotelsByDestination.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchHotelsByDestination.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.hotels = action.payload.data;
      })
      .addCase(fetchHotelsByDestination.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentHotel,
  clearError,
} = hotelSlice.actions;

export default hotelSlice.reducer;
