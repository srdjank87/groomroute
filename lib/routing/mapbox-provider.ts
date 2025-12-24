import {
  GeocodeResult,
  OptimizeRouteParams,
  OptimizedRoute,
  RouteLeg,
  RoutingProvider,
} from "./types";

export class MapboxProvider implements RoutingProvider {
  name = "mapbox";
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`
    );
    url.searchParams.set("access_token", this.accessToken);
    url.searchParams.set("limit", "1");

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        return {
          lat,
          lng,
          formattedAddress: feature.place_name,
          status: feature.relevance > 0.9 ? "ok" : "partial",
        };
      }

      return {
        lat: 0,
        lng: 0,
        formattedAddress: address,
        status: "failed",
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      return {
        lat: 0,
        lng: 0,
        formattedAddress: address,
        status: "failed",
      };
    }
  }

  async optimizeRoute(params: OptimizeRouteParams): Promise<OptimizedRoute> {
    const { origin, waypoints, destination, returnToOrigin = true } = params;

    // Build coordinates array
    const coordinates: [number, number][] = [];

    // Start with origin
    coordinates.push([origin.lng, origin.lat]);

    // Add waypoints
    waypoints.forEach((wp) => {
      coordinates.push([wp.location.lng, wp.location.lat]);
    });

    // Add destination
    const finalDestination = destination || (returnToOrigin ? origin : waypoints[waypoints.length - 1].location);
    if (!returnToOrigin || destination) {
      coordinates.push([finalDestination.lng, finalDestination.lat]);
    } else {
      // Return to origin
      coordinates.push([origin.lng, origin.lat]);
    }

    // Mapbox Optimization API
    const coordinatesStr = coordinates.map((c) => c.join(",")).join(";");
    const url = new URL(
      `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinatesStr}`
    );
    url.searchParams.set("access_token", this.accessToken);
    url.searchParams.set("source", "first");
    url.searchParams.set("destination", returnToOrigin ? "first" : "last");
    url.searchParams.set("roundtrip", returnToOrigin.toString());
    url.searchParams.set("geometries", "polyline");

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.code === "Ok" && data.trips && data.trips.length > 0) {
        const trip = data.trips[0];

        // Extract waypoint order
        const waypointOrder = data.waypoints
          .slice(1, -1) // Exclude origin and destination
          .map((wp: any) => wp.waypoint_index - 1);

        // Extract legs
        const legs: RouteLeg[] = trip.legs.map((leg: any, index: number) => ({
          fromIndex: index,
          toIndex: index + 1,
          durationMinutes: Math.round(leg.duration / 60),
          distanceMeters: Math.round(leg.distance),
        }));

        const totalDurationMinutes = Math.round(trip.duration / 60);
        const totalDistanceMeters = Math.round(trip.distance);

        return {
          waypointOrder,
          legs,
          totalDurationMinutes,
          totalDistanceMeters,
          polyline: trip.geometry,
        };
      }

      throw new Error(`Mapbox API error: ${data.code}`);
    } catch (error) {
      console.error("Route optimization error:", error);
      throw error;
    }
  }
}
