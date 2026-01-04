"use client";

import { MapPin, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface MapPreviewProps {
  lat: number | null;
  lng: number | null;
  address: string;
  geocodeStatus?: string;
  showMap?: boolean;
}

export default function MapPreview({
  lat,
  lng,
  address,
  geocodeStatus = "OK",
  showMap = true,
}: MapPreviewProps) {
  if (!lat || !lng || (geocodeStatus !== "OK" && geocodeStatus !== "PARTIAL")) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900">Location Not Verified</h4>
            <p className="text-sm text-yellow-700 mt-1">
              {geocodeStatus === "FAILED"
                ? "Unable to find this address on the map. Please verify the address is correct."
                : "Location verification pending..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`;
  const linkUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="space-y-3">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-900">
            Location found and verified
          </p>
        </div>
      </div>

      {/* Address Display */}
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>{address}</span>
      </div>

      {/* Map Preview */}
      {showMap && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <iframe
            title="Location Preview"
            src={mapUrl}
            className="w-full h-64"
            style={{ border: 0 }}
            loading="lazy"
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

      {/* Coordinates */}
      <div className="text-xs text-gray-500">
        Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
      </div>
    </div>
  );
}
