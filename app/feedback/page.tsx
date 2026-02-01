"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FeedbackForm() {
  const searchParams = useSearchParams();
  const initialScore = Number(searchParams.get("score")) || 0;
  const email = searchParams.get("u") || "";

  const [score, setScore] = useState(initialScore);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-submit the score on load if we have one from the email link
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  useEffect(() => {
    if (initialScore >= 1 && initialScore <= 10 && email && !scoreSubmitted) {
      setScoreSubmitted(true);
    }
  }, [initialScore, email, scoreSubmitted]);

  const handleSubmit = async () => {
    if (!email || score < 1 || score > 10) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, score, comment }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">This feedback link appears to be invalid.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-4xl mb-4">
            {score >= 9 ? "🎉" : score >= 7 ? "😊" : "🙏"}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
          <p className="text-gray-600">
            {score >= 9
              ? "We're thrilled you love GroomRoute! Your support means the world to us."
              : score >= 7
                ? "Thanks for the feedback! We're always working to make GroomRoute better."
                : "We appreciate your honest feedback. We'll use it to improve GroomRoute."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Groom<span className="text-[#A5744A]">Route</span> Feedback
          </h1>
          <p className="text-gray-600 text-sm">How likely are you to recommend us?</p>
        </div>

        {/* Score buttons */}
        <div className="flex justify-center gap-1.5 mb-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setScore(n)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                score === n
                  ? "ring-2 ring-offset-1 ring-[#A5744A] scale-110"
                  : ""
              } ${
                n <= 2
                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                  : n <= 7
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-6 px-1">
          <span>Not likely</span>
          <span>Very likely</span>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Anything you&apos;d like to share? (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="textarea textarea-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 pl-4 pt-3"
            placeholder="What do you love? What could be better?"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={score < 1 || isLoading}
          className="btn w-full bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <FeedbackForm />
    </Suspense>
  );
}
