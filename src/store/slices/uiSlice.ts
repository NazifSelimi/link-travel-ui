import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Toast, SearchFilters } from '@/types';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  toasts: Toast[];
  searchQuery: string;
  filters: SearchFilters;
  isSearching: boolean;
}

const initialFilters: SearchFilters = {
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
};

const initialState: UIState = {
  theme: 'system',
  sidebarOpen: false,
  mobileMenuOpen: false,
  toasts: [],
  searchQuery: '',
  filters: initialFilters,
  isSearching: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetSearchFilters: (state) => {
      state.filters = initialFilters;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  addToast,
  removeToast,
  clearToasts,
  setSearchQuery,
  setSearchFilters,
  resetSearchFilters,
  setIsSearching,
} = uiSlice.actions;

export default uiSlice.reducer;
