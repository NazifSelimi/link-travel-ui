import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/api/client';
import { serializeReservationPayload } from '@/api/serializers';
import type { PaginatedResponse, Reservation, ReservationFormData } from '@/types';

interface BookingData {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}

interface BookingState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  formData: ReservationFormData;
  currentBooking: BookingData | null;
  bookingStep: number;
  selectedHotelId: string | null;
  selectedRoomTypeId: string | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  success: boolean;
}

const initialFormData: ReservationFormData = {
  fullName: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  notes: '',
};

const initialState: BookingState = {
  reservations: [],
  currentReservation: null,
  formData: initialFormData,
  currentBooking: null,
  bookingStep: 1,
  selectedHotelId: null,
  selectedRoomTypeId: null,
  loading: false,
  submitting: false,
  error: null,
  success: false,
};

export const createReservation = createAsyncThunk(
  'booking/create',
  async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>, { rejectWithValue }) => {
    try {
      const response = await api.post<Reservation>('/reservations', serializeReservationPayload(reservation));
      return response as Reservation;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to create reservation');
    }
  }
);

export const fetchReservations = createAsyncThunk(
  'booking/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<PaginatedResponse<Reservation>>('/reservations');
      return response as PaginatedResponse<Reservation>;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch reservations');
    }
  }
);

export const fetchReservationById = createAsyncThunk(
  'booking/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Reservation>(`/reservations/${id}`);
      return response as Reservation;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to fetch reservation');
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'booking/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch<Reservation>(`/reservations/${id}/cancel`);
      return response as Reservation;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'Failed to cancel reservation');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Partial<ReservationFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = initialFormData;
    },
    setBookingData: (state, action: PayloadAction<Partial<BookingData>>) => {
      state.currentBooking = state.currentBooking
        ? { ...state.currentBooking, ...action.payload }
        : action.payload as BookingData;
    },
    setBookingStep: (state, action: PayloadAction<number>) => {
      state.bookingStep = action.payload;
    },
    resetBooking: (state) => {
      state.currentBooking = null;
      state.bookingStep = 1;
      state.selectedHotelId = null;
      state.selectedRoomTypeId = null;
    },
    setSelectedHotel: (state, action: PayloadAction<string | null>) => {
      state.selectedHotelId = action.payload;
    },
    setSelectedRoomType: (state, action: PayloadAction<string | null>) => {
      state.selectedRoomTypeId = action.payload;
    },
    clearBookingState: (state) => {
      state.currentReservation = null;
      state.error = null;
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReservation.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentReservation = action.payload;
        state.success = true;
        state.formData = initialFormData;
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload.data;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchReservationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReservation = action.payload;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelReservation.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentReservation = action.payload;
        const index = state.reservations.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(cancelReservation.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFormData,
  resetFormData,
  setBookingData,
  setBookingStep,
  resetBooking,
  setSelectedHotel,
  setSelectedRoomType,
  clearBookingState,
  clearError,
  clearSuccess,
} = bookingSlice.actions;

export default bookingSlice.reducer;
