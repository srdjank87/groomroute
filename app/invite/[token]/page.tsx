"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Users, Shield, Scissors, CheckCircle, AlertCircle } from "lucide-react";

interface InvitationDetails {
  email: string;
  role: "ADMIN" | "GROOMER";
  businessName: string;
  expiresAt: string;
}

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invite/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid invitation");
        return;
      }

      setInvitation(data.invitation);
    } catch (err) {
      setError("Failed to load invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/invite/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccess(true);
      toast.success("Account created successfully!");

      // Redirect to sign in after a moment
      setTimeout(() => {
        router.push(`/auth/signin?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <span className="loading loading-spinner loading-lg text-[#A5744A]"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Invalid
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/auth/signin"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to the Team!
            </h1>
            <p className="text-gray-600 mb-4">
              Your account has been created. Redirecting to sign in...
            </p>
            <span className="loading loading-spinner loading-md text-[#A5744A]"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const roleInfo = {
    ADMIN: {
      icon: Shield,
      label: "Admin",
      description: "Full access to all features including billing and team management",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    GROOMER: {
      icon: Scissors,
      label: "Groomer",
      description: "Access to your daily schedule, route, and customer details",
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
  };

  const role = roleInfo[invitation.role];
  const RoleIcon = role.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#A5744A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-[#A5744A]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Join {invitation.businessName}
            </h1>
            <p className="text-gray-600">
              You&apos;ve been invited to join as a team member
            </p>
          </div>

          {/* Role Badge */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${role.bg} rounded-lg`}>
                <RoleIcon className={`h-5 w-5 ${role.color}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {role.label} Access
                </p>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </div>
          </div>

          {/* Email Display */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="input input-bordered w-full bg-gray-100 flex items-center text-gray-600">
              {invitation.email}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is the email your invitation was sent to
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={isSubmitting}
                placeholder="John Smith"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Create Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="input input-bordered w-full"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                className="input input-bordered w-full"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full text-white bg-[#A5744A] hover:bg-[#8B6239] border-0 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating account...
                </>
              ) : (
                "Create Account & Join Team"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-[#A5744A] hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
