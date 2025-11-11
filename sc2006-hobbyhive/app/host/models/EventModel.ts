export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  nearest_mrt_station?: string;
  nearest_mrt_distance?: number;
  description: string;
  capacity: string;
  category: string;
  skillLevel: string;
  image_url?: string;
}
