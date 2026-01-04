/**
 * Geocoding Service
 *
 * Currently uses OpenStreetMap Nominatim (free, no API key needed)
 * Can be swapped to Google Maps Geocoding API when ready
 */

export interface GeocodingResult {
  success: boolean;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  error?: string;
}

/**
 * Geocode an address using OpenStreetMap Nominatim
 * Free tier: Rate limited to 1 request/second
 *
 * To use Google Maps instead:
 * 1. Add GOOGLE_MAPS_API_KEY to .env
 * 2. Uncomment geocodeWithGoogle function
 * 3. Call geocodeWithGoogle instead of geocodeWithNominatim
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    // Use OpenStreetMap Nominatim (free)
    return await geocodeWithNominatim(address);

    // Or use Google Maps (requires API key)
    // return await geocodeWithGoogle(address);
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      error: "Failed to geocode address",
    };
  }
}

/**
 * Geocode using OpenStreetMap Nominatim (FREE)
 */
async function geocodeWithNominatim(address: string): Promise<GeocodingResult> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "GroomRoute/1.0", // Nominatim requires User-Agent
    },
  });

  if (!response.ok) {
    return {
      success: false,
      error: "Geocoding service unavailable",
    };
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    return {
      success: false,
      error: "Address not found",
    };
  }

  const result = data[0];

  return {
    success: true,
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    formattedAddress: result.display_name,
  };
}

/**
 * Geocode using Google Maps Geocoding API (PAID - requires API key)
 * Uncomment and use when ready to switch to Google Maps
 */
/*
async function geocodeWithGoogle(address: string): Promise<GeocodingResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY not configured");
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    return {
      success: false,
      error: data.status === "ZERO_RESULTS" ? "Address not found" : "Geocoding failed",
    };
  }

  const result = data.results[0];
  const location = result.geometry.location;

  return {
    success: true,
    lat: location.lat,
    lng: location.lng,
    formattedAddress: result.formatted_address,
  };
}
*/

/**
 * Generate a static map image URL (for previewing location)
 * Uses OpenStreetMap tiles - free, no API key needed
 */
export function getStaticMapUrl(lat: number, lng: number, zoom: number = 15): string {
  // For now, return a link to OpenStreetMap
  // This can be replaced with Google Maps Static API or Mapbox Static Images API
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}

/**
 * Generate an embeddable map iframe URL
 * Uses OpenStreetMap - free
 */
export function getEmbedMapUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
}
