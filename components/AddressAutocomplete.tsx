"use client";

import { useEffect, useRef, useState } from "react";

// Declare global google namespace for TypeScript
declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Enter your address",
  required = false,
  className = "input input-bordered w-full",
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      console.log("Google Maps already loaded");
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key not found in environment variables");
      setScriptError(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );

    if (existingScript) {
      console.log("Google Maps script already exists, waiting for load");
      existingScript.addEventListener("load", () => {
        console.log("Existing script loaded");
        setIsLoaded(true);
      });
      return;
    }

    console.log("Loading Google Maps script...");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Global callback for when the script loads
    window.initGoogleMaps = () => {
      console.log("Google Maps loaded successfully");
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setScriptError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup callback
      delete window.initGoogleMaps;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || scriptError) {
      if (scriptError) {
        console.error("Cannot initialize autocomplete: script error");
      }
      return;
    }

    console.log("Initializing Google Places Autocomplete...");

    try {
      // Initialize autocomplete
      autocompleteRef.current = new window.google!.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: ["us", "ca"] }, // US and Canada
          fields: ["formatted_address", "geometry", "address_components"],
        }
      );

      console.log("Autocomplete initialized successfully");

      // Handle place selection - this is the primary event
      const listener = autocompleteRef.current.addListener("place_changed", () => {
        console.log("place_changed event fired");
        const place = autocompleteRef.current?.getPlace();
        console.log("Place data:", place);

        if (place?.formatted_address) {
          console.log("Updating with address:", place.formatted_address);
          onChange(place.formatted_address);

          if (onPlaceSelected) {
            onPlaceSelected(place);
          }
        } else {
          console.log("No formatted_address in place object");
        }
      });

      // Add mousedown listener to the document to catch pac-item clicks
      const handleDocumentClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Check if clicked element is a pac-item or child of pac-item
        const pacItem = target.closest('.pac-item');
        if (pacItem) {
          console.log("PAC item clicked, waiting for place_changed...");
          // Give Google Maps a moment to process the selection
          setTimeout(() => {
            const place = autocompleteRef.current?.getPlace();
            console.log("After PAC click, place:", place);
            if (place?.formatted_address) {
              onChange(place.formatted_address);
              if (onPlaceSelected) {
                onPlaceSelected(place);
              }
            }
          }, 50);
        }
      };

      document.addEventListener("mousedown", handleDocumentClick, true);

      return () => {
        if (listener) {
          window.google?.maps.event.removeListener(listener);
        }
        document.removeEventListener("mousedown", handleDocumentClick, true);
      };
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }
  }, [isLoaded, onChange, onPlaceSelected, scriptError]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
        disabled={scriptError}
      />
      {scriptError && (
        <p className="text-xs text-red-500 mt-1">
          Address autocomplete unavailable
        </p>
      )}
      {!isLoaded && !scriptError && (
        <p className="text-xs text-gray-400 mt-1">
          Loading address suggestions...
        </p>
      )}
      <style jsx global>{`
        .pac-container {
          z-index: 9999 !important;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          margin-top: 4px;
        }
        .pac-item {
          padding: 8px 12px;
          cursor: pointer;
          font-size: 14px;
          line-height: 1.5;
        }
        .pac-item:hover {
          background-color: #f9fafb;
        }
        .pac-item-selected {
          background-color: #f3f4f6;
        }
        .pac-icon {
          margin-right: 8px;
        }
        .pac-item-query {
          font-weight: 500;
          color: #111827;
        }
        .pac-matched {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
