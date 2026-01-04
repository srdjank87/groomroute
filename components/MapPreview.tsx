"use client";

import { MapPin, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface MapPreviewProps {
  lat: number | null;
  lng: number | null;
  address: string;
  geocodeStatus?: string;
  showMap?: boolean;
  locationVerified?: boolean;
  onVerifyLocation?: () => void;
  onGeocodeAddress?: () => void;
  isVerifying?: boolean;
}

export default function MapPreview({
  lat,
  lng,
  address,
  geocodeStatus = "OK",
  showMap = true,
  locationVerified = false,
  onVerifyLocation,
  onGeocodeAddress,
  isVerifying = false,
}: MapPreviewProps) {
  if (!lat || !lng || (geocodeStatus !== "OK" && geocodeStatus !== "PARTIAL")) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900">Location Not Geocoded</h4>
            <p className="text-sm text-yellow-700 mt-1">
              {geocodeStatus === "FAILED"
                ? "Unable to find this address on the map. Please verify the address is correct."
                : "Click the button to find this address on the map."}
            </p>
            {onGeocodeAddress && (
              <button
                onClick={onGeocodeAddress}
                disabled={isVerifying}
                className="btn btn-sm h-8 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1 mt-3"
              >
                {isVerifying ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                Find Location on Map
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Use Google Maps for linking
  const linkUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  // Google Maps Embed API URL
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=16`
    : null;

  return (
    <div className="space-y-3">
      {/* Success Message */}
      <div className={`border rounded-lg p-3 ${locationVerified ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-5 w-5 ${locationVerified ? 'text-green-600' : 'text-blue-600'}`} />
            <p className={`text-sm font-medium ${locationVerified ? 'text-green-900' : 'text-blue-900'}`}>
              {locationVerified ? 'Location verified' : 'Location found on map'}
            </p>
          </div>
          {!locationVerified && onVerifyLocation && (
            <button
              onClick={onVerifyLocation}
              disabled={isVerifying}
              className="btn btn-sm h-8 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1"
            >
              {isVerifying ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Confirm Location
            </button>
          )}
        </div>
      </div>

      {/* Address Display */}
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>{address}</span>
      </div>

      {/* Map Preview */}
      {showMap && embedUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <iframe
            title="Location Preview"
            src={embedUrl}
            className="w-full h-64"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          />
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open in Maps
          </a>
        </div>
      )}

      {/* Fallback if no API key */}
      {showMap && !embedUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#A5744A] transition-colors group"
        >
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
            <MapPin className="h-12 w-12 text-[#A5744A] mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">View Location on Map</p>
            <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Opens in Google Maps
            </p>
          </div>
        </a>
      )}

      {/* Coordinates */}
      <div className="text-xs text-gray-500">
        Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
      </div>
    </div>
  );
}
