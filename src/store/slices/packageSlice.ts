import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import type { TravelPackage, PaginatedResponse } from '@/types';
import type { AsyncStatus } from './asyncStatus';

interface PackageState {
  packages: TravelPackage[];
  featuredPackages: TravelPackage[];
  currentPackage: TravelPackage | null;
  listStatus: AsyncStatus;
  featuredStatus: AsyncStatus;
  detailStatus: AsyncStatus;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: PackageState = {
  packages: [],
  featuredPackages: [],
  currentPackage: null,
  listStatus: 'idle',
  featuredStatus: 'idle',
  detailStatus: 'idle',
  error: null,
  total: 0,
  page: 1,
  pageSize: 12,
};

export const fetchPackages = createAsyncThunk(
  'packages/fetchAll',
  async (params: Record<string, string> | undefined, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse<TravelPackage>>('/packages', { params });
      return response as PaginatedResponse<TravelPackage>;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch packages');
    }
  }
);

export const fetchFeaturedPackages = createAsyncThunk(
  'packages/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<TravelPackage[]>('/packages/featured');
      return response as TravelPackage[];
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch featured packages');
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { packages: PackageState };
      return state.packages.featuredStatus !== 'loading';
    },
  }
);

export const fetchPackageById = createAsyncThunk(
  'packages/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<TravelPackage>(`/packages/${id}`);
      return response as TravelPackage;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch package');
    }
  }
);

const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => { state.listStatus = 'loading'; state.error = null; })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.packages = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchPackages.rejected, (state, action) => { state.listStatus = 'failed'; state.error = action.payload as string; })
      .addCase(fetchFeaturedPackages.pending, (state) => { state.featuredStatus = 'loading'; state.error = null; })
      .addCase(fetchFeaturedPackages.fulfilled, (state, action) => { state.featuredStatus = 'succeeded'; state.featuredPackages = action.payload; })
      .addCase(fetchFeaturedPackages.rejected, (state, action) => { state.featuredStatus = 'failed'; state.error = action.payload as string; })
      .addCase(fetchPackageById.pending, (state) => { state.detailStatus = 'loading'; state.currentPackage = null; state.error = null; })
      .addCase(fetchPackageById.fulfilled, (state, action) => { state.detailStatus = 'succeeded'; state.currentPackage = action.payload; })
      .addCase(fetchPackageById.rejected, (state, action) => { state.detailStatus = 'failed'; state.currentPackage = null; state.error = action.payload as string; });
  },
});

export const { clearError } = packageSlice.actions;
export default packageSlice.reducer;
