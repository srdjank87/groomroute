import {
  GeocodeResult,
  OptimizeRouteParams,
  OptimizedRoute,
  RouteLeg,
  RoutingProvider,
} from "./types";

export class GoogleMapsProvider implements RoutingProvider {
  name = "google";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", address);
    url.searchParams.set("key", this.apiKey);

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          status: result.geometry.location_type === "ROOFTOP" ? "ok" : "partial",
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
    const {
      origin,
      waypoints,
      destination,
      returnToOrigin = true,
    } = params;

    // Use Directions API with waypoint optimization
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");

    // Origin
    url.searchParams.set("origin", `${origin.lat},${origin.lng}`);

    // Destination (return to origin if specified)
    const finalDestination = destination || (returnToOrigin ? origin : waypoints[waypoints.length - 1].location);
    url.searchParams.set("destination", `${finalDestination.lat},${finalDestination.lng}`);

    // Waypoints with optimization
    if (waypoints.length > 0) {
      const waypointsParam = waypoints
        .map((wp) => `${wp.location.lat},${wp.location.lng}`)
        .join("|");
      url.searchParams.set("waypoints", `optimize:true|${waypointsParam}`);
    }

    url.searchParams.set("key", this.apiKey);

    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0];

        // Extract optimized waypoint order
        const waypointOrder = data.routes[0].waypoint_order || [];

        // Extract legs
        const legs: RouteLeg[] = route.legs.map((leg: any, index: number) => ({
          fromIndex: index,
          toIndex: index + 1,
          durationMinutes: Math.round(leg.duration.value / 60),
          distanceMeters: leg.distance.value,
        }));

        const totalDurationMinutes = legs.reduce((sum, leg) => sum + leg.durationMinutes, 0);
        const totalDistanceMeters = legs.reduce((sum, leg) => sum + leg.distanceMeters, 0);

        return {
          waypointOrder,
          legs,
          totalDurationMinutes,
          totalDistanceMeters,
          polyline: route.overview_polyline?.points,
        };
      }

      throw new Error(`Google Maps API error: ${data.status}`);
    } catch (error) {
      console.error("Route optimization error:", error);
      throw error;
    }
  }
}
