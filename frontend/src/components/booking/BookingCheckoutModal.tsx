import React, { useState, useEffect } from 'react';
import type { Room, HotelServiceItem, PriceCalculationResponse, Booking } from '../../types';
import { api } from '../../services/api';
import { formatCOP, formatDateShort } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Coffee, 
  Car, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface BookingCheckoutModalProps {
  room: Room;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  room,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const dayAfter = format(addDays(new Date(), 3), 'yyyy-MM-dd');

  // Step 1 State: Dates & Services
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || tomorrow);
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || dayAfter);
  const [guests, setGuests] = useState<number>(initialGuests);
  const [availableServices, setAvailableServices] = useState<HotelServiceItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ [serviceId: number]: number }>({});
  
  // Pricing state from Backend
  const [pricing, setPricing] = useState<PriceCalculationResponse | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  // Step 2 State: Guest Details
  const [firstName, setFirstName] = useState(user?.guestProfile?.firstName || '');
  const [lastName, setLastName] = useState(user?.guestProfile?.lastName || '');
  const [email, setEmail] = useState(user?.guestProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(user?.guestProfile?.phone || '');
  const [documentType, setDocumentType] = useState(user?.guestProfile?.documentType || 'CC');
  const [documentNumber, setDocumentNumber] = useState(user?.guestProfile?.documentNumber || '');

  // Step 3 State: Payment
  const [paymentMethod, setPaymentMethod] = useState<'TARJETA' | 'PSE' | 'NEQUI' | 'BANCOLOMBIA' | 'EFECTIVO'>('TARJETA');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 4 State: Confirmed Booking
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load available hotel services on mount
  useEffect(() => {
    api.get<HotelServiceItem[]>('/services')
      .then(res => setAvailableServices(res.data))
      .catch(() => {});
  }, []);

  // Recalculate price in Backend whenever dates or services change
  useEffect(() => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return;

    setCalculating(true);
    setError(null);

    const serviceList = Object.entries(selectedServices)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ serviceId: Number(id), quantity: qty }));

    api.post<PriceCalculationResponse>('/bookings/calculate', {
      roomId: room.id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guestCount: guests,
      services: serviceList,
    })
      .then(res => setPricing(res.data))
      .catch(err => setError(err.response?.data?.message || 'Error al calcular precio'))
      .finally(() => setCalculating(false));
  }, [room.id, checkIn, checkOut, guests, selectedServices]);

  const toggleService = (serviceId: number) => {
    setSelectedServices(prev => {
      const current = prev[serviceId] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      } else {
        return { ...prev, [serviceId]: 1 };
      }
    });
  };

  const handleCreateAndPay = async () => {
    setProcessing(true);
    setError(null);

    try {
      const serviceList = Object.entries(selectedServices)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ serviceId: Number(id), quantity: qty }));

      // 1. Crear Reserva
      const bookingRes = await api.post<Booking>('/bookings', {
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: guests,
        guest: {
          firstName,
          lastName,
          email,
          phone,
          documentType,
          documentNumber,
        },
        services: serviceList,
      });

      const newBooking = bookingRes.data;

      // 2. Procesar Pago Electrónico
      await api.post('/payments/process', {
        bookingId: newBooking.id,
        method: paymentMethod,
      });

      // 3. Obtener reserva confirmada actualizada
      const finalBookingRes = await api.get<Booking>(`/bookings/${newBooking.id}`);
      setConfirmedBooking(finalBookingRes.data);
      setStep(4);
      onSuccess(finalBookingRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hubo un inconveniente al procesar la reserva o el pago.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold gold-gradient text-slate-950">
                Paso {step} de {step === 4 ? 4 : 3}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Habitación {room.roomNumber} — {room.roomType.name}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-slate-900 mt-0.5">
              {step === 1 && 'Personalice su Estadía'}
              {step === 2 && 'Datos del Huésped Principal'}
              {step === 3 && 'Método de Pago Seguro (COP)'}
              {step === 4 && '¡Reserva Confirmada con Éxito!'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Dates & Services */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn ? format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd') : tomorrow}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Huéspedes</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Huésped' : 'Huéspedes'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Services */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Servicios Adicionales Disponibles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableServices.map((service) => {
                    const isSelected = !!selectedServices[service.id];
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-gold-50/70 border-gold-400 ring-1 ring-gold-400'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-gold-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {service.category === 'FOOD' && <Coffee className="w-4 h-4" />}
                            {service.category === 'PARKING' && <Car className="w-4 h-4" />}
                            {service.category !== 'FOOD' && service.category !== 'PARKING' && <Sparkles className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{service.name}</p>
                            <p className="text-[11px] font-semibold text-gold-700">{formatCOP(service.price)}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-gold-600 focus:ring-gold-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Breakdown */}
              {pricing && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{pricing.numberOfNights} {pricing.numberOfNights === 1 ? 'noche' : 'noches'} × {formatCOP(pricing.pricePerNight)}</span>
                    <span className="font-semibold">{formatCOP(pricing.subtotalRoom)}</span>
                  </div>
                  {pricing.servicesTotal > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Servicios adicionales</span>
                      <span className="font-semibold">{formatCOP(pricing.servicesTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>IVA (19% DIAN)</span>
                    <span className="font-semibold">{formatCOP(pricing.taxAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                    <span>Total a Pagar (COP)</span>
                    <span className="font-serif text-lg text-gold-700">{formatCOP(pricing.total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Guest Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Nombre *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Carlos Alberto"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Apellido *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Gómez Restrepo"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos.gomez@gmail.com"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 310 456 7890"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Tipo de Documento</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="NIT">NIT Empresa</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Número de Documento *</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="1098765432"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold focus:border-gold-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Cancellation Policy Banner */}
              {pricing?.cancellationPolicy && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Política de Cancelación Hotel Portal del Norte</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    {pricing.cancellationPolicy.policyDescription}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-hotel-950 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total a Pagar</p>
                  <p className="font-serif text-2xl font-bold text-gold-300">
                    {pricing ? formatCOP(pricing.total) : formatCOP(room.pricePerNight)}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Huésped: <span className="font-semibold text-white">{firstName} {lastName}</span></p>
                  <p>{formatDateShort(checkIn)} al {formatDateShort(checkOut)}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-3 uppercase tracking-wider">
                  Seleccione su Método de Pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'TARJETA', label: 'Tarjeta Crédito / Débito', desc: 'Visa, Mastercard, Amex' },
                    { id: 'PSE', label: 'PSE Débito Bancario', desc: 'Todos los bancos de Colombia' },
                    { id: 'NEQUI', label: 'Nequi / Daviplata', desc: 'Pago instantáneo con QR o celular' },
                    { id: 'BANCOLOMBIA', label: 'Botón Bancolombia', desc: 'Transferencia directa' },
                    { id: 'EFECTIVO', label: 'Pago en Recepción', desc: 'Garantía con datos personales' },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        paymentMethod === method.id
                          ? 'bg-gold-50/80 border-gold-500 ring-2 ring-gold-400/40'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className={`w-5 h-5 mt-0.5 ${paymentMethod === method.id ? 'text-gold-600' : 'text-slate-400'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{method.label}</p>
                        <p className="text-[11px] text-slate-500">{method.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Transacción segura y encriptada. Emisión automática de comprobante y Factura Electrónica.</span>
              </div>
            </div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && confirmedBooking && (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Reserva Confirmada
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 mt-2">
                  ¡Gracias por su reserva, {confirmedBooking.guest?.firstName}!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hemos enviado los detalles completos a <span className="font-bold text-slate-700">{confirmedBooking.guest?.email}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Código de Reserva:</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{confirmedBooking.bookingCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Habitación:</span>
                  <span className="font-semibold text-slate-900">Hab. {confirmedBooking.room?.roomNumber} ({confirmedBooking.room?.roomType?.name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fechas de Estadía:</span>
                  <span className="font-semibold text-slate-900">{formatDateShort(confirmedBooking.checkInDate)} → {formatDateShort(confirmedBooking.checkOutDate)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm">
                  <span>Monto Pagado:</span>
                  <span className="text-emerald-700">{formatCOP(confirmedBooking.total)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3.5 rounded-2xl text-slate-950 font-bold text-sm gold-gradient hover:opacity-95 shadow-lg shadow-gold-500/25"
              >
                Finalizar y Ver Mis Reservas
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
            ) : <div />}

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={calculating || !pricing}
                className="px-6 py-3 rounded-xl text-slate-950 text-xs font-bold gold-gradient hover:opacity-95 shadow-md shadow-gold-500/20 flex items-center gap-2"
              >
                <span>Continuar a Datos del Huésped</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => {
                  if (!firstName || !lastName || !email || !phone || !documentNumber) {
                    setError('Por favor complete todos los campos obligatorios del huésped.');
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                className="px-6 py-3 rounded-xl text-slate-950 text-xs font-bold gold-gradient hover:opacity-95 shadow-md shadow-gold-500/20 flex items-center gap-2"
              >
                <span>Continuar a Pago</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleCreateAndPay}
                disabled={processing}
                className="px-8 py-3.5 rounded-xl text-slate-950 text-xs font-bold gold-gradient hover:opacity-95 shadow-lg shadow-gold-500/30 flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? 'Confirmando y Facturando...' : `Confirmar y Pagar (${pricing ? formatCOP(pricing.total) : ''})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
