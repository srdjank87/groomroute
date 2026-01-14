"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Eye, CheckCircle, AlertCircle } from "lucide-react";

type EmailTemplate = "welcome" | "team-invite";

interface EmailPreviewProps {
  template: EmailTemplate;
}

// Sample data for previews
const sampleData = {
  welcome: {
    userName: "John Smith",
    planName: "Growth",
    trialDays: 14,
  },
  "team-invite": {
    inviterName: "Jane Doe",
    businessName: "Pawsome Groomers",
    role: "GROOMER" as "ADMIN" | "GROOMER",
    inviteToken: "sample-token-123",
  },
};

export default function AdminEmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>("welcome");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    if (!testEmail) return;

    setSending(true);
    setSendResult(null);

    try {
      const response = await fetch("/api/admin/emails/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: selectedTemplate,
          email: testEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendResult({ success: true, message: `Test email sent to ${testEmail}` });
        setTestEmail("");
      } else {
        setSendResult({ success: false, message: data.error || "Failed to send email" });
      }
    } catch {
      setSendResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
              <p className="text-sm text-gray-600">
                Preview and test email templates
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selector & Test Send */}
          <div className="space-y-6">
            {/* Template List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-500" />
                  Templates
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                <button
                  onClick={() => setSelectedTemplate("welcome")}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedTemplate === "welcome"
                      ? "bg-amber-50 border-l-4 border-[#A5744A]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-gray-900">Welcome Email</p>
                  <p className="text-sm text-gray-500">
                    Sent when a user signs up
                  </p>
                </button>
                <button
                  onClick={() => setSelectedTemplate("team-invite")}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedTemplate === "team-invite"
                      ? "bg-amber-50 border-l-4 border-[#A5744A]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-gray-900">Team Invitation</p>
                  <p className="text-sm text-gray-500">
                    Sent when inviting team members
                  </p>
                </button>
              </div>
            </div>

            {/* Send Test Email */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-gray-500" />
                  Send Test Email
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A5744A] focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleSendTest}
                  disabled={!testEmail || sending}
                  className="w-full px-4 py-2 bg-[#A5744A] text-white rounded-lg hover:bg-[#8B6239] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Test
                    </>
                  )}
                </button>
                {sendResult && (
                  <div
                    className={`p-3 rounded-lg flex items-center gap-2 ${
                      sendResult.success
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {sendResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{sendResult.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Template Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">Template Details</h3>
              <div className="text-sm text-gray-600 space-y-2">
                {selectedTemplate === "welcome" && (
                  <>
                    <p><strong>Subject:</strong> Welcome to GroomRoute! Let's get you started</p>
                    <p><strong>Trigger:</strong> User registration</p>
                    <p><strong>Variables:</strong> userName, planName, trialDays</p>
                  </>
                )}
                {selectedTemplate === "team-invite" && (
                  <>
                    <p><strong>Subject:</strong> You've been invited to join [Business] on GroomRoute</p>
                    <p><strong>Trigger:</strong> Team member invitation</p>
                    <p><strong>Variables:</strong> inviterName, businessName, role, inviteToken</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-500" />
                  Preview
                </h2>
                <span className="text-sm text-gray-500">
                  {selectedTemplate === "welcome" ? "Welcome Email" : "Team Invitation"}
                </span>
              </div>
              <div className="p-4 bg-gray-50">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <EmailPreview template={selectedTemplate} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmailPreview({ template }: EmailPreviewProps) {
  if (template === "welcome") {
    const { userName, planName, trialDays } = sampleData.welcome;
    const firstName = userName.split(" ")[0];

    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '600px', margin: '0 auto', padding: '20px 0 48px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', padding: '32px 20px 0' }}>
            <span style={{ color: '#A5744A', fontSize: '28px', fontWeight: 'bold' }}>GroomRoute</span>
          </div>

          {/* Content */}
          <div style={{ padding: '0 48px' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '32px 0 24px' }}>
              Welcome to GroomRoute!
            </h1>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Hi {firstName},
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Thank you for signing up for GroomRoute! We're thrilled to have you join our community of mobile pet groomers who are taking control of their business.
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              You're starting your <strong>{trialDays}-day free trial</strong> of the <strong>{planName} plan</strong>. During your trial, you'll have full access to:
            </p>

            <div style={{ margin: '24px 0', padding: '0 16px' }}>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '8px 0' }}>
                <span style={{ color: '#A5744A', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                Smart route optimization to save time and gas
              </p>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '8px 0' }}>
                <span style={{ color: '#A5744A', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                Easy appointment scheduling and management
              </p>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '8px 0' }}>
                <span style={{ color: '#A5744A', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                Customer and pet profiles at your fingertips
              </p>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '8px 0' }}>
                <span style={{ color: '#A5744A', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                Quick client messaging tools
              </p>
            </div>

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <span style={{ backgroundColor: '#A5744A', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', padding: '14px 32px', display: 'inline-block' }}>
                Go to Your Dashboard
              </span>
            </div>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <h2 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 'bold', margin: '24px 0 16px' }}>
              Getting Started
            </h2>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Here's what we recommend doing first:
            </p>

            <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '12px 0', paddingLeft: '8px' }}>
              <strong>1. Add your customers</strong> - Import your existing clients or add them one by one.
            </p>
            <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '12px 0', paddingLeft: '8px' }}>
              <strong>2. Schedule appointments</strong> - Set up your first day of appointments.
            </p>
            <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '12px 0', paddingLeft: '8px' }}>
              <strong>3. Optimize your route</strong> - Let GroomRoute find the best order for your stops.
            </p>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Have questions? Reply to this email or check out our <span style={{ color: '#A5744A', textDecoration: 'underline' }}>help center</span>. We're here to help you succeed!
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '24px 0 0' }}>
              Happy grooming!<br />
              The GroomRoute Team
            </p>
          </div>

          {/* Footer */}
          <div style={{ padding: '32px 48px 0', textAlign: 'center' }}>
            <p style={{ color: '#8898aa', fontSize: '12px', lineHeight: '16px', margin: '8px 0' }}>
              GroomRoute - Route planning for mobile pet groomers
            </p>
            <p style={{ color: '#8898aa', fontSize: '12px', lineHeight: '16px', margin: '8px 0' }}>
              <span style={{ color: '#8898aa', textDecoration: 'underline' }}>Unsubscribe</span>
              {" | "}
              <span style={{ color: '#8898aa', textDecoration: 'underline' }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (template === "team-invite") {
    const { inviterName, businessName, role } = sampleData["team-invite"];
    const roleDisplay = role === "ADMIN" ? "Admin" : "Groomer";
    const roleDescription = role === "ADMIN"
      ? "As an Admin, you'll have full access to manage appointments, customers, and team settings."
      : "As a Groomer, you'll be able to view your appointments, manage your route, and update appointment statuses.";

    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '600px', margin: '0 auto', padding: '20px 0 48px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', padding: '32px 20px 0' }}>
            <span style={{ color: '#A5744A', fontSize: '28px', fontWeight: 'bold' }}>GroomRoute</span>
          </div>

          {/* Content */}
          <div style={{ padding: '0 48px' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '32px 0 24px' }}>
              You're Invited!
            </h1>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              <strong>{inviterName}</strong> has invited you to join <strong>{businessName}</strong> on GroomRoute as a <strong>{roleDisplay}</strong>.
            </p>

            <div style={{ backgroundColor: '#f8f5f2', borderRadius: '8px', padding: '20px 24px', margin: '24px 0', borderLeft: '4px solid #A5744A' }}>
              <p style={{ color: '#A5744A', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
                Your Role: {roleDisplay}
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '0' }}>
                {roleDescription}
              </p>
            </div>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              GroomRoute helps mobile pet groomers manage their appointments, optimize routes, and run their business more efficiently.
            </p>

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <span style={{ backgroundColor: '#A5744A', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', padding: '14px 32px', display: 'inline-block' }}>
                Accept Invitation
              </span>
            </div>

            <p style={{ color: '#8898aa', fontSize: '13px', lineHeight: '20px', textAlign: 'center', margin: '16px 0' }}>
              This invitation link will expire in 7 days. If you didn't expect this email, you can safely ignore it.
            </p>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Questions? Reply to this email and we'll help you get started.
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '24px 0 0' }}>
              The GroomRoute Team
            </p>
          </div>

          {/* Footer */}
          <div style={{ padding: '32px 48px 0', textAlign: 'center' }}>
            <p style={{ color: '#8898aa', fontSize: '12px', lineHeight: '16px', margin: '8px 0' }}>
              GroomRoute - Route planning for mobile pet groomers
            </p>
            <p style={{ color: '#8898aa', fontSize: '12px', lineHeight: '16px', margin: '8px 0' }}>
              <span style={{ color: '#8898aa', textDecoration: 'underline' }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
