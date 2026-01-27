"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Calendar, Scissors, MapPin } from "lucide-react";
import Link from "next/link";

interface ConfirmationData {
  appointmentId: string;
  groomerName: string;
  date: string;
  time: string;
  clientName: string;
  petName: string;
}

export default function BookingSuccessPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`booking_confirmation_${slug}`);
    if (stored) {
      setConfirmation(JSON.parse(stored));
    }
  }, [slug]);

  // Format date for display
  const formattedDate = confirmation?.date
    ? new Date(confirmation.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Format time for display
  const formattedTime = confirmation?.time
    ? (() => {
        const [hours, minutes] = confirmation.time.split(":");
        const hour = parseInt(hours);
        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${period}`;
      })()
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <Scissors className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {confirmation?.groomerName || "Mobile Pet Grooming"}
              </h1>
              <p className="text-sm text-gray-500">Mobile Pet Grooming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Success icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-8">
            {confirmation
              ? `We've received your booking request for ${confirmation.petName}.`
              : "Your booking has been submitted."}
          </p>

          {confirmation && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">
                Appointment Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                    <p className="text-gray-600">{formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Mobile Grooming
                    </p>
                    <p className="text-gray-600">We come to you!</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium text-gray-900">
                      {confirmation.clientName}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Pet:</span>
                    <span className="font-medium text-gray-900">
                      {confirmation.petName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              The groomer will review your booking and confirm shortly. You will
              receive a confirmation via email or text.
            </p>

            <Link
              href={`/book/${slug}`}
              className="btn btn-outline w-full"
            >
              Book Another Appointment
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Contact your groomer directly.
        </p>
      </div>
    </div>
  );
}
