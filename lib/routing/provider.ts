import { GoogleMapsProvider } from "./google-provider";
import { MapboxProvider } from "./mapbox-provider";
import { RoutingProvider } from "./types";

export function getRoutingProvider(): RoutingProvider {
  const provider = process.env.MAPS_PROVIDER || "google";

  switch (provider.toLowerCase()) {
    case "google":
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!googleApiKey) {
        throw new Error("GOOGLE_MAPS_API_KEY is not set");
      }
      return new GoogleMapsProvider(googleApiKey);

    case "mapbox":
      const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
      if (!mapboxToken) {
        throw new Error("MAPBOX_ACCESS_TOKEN is not set");
      }
      return new MapboxProvider(mapboxToken);

    default:
      throw new Error(`Unknown maps provider: ${provider}`);
  }
}
