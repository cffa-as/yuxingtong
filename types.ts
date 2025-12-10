export interface WeatherAlert {
  type: 'rain' | 'wind' | 'flood' | 'road_closure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
  timestamp: string;
}

export interface RouteOption {
  id: string;
  name: string;
  duration: number; // minutes
  rainExposure: number; // minutes of walking in rain
  isSheltered: boolean;
  safetyScore: number; // 0-100
  type: 'fastest' | 'least_rain' | 'balanced';
  tags: string[]; // e.g., "地下通道", "商场穿行"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface TravelChecklist {
  gear: string[];
  safetyTips: string[];
  weatherSummary: string;
  clothingRecommendation: string;
}

export enum AppTab {
  MAP = 'MAP',
  STATUS = 'STATUS',
  CHAT = 'CHAT',
  ALERTS = 'ALERTS',
  DIY = 'DIY'
}

export type PoiType = 'shelter' | 'parking' | 'umbrella' | 'pickup' | 'flood_risk';

export interface Poi {
  id: string;
  type: PoiType;
  name: string;
  distance: string;
  status: string; // e.g., "营业中", "剩余5把", "室内"
  lat: number;
  lng: number;
}