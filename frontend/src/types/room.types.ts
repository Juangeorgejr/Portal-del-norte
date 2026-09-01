export type RoomOperationalStatus = 
  | 'DISPONIBLE'
  | 'OCUPADA'
  | 'LIMPIEZA'
  | 'MANTENIMIENTO'
  | 'FUERA_DE_SERVICIO';

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  active: boolean;
}

export interface RoomType {
  id: number;
  name: string;
  description: string;
  baseCapacity: number;
  baseBeds: number;
  basePricePerNight: number;
  active: boolean;
}

export interface Room {
  id: number;
  roomNumber: string;
  roomType: RoomType;
  description: string;
  capacity: number;
  bedCount: number;
  pricePerNight: number;
  operationalStatus: RoomOperationalStatus;
  floor: string;
  imageUrl: string;
  amenities: Amenity[];
  active: boolean;
}

export interface AvailabilitySearchParams {
  checkIn: string; // ISO date YYYY-MM-DD
  checkOut: string; // ISO date YYYY-MM-DD
  guests: number;
  roomTypeId?: number;
}
