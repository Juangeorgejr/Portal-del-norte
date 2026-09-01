import type { GuestProfile } from './auth.types';
import type { Room } from './room.types';

export type BookingStatus = 
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELADA'
  | 'NO_SHOW';

export interface HotelServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'FOOD' | 'PARKING' | 'LAUNDRY' | 'TOUR' | 'TRANSPORT';
  active: boolean;
}

export interface BookingServiceItem {
  id?: number;
  service: HotelServiceItem;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PriceCalculationRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  serviceIds?: { serviceId: number; quantity: number }[];
}

export interface PriceCalculationResponse {
  pricePerNight: number;
  numberOfNights: number;
  subtotalRoom: number;
  servicesTotal: number;
  subtotal: number;
  taxRate: number; // 0.19
  taxAmount: number;
  discountAmount: number;
  total: number;
  cancellationPolicy: {
    freeCancellationUntil: string;
    policyDescription: string;
    penaltyIfLate?: number;
  };
}

export interface CreateBookingRequest {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
  };
  services?: { serviceId: number; quantity: number }[];
}

export interface Booking {
  id: number;
  bookingCode: string;
  guest: GuestProfile;
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  pricePerNight: number;
  numberOfNights: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  status: BookingStatus;
  cancellationReason?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  services: BookingServiceItem[];
  payment?: Payment;
  createdAt: string;
}

export interface Payment {
  id: number;
  paymentReference: string;
  amount: number;
  currency: string;
  method: 'TARJETA' | 'PSE' | 'NEQUI' | 'BANCOLOMBIA' | 'EFECTIVO';
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'REFUNDED' | 'ERROR';
  provider: string;
  paidAt?: string;
  createdAt: string;
}
