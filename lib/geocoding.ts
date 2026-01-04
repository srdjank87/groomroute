/**
 * Geocoding Service
 *
 * Uses Google Maps Geocoding API for accurate address lookup
 */

export interface GeocodingResult {
  success: boolean;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  error?: string;
}

/**
 * Geocode an address using Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    // Use Google Maps Geocoding API
    return await geocodeWithGoogle(address);
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      error: "Failed to geocode address",
    };
  }
}

/**
 * Geocode using Google Maps Geocoding API
 */
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

/**
 * Geocode using OpenStreetMap Nominatim (FREE - fallback option)
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
 * Generate a Google Maps URL for viewing a location
 */
export function getStaticMapUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Generate a Google Maps URL for embedding or viewing
 */
export function getEmbedMapUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
