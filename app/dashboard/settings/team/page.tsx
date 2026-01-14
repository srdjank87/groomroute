"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Minus,
  Users,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Crown,
  Shield,
  Scissors,
  UserPlus,
  Copy,
  Check,
  X,
  RefreshCw,
  Loader2,
  Link2,
  Unlink,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useFeature } from "@/hooks/useFeatures";

interface Groomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  baseAddress: string;
  workingHoursStart: string | null;
  workingHoursEnd: string | null;
  isActive: boolean;
  defaultHasAssistant: boolean;
  largeDogDailyLimit: number | null;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "GROOMER" | "VIEWER";
  createdAt: string;
  isCurrentUser: boolean;
  groomerId: string | null;
  groomer: { id: string; name: string } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: "ADMIN" | "GROOMER";
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

interface SeatInfo {
  total: number;
  used: number;
  pending: number;
  available: number;
}

export default function TeamSettingsPage() {
  const { hasAccess: hasMultiGroomer, isLoading: isCheckingAccess, plan } = useFeature("multi_groomer");

  // Groomer profiles (van/service units)
  const [groomers, setGroomers] = useState<Groomer[]>([]);
  const [isLoadingGroomers, setIsLoadingGroomers] = useState(true);
  const [showGroomerModal, setShowGroomerModal] = useState(false);
  const [editingGroomer, setEditingGroomer] = useState<Groomer | null>(null);
  const [isSavingGroomer, setIsSavingGroomer] = useState(false);

  // Team members (user accounts)
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [adminSeats, setAdminSeats] = useState<SeatInfo>({ total: 1, used: 1, pending: 0, available: 0 });
  const [groomerSeats, setGroomerSeats] = useState<SeatInfo>({ total: 0, used: 0, pending: 0, available: 0 });
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  // Seat management
  const [seatPricing, setSeatPricing] = useState<{
    additionalAdminAmount: number;
    groomerAmount: number;
    billing: "monthly" | "yearly";
  } | null>(null);
  const [isUpdatingSeats, setIsUpdatingSeats] = useState(false);

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "GROOMER">("GROOMER");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Groomer form state
  const [groomerFormData, setGroomerFormData] = useState({
    name: "",
    email: "",
    phone: "",
    baseAddress: "",
    workingHoursStart: "08:00",
    workingHoursEnd: "17:00",
    defaultHasAssistant: false,
    largeDogDailyLimit: "",
  });

  useEffect(() => {
    fetchGroomers();
    if (hasMultiGroomer) {
      fetchTeamData();
    }
  }, [hasMultiGroomer]);

  const fetchGroomers = async () => {
    try {
      const response = await fetch("/api/groomers?active=false");
      if (response.ok) {
        const data = await response.json();
        setGroomers(data.groomers || []);
      }
    } catch (error) {
      console.error("Failed to fetch groomers:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoadingGroomers(false);
    }
  };

  const fetchTeamData = async () => {
    setIsLoadingTeam(true);
    try {
      const [membersRes, invitationsRes, seatsRes] = await Promise.all([
        fetch("/api/team/members"),
        fetch("/api/team/invitations"),
        fetch("/api/subscription/seats"),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data.members || []);
        setAdminSeats(data.seats?.admin || { total: 1, used: 1, pending: 0, available: 0 });
        setGroomerSeats(data.seats?.groomer || { total: 0, used: 0, pending: 0, available: 0 });
      }

      if (invitationsRes.ok) {
        const data = await invitationsRes.json();
        setInvitations(data.invitations || []);
      }

      if (seatsRes.ok) {
        const data = await seatsRes.json();
        setSeatPricing(data.pricing);
      }
    } catch (error) {
      console.error("Failed to fetch team data:", error);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleUpdateSeats = async (type: "admin" | "groomer", delta: number) => {
    const currentTotal = type === "admin" ? adminSeats.total : groomerSeats.total;
    const newTotal = Math.max(type === "admin" ? 1 : 0, currentTotal + delta);

    // Check if decreasing below used count
    const usedCount = type === "admin" ? adminSeats.used + adminSeats.pending : groomerSeats.used + groomerSeats.pending;
    if (newTotal < usedCount) {
      toast.error(`Cannot reduce below ${usedCount} - remove team members first`);
      return;
    }

    if (newTotal === currentTotal) return;

    setIsUpdatingSeats(true);
    try {
      const response = await fetch("/api/subscription/seats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "admin"
            ? { adminSeats: newTotal }
            : { groomerSeats: newTotal }
        ),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === "admin") {
          setAdminSeats((prev) => ({ ...prev, total: data.adminSeats, available: data.adminSeats - prev.used - prev.pending }));
        } else {
          setGroomerSeats((prev) => ({ ...prev, total: data.groomerSeats, available: data.groomerSeats - prev.used - prev.pending }));
        }
        toast.success(`${type === "admin" ? "Admin" : "Groomer"} seats updated`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update seats");
      }
    } catch (error) {
      console.error("Failed to update seats:", error);
      toast.error("Failed to update seats");
    } finally {
      setIsUpdatingSeats(false);
    }
  };

  const resetGroomerForm = () => {
    setGroomerFormData({
      name: "",
      email: "",
      phone: "",
      baseAddress: "",
      workingHoursStart: "08:00",
      workingHoursEnd: "17:00",
      defaultHasAssistant: false,
      largeDogDailyLimit: "",
    });
  };

  const openGroomerModal = (groomer?: Groomer) => {
    if (groomer) {
      setGroomerFormData({
        name: groomer.name,
        email: groomer.email || "",
        phone: groomer.phone || "",
        baseAddress: groomer.baseAddress,
        workingHoursStart: groomer.workingHoursStart || "08:00",
        workingHoursEnd: groomer.workingHoursEnd || "17:00",
        defaultHasAssistant: groomer.defaultHasAssistant,
        largeDogDailyLimit: groomer.largeDogDailyLimit?.toString() || "",
      });
      setEditingGroomer(groomer);
    } else {
      resetGroomerForm();
      setEditingGroomer(null);
    }
    setShowGroomerModal(true);
  };

  const handleSaveGroomer = async () => {
    if (!groomerFormData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!groomerFormData.baseAddress.trim()) {
      toast.error("Base address is required");
      return;
    }

    setIsSavingGroomer(true);
    try {
      const payload = {
        name: groomerFormData.name.trim(),
        email: groomerFormData.email.trim() || null,
        phone: groomerFormData.phone.trim() || null,
        baseAddress: groomerFormData.baseAddress.trim(),
        workingHoursStart: groomerFormData.workingHoursStart,
        workingHoursEnd: groomerFormData.workingHoursEnd,
        defaultHasAssistant: groomerFormData.defaultHasAssistant,
        largeDogDailyLimit: groomerFormData.largeDogDailyLimit
          ? parseInt(groomerFormData.largeDogDailyLimit)
          : null,
      };

      const url = editingGroomer
        ? `/api/groomers/${editingGroomer.id}`
        : "/api/groomers";
      const method = editingGroomer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          editingGroomer ? "Groomer updated" : "Groomer added"
        );
        setShowGroomerModal(false);
        fetchGroomers();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save groomer");
    } finally {
      setIsSavingGroomer(false);
    }
  };

  const handleDeactivateGroomer = async (groomer: Groomer) => {
    if (!confirm(`Deactivate ${groomer.name}? They will no longer appear in scheduling.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/groomers/${groomer.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Groomer deactivated");
        fetchGroomers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to deactivate");
      }
    } catch (error) {
      console.error("Deactivate error:", error);
      toast.error("Failed to deactivate groomer");
    }
  };

  const handleReactivateGroomer = async (groomer: Groomer) => {
    try {
      const response = await fetch(`/api/groomers/${groomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });

      if (response.ok) {
        toast.success("Groomer reactivated");
        fetchGroomers();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reactivate");
      }
    } catch (error) {
      console.error("Reactivate error:", error);
      toast.error("Failed to reactivate groomer");
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Invitation sent!");
        setInviteLink(data.inviteLink);
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Invite error:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRevokeInvitation = async (id: string) => {
    if (!confirm("Revoke this invitation?")) return;

    try {
      const response = await fetch(`/api/team/invitations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Invitation revoked");
        fetchTeamData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to revoke invitation");
      }
    } catch (error) {
      console.error("Revoke error:", error);
      toast.error("Failed to revoke invitation");
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(`Remove ${member.name || member.email} from the team? They will lose access to the account.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/team/members/${member.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Team member removed");
        fetchTeamData();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove team member");
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInviteEmail("");
    setInviteRole("GROOMER");
    setInviteLink(null);
    setCopiedLink(false);
  };

  const handleLinkGroomer = async (memberId: string, groomerId: string | null) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groomerId }),
      });

      if (response.ok) {
        toast.success(groomerId ? "Linked to groomer profile" : "Unlinked from groomer profile");
        fetchTeamData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update");
      }
    } catch (error) {
      console.error("Link error:", error);
      toast.error("Failed to link to groomer profile");
    }
  };

  // Show loading state
  if (isCheckingAccess || isLoadingGroomers) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Show upgrade prompt for non-Pro users
  if (!hasMultiGroomer) {
    const activeGroomers = groomers.filter((g) => g.isActive);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage groomers and vans in your business
          </p>
        </div>

        {/* Current Groomer Info */}
        {activeGroomers.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Groomer Profile
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">
                {activeGroomers[0].name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {activeGroomers[0].baseAddress}
              </p>
              {activeGroomers[0].workingHoursStart && (
                <p className="text-sm text-gray-500 mt-1">
                  Working hours: {activeGroomers[0].workingHoursStart} -{" "}
                  {activeGroomers[0].workingHoursEnd}
                </p>
              )}
            </div>
            <Link
              href="/dashboard/settings/profile"
              className="mt-4 inline-block text-sm text-[#A5744A] hover:underline font-medium"
            >
              Edit in Workload Protection settings →
            </Link>
          </div>
        )}

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Multi-Groomer Support
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add multiple groomers, manage team schedules, and view per-groomer
            analytics with the Pro plan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Multiple vans</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Team calendar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span>Per-groomer routes</span>
            </div>
          </div>

          <Link
            href="/dashboard/settings/billing"
            className="btn bg-purple-600 hover:bg-purple-700 text-white border-0 gap-2 px-6"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
          <p className="text-xs text-gray-500 mt-3">
            Current plan: {plan || "Trial"}
          </p>
        </div>
      </div>
    );
  }

  // Pro users - show full team management
  const activeGroomers = groomers.filter((g) => g.isActive);
  const inactiveGroomers = groomers.filter((g) => !g.isActive);
  const pendingInvitations = invitations.filter((i) => i.status === "PENDING" && !i.isExpired);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-1">
          Manage team members and groomer profiles
        </p>
      </div>

      {/* Seat Overview */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Seat Management</h2>
          <Link
            href="/dashboard/settings/billing"
            className="text-sm text-[#A5744A] hover:underline"
          >
            View billing →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admin Seats */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Admin Seats</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUpdateSeats("admin", -1)}
                  disabled={isUpdatingSeats || adminSeats.total <= 1}
                  className="btn btn-xs btn-circle btn-ghost text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                  title="Remove seat"
                >
                  {isUpdatingSeats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </button>
                <span className="w-8 text-center font-bold text-purple-600">
                  {adminSeats.total}
                </span>
                <button
                  onClick={() => handleUpdateSeats("admin", 1)}
                  disabled={isUpdatingSeats}
                  className="btn btn-xs btn-circle btn-ghost text-purple-600 hover:bg-purple-100 disabled:opacity-50"
                  title="Add seat"
                >
                  {isUpdatingSeats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {adminSeats.used} used
                  {adminSeats.pending > 0 && ` • ${adminSeats.pending} pending`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {adminSeats.available} available
                </p>
              </div>
              {seatPricing && (
                <p className="text-xs text-purple-600 font-medium">
                  ${seatPricing.additionalAdminAmount}/{seatPricing.billing === "yearly" ? "yr" : "mo"} each
                </p>
              )}
            </div>
          </div>

          {/* Groomer Seats */}
          <div className="p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-gray-900">Groomer Seats</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUpdateSeats("groomer", -1)}
                  disabled={isUpdatingSeats || groomerSeats.total <= 0}
                  className="btn btn-xs btn-circle btn-ghost text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                  title="Remove seat"
                >
                  {isUpdatingSeats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </button>
                <span className="w-8 text-center font-bold text-emerald-600">
                  {groomerSeats.total}
                </span>
                <button
                  onClick={() => handleUpdateSeats("groomer", 1)}
                  disabled={isUpdatingSeats}
                  className="btn btn-xs btn-circle btn-ghost text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
                  title="Add seat"
                >
                  {isUpdatingSeats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {groomerSeats.used} used
                  {groomerSeats.pending > 0 && ` • ${groomerSeats.pending} pending`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {groomerSeats.available} available
                </p>
              </div>
              {seatPricing && (
                <p className="text-xs text-emerald-600 font-medium">
                  ${seatPricing.groomerAmount}/{seatPricing.billing === "yearly" ? "yr" : "mo"} each
                </p>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Changes are prorated and applied immediately to your subscription
        </p>
      </div>

      {/* Team Members Section */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Team Members ({members.length})
            </h2>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1 px-3"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </button>
        </div>

        {isLoadingTeam ? (
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => {
              const activeGroomersList = groomers.filter((g) => g.isActive);
              const needsLinking = member.role === "GROOMER" && !member.groomerId;

              return (
                <div
                  key={member.id}
                  className={`p-4 hover:bg-gray-50 ${needsLinking ? "bg-amber-50/50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          member.role === "ADMIN" ? "bg-purple-100" : "bg-emerald-100"
                        }`}
                      >
                        {member.role === "ADMIN" ? (
                          <Shield className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Scissors className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {member.name || "Unnamed"}
                          </p>
                          {member.isCurrentUser && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          member.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {member.role}
                      </span>
                      {!member.isCurrentUser && (
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Groomer Profile Linking */}
                  {member.role === "GROOMER" && (
                    <div className="mt-3 ml-11">
                      {member.groomer ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Link2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-gray-600">
                            Linked to: <span className="font-medium text-gray-900">{member.groomer.name}</span>
                          </span>
                          <button
                            onClick={() => handleLinkGroomer(member.id, null)}
                            className="text-xs text-red-600 hover:underline flex items-center gap-1"
                          >
                            <Unlink className="h-3 w-3" />
                            Unlink
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm text-amber-700">Not linked to a groomer profile</span>
                          {activeGroomersList.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleLinkGroomer(member.id, e.target.value);
                                }
                              }}
                              className="select select-xs select-bordered ml-2"
                              defaultValue=""
                            >
                              <option value="" disabled>Link to...</option>
                              {activeGroomersList.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <>
            <div className="p-3 bg-gray-50 border-t border-b">
              <p className="text-sm font-medium text-gray-600">
                Pending Invitations ({pendingInvitations.length})
              </p>
            </div>
            <div className="divide-y">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 flex items-center justify-between bg-amber-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Mail className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{inv.email}</p>
                      <p className="text-sm text-gray-500">
                        Invited as {inv.role} • Expires{" "}
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeInvitation(inv.id)}
                    className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Groomer Profiles Section */}
      <div className="bg-white rounded-xl shadow mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Groomer Profiles ({activeGroomers.length})
            </h2>
          </div>
          <button
            onClick={() => openGroomerModal()}
            className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1 px-3"
          >
            <Plus className="h-4 w-4" />
            Add Groomer
          </button>
        </div>
        <p className="px-4 py-2 text-sm text-gray-500 bg-gray-50 border-b">
          Groomer profiles represent vans/service units for scheduling and routing.
        </p>
        <div className="divide-y">
          {activeGroomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No groomer profiles. Add your first groomer to get started.
            </div>
          ) : (
            activeGroomers.map((groomer) => (
              <div
                key={groomer.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{groomer.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {groomer.baseAddress}
                    </span>
                    {groomer.workingHoursStart && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {groomer.workingHoursStart} - {groomer.workingHoursEnd}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openGroomerModal(groomer)}
                    className="btn btn-ghost btn-sm gap-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivateGroomer(groomer)}
                    className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inactive Groomers */}
      {inactiveGroomers.length > 0 && (
        <div className="bg-white rounded-xl shadow">
          <div className="p-4 border-b flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-500">
              Inactive Groomer Profiles ({inactiveGroomers.length})
            </h2>
          </div>
          <div className="divide-y opacity-60">
            {inactiveGroomers.map((groomer) => (
              <div
                key={groomer.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-700">{groomer.name}</p>
                  <p className="text-sm text-gray-500">{groomer.baseAddress}</p>
                </div>
                <button
                  onClick={() => handleReactivateGroomer(groomer)}
                  className="btn btn-ghost btn-sm text-emerald-600 hover:bg-emerald-50"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {inviteLink ? "Invitation Sent!" : "Invite Team Member"}
              </h3>
              <button
                onClick={closeInviteModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ×
              </button>
            </div>

            {inviteLink ? (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-gray-600">
                    Share this link with <strong>{inviteEmail}</strong> to join your team.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="input input-bordered flex-1 text-sm bg-gray-50 min-w-0"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 px-4 min-w-[52px] flex-shrink-0"
                  >
                    {copiedLink ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  This link expires in 7 days
                </p>
                <button
                  onClick={closeInviteModal}
                  className="btn btn-ghost w-full mt-4"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="input input-bordered w-full"
                    disabled={isSendingInvite}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInviteRole("GROOMER")}
                      disabled={groomerSeats.available <= 0}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        inviteRole === "GROOMER"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${groomerSeats.available <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Scissors className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Groomer</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Schedule & route access
                      </p>
                      {groomerSeats.available <= 0 && (
                        <p className="text-xs text-red-500 mt-1">No seats available</p>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteRole("ADMIN")}
                      disabled={adminSeats.available <= 0}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        inviteRole === "ADMIN"
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${adminSeats.available <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Admin</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Full access to all features
                      </p>
                      {adminSeats.available <= 0 && (
                        <p className="text-xs text-red-500 mt-1">No seats available</p>
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSendInvite}
                    disabled={isSendingInvite || (inviteRole === "ADMIN" ? adminSeats.available <= 0 : groomerSeats.available <= 0)}
                    className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 w-full gap-2"
                  >
                    {isSendingInvite ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Send Invitation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groomer Modal */}
      {showGroomerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingGroomer ? "Edit Groomer Profile" : "Add Groomer Profile"}
              </h3>
              <button
                onClick={() => setShowGroomerModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={groomerFormData.name}
                  onChange={(e) =>
                    setGroomerFormData({ ...groomerFormData, name: e.target.value })
                  }
                  placeholder="John Smith"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={groomerFormData.email}
                  onChange={(e) =>
                    setGroomerFormData({ ...groomerFormData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={groomerFormData.phone}
                  onChange={(e) =>
                    setGroomerFormData({ ...groomerFormData, phone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Address (Start/End Location) *
                </label>
                <input
                  type="text"
                  value={groomerFormData.baseAddress}
                  onChange={(e) =>
                    setGroomerFormData({ ...groomerFormData, baseAddress: e.target.value })
                  }
                  placeholder="123 Main St, City, State ZIP"
                  className="input input-bordered w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Where this groomer starts and ends their day
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={groomerFormData.workingHoursStart}
                    onChange={(e) =>
                      setGroomerFormData({
                        ...groomerFormData,
                        workingHoursStart: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={groomerFormData.workingHoursEnd}
                    onChange={(e) =>
                      setGroomerFormData({
                        ...groomerFormData,
                        workingHoursEnd: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Large Dog Limit
                </label>
                <input
                  type="number"
                  value={groomerFormData.largeDogDailyLimit}
                  onChange={(e) =>
                    setGroomerFormData({
                      ...groomerFormData,
                      largeDogDailyLimit: e.target.value,
                    })
                  }
                  placeholder="No limit"
                  min="0"
                  className="input input-bordered w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no limit</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasAssistant"
                  checked={groomerFormData.defaultHasAssistant}
                  onChange={(e) =>
                    setGroomerFormData({
                      ...groomerFormData,
                      defaultHasAssistant: e.target.checked,
                    })
                  }
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <label htmlFor="hasAssistant" className="text-sm text-gray-700">
                  Usually works with a bather/assistant
                </label>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowGroomerModal(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroomer}
                disabled={isSavingGroomer}
                className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-4"
              >
                {isSavingGroomer && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {editingGroomer ? "Save Changes" : "Add Groomer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
