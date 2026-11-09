export type OrderType = 'domicilio' | 'recoger';

export interface OrderCoords {
  lat: number;
  lng: number;
}

export interface OrderData {
  type: OrderType;
  name: string;
  phone: string;
  address: string;
  reference: string;
  coords: OrderCoords | null;
}
