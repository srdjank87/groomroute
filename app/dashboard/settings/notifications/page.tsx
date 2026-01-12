"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save, Bell, MessageSquare, Clock, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type MessageType =
  | "REMINDER_24HR"
  | "REMINDER_2HR"
  | "ON_MY_WAY"
  | "RUNNING_LATE"
  | "CONFIRMATION_REQUEST"
  | "GAP_FILL_OFFER"
  | "CUSTOM";

interface MessageTemplate {
  id: string;
  name: string;
  type: MessageType;
  content: string;
  isActive: boolean;
}

const templateTypeInfo: Record<MessageType, { label: string; description: string; icon: string }> = {
  REMINDER_24HR: {
    label: "24 Hour Reminder",
    description: "Sent automatically 24 hours before appointment",
    icon: "bell",
  },
  REMINDER_2HR: {
    label: "2 Hour Reminder",
    description: "Sent automatically 2 hours before appointment",
    icon: "bell",
  },
  ON_MY_WAY: {
    label: "On My Way",
    description: "Quick message to let clients know you're heading over",
    icon: "navigation",
  },
  RUNNING_LATE: {
    label: "Running Late",
    description: "Apologize and give updated ETA",
    icon: "clock",
  },
  CONFIRMATION_REQUEST: {
    label: "Confirmation Request",
    description: "Ask clients to confirm their appointment",
    icon: "check",
  },
  GAP_FILL_OFFER: {
    label: "Gap Fill Offer",
    description: "Offer last-minute availability to waitlist clients",
    icon: "calendar",
  },
  CUSTOM: {
    label: "Custom",
    description: "Your own custom message template",
    icon: "edit",
  },
};

const defaultTemplates: Partial<Record<MessageType, { name: string; content: string }>> = {
  REMINDER_24HR: {
    name: "24hr Reminder",
    content: "Hi {customerName}! Just a reminder that your appointment is tomorrow at {time}. Reply YES to confirm or call us if you need to reschedule.",
  },
  REMINDER_2HR: {
    name: "2hr Reminder",
    content: "Hi {customerName}! Your appointment is in about 2 hours at {time}. See you soon!",
  },
  ON_MY_WAY: {
    name: "On My Way",
    content: "Hi {customerName}! I'm on my way and should arrive around {eta}. See you soon!",
  },
  RUNNING_LATE: {
    name: "Running Late",
    content: "Hi {customerName}, I'm running a bit behind schedule. My new ETA is around {eta}. Apologies for the delay!",
  },
};

const variableHelp = [
  { variable: "{customerName}", description: "Client's first name" },
  { variable: "{petName}", description: "Pet's name" },
  { variable: "{time}", description: "Appointment time" },
  { variable: "{date}", description: "Appointment date" },
  { variable: "{eta}", description: "Estimated arrival time" },
  { variable: "{groomerName}", description: "Your name" },
];

export default function NotificationsSettingsPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "CUSTOM" as MessageType,
    content: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const response = await fetch("/api/message-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleActive(template: MessageTemplate) {
    try {
      const response = await fetch(`/api/message-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });

      if (response.ok) {
        setTemplates(templates.map(t =>
          t.id === template.id ? { ...t, isActive: !t.isActive } : t
        ));
        toast.success(template.isActive ? "Template disabled" : "Template enabled");
      } else {
        toast.error("Failed to update template");
      }
    } catch (error) {
      console.error("Failed to toggle template:", error);
      toast.error("Failed to update template");
    }
  }

  async function handleSaveEdit(templateId: string) {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/message-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setTemplates(templates.map(t =>
          t.id === templateId ? { ...t, content: editContent } : t
        ));
        setEditingId(null);
        toast.success("Template saved");
      } else {
        toast.error("Failed to save template");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(templateId: string) {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/message-templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
        toast.success("Template deleted");
      } else {
        toast.error("Failed to delete template");
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    }
  }

  async function handleCreateTemplate() {
    if (!newTemplate.name || !newTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/message-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });

      if (response.ok) {
        const created = await response.json();
        setTemplates([...templates, created]);
        setShowAddModal(false);
        setNewTemplate({ name: "", type: "CUSTOM", content: "" });
        toast.success("Template created");
      } else {
        toast.error("Failed to create template");
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateDefault(type: MessageType) {
    const defaultContent = defaultTemplates[type];
    if (!defaultContent) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/message-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: defaultContent.name,
          type,
          content: defaultContent.content,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setTemplates([...templates, created]);
        toast.success("Template created");
      } else {
        toast.error("Failed to create template");
      }
    } catch (error) {
      console.error("Failed to create template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsSaving(false);
    }
  }

  // Group templates by type
  const templatesByType = templates.reduce((acc, template) => {
    if (!acc[template.type]) acc[template.type] = [];
    acc[template.type].push(template);
    return acc;
  }, {} as Record<MessageType, MessageTemplate[]>);

  // Template types that can be auto-sent
  const autoSendTypes: MessageType[] = ["REMINDER_24HR", "REMINDER_2HR"];
  const quickMessageTypes: MessageType[] = ["ON_MY_WAY", "RUNNING_LATE", "CONFIRMATION_REQUEST", "GAP_FILL_OFFER", "CUSTOM"];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Bell className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">
              Configure reminders and message templates
            </p>
          </div>
        </div>
      </div>

      {/* Automatic Reminders Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Automatic Reminders</h2>
            <p className="text-sm text-gray-500">
              These messages are sent automatically before appointments
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {autoSendTypes.map((type) => {
            const info = templateTypeInfo[type];
            const template = templatesByType[type]?.[0];
            const isEditing = editingId === template?.id;

            return (
              <div key={type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{info.label}</h3>
                    <p className="text-xs text-gray-500">{info.description}</p>
                  </div>
                  {template ? (
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {template.isActive ? "On" : "Off"}
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-sm"
                          checked={template.isActive}
                          onChange={() => handleToggleActive(template)}
                        />
                      </label>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreateDefault(type)}
                      disabled={isSaving}
                      className="btn btn-sm btn-ghost text-[#A5744A]"
                    >
                      <Plus className="h-4 w-4" />
                      Enable
                    </button>
                  )}
                </div>

                {template && (
                  <div className="mt-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="textarea textarea-bordered w-full text-sm bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors pl-4 pt-3"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-sm btn-ghost"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(template.id)}
                            disabled={isSaving}
                            className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white"
                          >
                            {isSaving ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingId(template.id);
                          setEditContent(template.content);
                        }}
                        className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {template.content}
                        <p className="text-xs text-gray-400 mt-2">Click to edit</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Messages Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Quick Messages</h2>
              <p className="text-sm text-gray-500">
                Pre-written messages for common situations
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="space-y-3">
          {quickMessageTypes.map((type) => {
            const info = templateTypeInfo[type];
            const typeTemplates = templatesByType[type] || [];

            if (typeTemplates.length === 0 && type !== "CUSTOM") {
              // Show option to create default
              const defaultContent = defaultTemplates[type];
              if (!defaultContent) return null;

              return (
                <div key={type} className="border border-dashed rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-700">{info.label}</h3>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                    <button
                      onClick={() => handleCreateDefault(type)}
                      disabled={isSaving}
                      className="btn btn-sm btn-ghost text-[#A5744A]"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              );
            }

            return typeTemplates.map((template) => {
              const isEditing = editingId === template.id;

              return (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(template.id);
                          setEditContent(template.content);
                        }}
                        className="btn btn-ghost btn-xs"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="btn btn-ghost btn-xs text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="textarea textarea-bordered w-full text-sm bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors pl-4 pt-3"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-sm btn-ghost"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(template.id)}
                          disabled={isSaving}
                          className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white"
                        >
                          {isSaving ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {template.content}
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* Variable Help */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900 mb-3">Available Variables</h3>
        <p className="text-sm text-blue-700 mb-4">
          Use these placeholders in your messages - they&apos;ll be replaced with actual values when sent.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {variableHelp.map((v) => (
            <div key={v.variable} className="flex items-center gap-2">
              <code className="text-xs bg-blue-100 px-2 py-1 rounded font-mono">
                {v.variable}
              </code>
              <span className="text-xs text-blue-700">{v.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Message Template</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Weather Delay"
                  className="input input-bordered w-full bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors pl-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="Hi {customerName}! ..."
                  className="textarea textarea-bordered w-full bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors pl-4 pt-3"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={isSaving}
                  className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white"
                >
                  {isSaving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
