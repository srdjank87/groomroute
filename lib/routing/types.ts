// Routing provider types

export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
  status: "ok" | "partial" | "failed";
};

export type Location = {
  lat: number;
  lng: number;
  address?: string;
};

export type RouteWaypoint = {
  location: Location;
  appointmentId?: string;
  serviceMinutes?: number;
  earliestStart?: Date;
  latestEnd?: Date;
};

export type RouteLeg = {
  fromIndex: number;
  toIndex: number;
  durationMinutes: number;
  distanceMeters: number;
};

export type OptimizedRoute = {
  waypointOrder: number[]; // Indices of waypoints in optimized order
  legs: RouteLeg[];
  totalDurationMinutes: number;
  totalDistanceMeters: number;
  polyline?: string; // Encoded polyline for map display
};

export type OptimizeRouteParams = {
  origin: Location;
  waypoints: RouteWaypoint[];
  destination?: Location; // If null, uses origin as destination
  startTime?: Date;
  returnToOrigin?: boolean;
};

export interface RoutingProvider {
  name: string;
  geocodeAddress(address: string): Promise<GeocodeResult>;
  optimizeRoute(params: OptimizeRouteParams): Promise<OptimizedRoute>;
}
