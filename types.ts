export interface CostBreakdown {
  transportation: number; // Big transport (flights/trains)
  localTransport: number; // Taxi, subway
  accommodation: number;
  food: number;
  tickets: number;
  total: number;
  currency: string;
}

export interface Activity {
  time: string;
  location: string;
  description: string;
  type: 'sightseeing' | 'food' | 'transport' | 'scenic'; // scenic for sunrise/sunset/stars
}

export interface DayPlan {
  day: number;
  summary: string;
  activities: Activity[];
}

export interface TravelPlan {
  id: string;
  title: string;
  description: string;
  tags: string[];
  duration: string;
  cost: CostBreakdown;
  itinerary: DayPlan[];
  alerts: string[]; // Visa, safety, immigration
  scenicHighlights: string[]; // Specific mentions of sunrise, sunset, stars
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AIResponse {
  plans: TravelPlan[];
  groundingSources: GroundingSource[];
}

export enum ScenarioType {
  SUNRISE = '日出',
  SUNSET = '日落',
  STARS = '星空',
  CULTURE = '文化',
  NATURE = '自然'
}