import { api, unwrap } from '@/lib/api';

export interface BookingProperty {
  id: string; name: string; brand?: string | null; city: string; state?: string | null;
  country?: string | null; starRating: number; currency: string; checkInTime: string; checkOutTime: string;
  paymentLive?: boolean;
}
export interface BookingAvail {
  roomType: { id: string; name: string; maxOccupancy: number; amenities?: string[] | null };
  available: number; nights: number; ratePerNight: number; totalRate: number;
}
export interface BookInput {
  roomTypeId: string; checkIn: string; checkOut: string; adults: number; children?: number;
  firstName: string; lastName: string; email: string; phone?: string; specialRequests?: string;
  addons?: { name: string; price: number; quantity: number }[];
  promoCode?: string;
  paymentToken?: string;
  razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string;
}
export interface ManagedBooking {
  confirmationNumber: string; status: string; guest: string; email: string;
  roomType: string; room: string | null; checkIn: string; checkOut: string;
  nights: number; adults: number; children: number;
  total: number; paid: number; balanceDue: number;
  extras: { name: string; price: number; quantity: number }[];
  cancellable: boolean;
}
export interface PromoPreview { valid: boolean; code?: string; discount?: number; label?: string }
export interface PaymentOrder { mock: boolean; amount: number; orderId?: string; keyId?: string; currency?: string }
export interface OrderInput { roomTypeId: string; checkIn: string; checkOut: string; addons?: { name: string; price: number; quantity: number }[]; promoCode?: string }
export interface BookResult {
  confirmationNumber: string; guest: string; checkIn: string; checkOut: string;
  nights: number; total: number; paid: boolean;
}

export const bookingService = {
  async getProperty(propertyId: string): Promise<BookingProperty> {
    return unwrap<BookingProperty>(await api.get(`/booking/${propertyId}/property`));
  },
  async availability(propertyId: string, checkIn: string, checkOut: string, adults: number): Promise<BookingAvail[]> {
    return unwrap<BookingAvail[]>(await api.get(`/booking/${propertyId}/availability`, { params: { checkIn, checkOut, adults } }));
  },
  async book(propertyId: string, dto: BookInput): Promise<BookResult> {
    return unwrap<BookResult>(await api.post(`/booking/${propertyId}/book`, dto));
  },
  async previewPromo(propertyId: string, params: { code: string; roomTypeId: string; checkIn: string; checkOut: string }): Promise<PromoPreview> {
    return unwrap<PromoPreview>(await api.get(`/booking/${propertyId}/promo`, { params }));
  },
  async createOrder(propertyId: string, dto: OrderInput): Promise<PaymentOrder> {
    return unwrap<PaymentOrder>(await api.post(`/booking/${propertyId}/payment/order`, dto));
  },
  async getReservation(propertyId: string, confirmationNumber: string, email: string): Promise<ManagedBooking> {
    return unwrap<ManagedBooking>(await api.get(`/booking/${propertyId}/reservation/${encodeURIComponent(confirmationNumber)}`, { params: { email } }));
  },
  async cancelReservation(propertyId: string, confirmationNumber: string, email: string, reason?: string): Promise<ManagedBooking> {
    return unwrap<ManagedBooking>(await api.post(`/booking/${propertyId}/reservation/${encodeURIComponent(confirmationNumber)}/cancel`, { email, reason }));
  },
};
