"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, Eye, CheckCircle, AlertCircle } from "lucide-react";

type EmailTemplate = "welcome" | "team-invite" | "password-reset" | "pwa-install-reminder";

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
  "password-reset": {
    userName: "John Smith",
    resetToken: "sample-reset-token-abc123",
  },
  "pwa-install-reminder": {
    userName: "John Smith",
    daysSinceSignup: 5,
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
                <button
                  onClick={() => setSelectedTemplate("password-reset")}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedTemplate === "password-reset"
                      ? "bg-amber-50 border-l-4 border-[#A5744A]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-gray-900">Password Reset</p>
                  <p className="text-sm text-gray-500">
                    Sent for forgot password requests
                  </p>
                </button>
                <button
                  onClick={() => setSelectedTemplate("pwa-install-reminder")}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedTemplate === "pwa-install-reminder"
                      ? "bg-amber-50 border-l-4 border-[#A5744A]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <p className="font-medium text-gray-900">PWA Install Reminder</p>
                  <p className="text-sm text-gray-500">
                    Reminder to install the mobile app
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
                    <p><strong>Subject:</strong> Welcome to GroomRoute - Finally, a calm day awaits</p>
                    <p><strong>Trigger:</strong> User registration</p>
                    <p><strong>Variables:</strong> userName, planName, trialDays</p>
                  </>
                )}
                {selectedTemplate === "team-invite" && (
                  <>
                    <p><strong>Subject:</strong> You&apos;ve been invited to join [Business] on GroomRoute</p>
                    <p><strong>Trigger:</strong> Team member invitation</p>
                    <p><strong>Variables:</strong> inviterName, businessName, role, inviteToken</p>
                  </>
                )}
                {selectedTemplate === "password-reset" && (
                  <>
                    <p><strong>Subject:</strong> Reset your GroomRoute password</p>
                    <p><strong>Trigger:</strong> Forgot password request</p>
                    <p><strong>Variables:</strong> userName, resetToken</p>
                  </>
                )}
                {selectedTemplate === "pwa-install-reminder" && (
                  <>
                    <p><strong>Subject:</strong> Quick tip: Add GroomRoute to your home screen</p>
                    <p><strong>Trigger:</strong> 5 days after signup (if PWA not installed)</p>
                    <p><strong>Variables:</strong> userName, daysSinceSignup</p>
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
                  {selectedTemplate === "welcome" && "Welcome Email"}
                  {selectedTemplate === "team-invite" && "Team Invitation"}
                  {selectedTemplate === "password-reset" && "Password Reset"}
                  {selectedTemplate === "pwa-install-reminder" && "PWA Install Reminder"}
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
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                    <img
                      src="/images/app-icon-192.png"
                      width="32"
                      height="32"
                      alt="GroomRoute"
                      style={{ borderRadius: '6px' }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold' }}>
                      Groom<span style={{ color: '#A5744A' }}>Route</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Content */}
          <div style={{ padding: '0 48px' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', margin: '32px 0 24px' }}>
              Finally, a calm day.
            </h1>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Hi {firstName},
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Welcome to GroomRoute. We&apos;re genuinely glad you&apos;re here.
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              We built this for groomers like you - people who love what they do, but are tired of the chaos. The zigzagging across town. The stress of running late. The days that leave your body aching and your energy depleted.
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              <strong>You deserve calm, predictable days.</strong> That&apos;s what GroomRoute is about.
            </p>

            {/* Trial Info Box */}
            <div style={{ backgroundColor: '#fef7f0', borderRadius: '12px', padding: '20px 24px', margin: '24px 0', textAlign: 'center', border: '1px solid #f5e6d8' }}>
              <p style={{ color: '#8B6239', fontSize: '16px', lineHeight: '24px', margin: '0' }}>
                <strong>Your {trialDays}-day free trial is active</strong>
                <br />
                <span style={{ fontSize: '14px', opacity: 0.8 }}>
                  {planName} Plan - Full access, no commitment
                </span>
              </p>
            </div>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <h2 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 'bold', margin: '24px 0 16px' }}>
              Your first step: Add a customer
            </h2>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              The best way to see how GroomRoute works? Add one of your regular customers. Just one. It takes 30 seconds.
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Once you have customers in the system, you can schedule appointments and watch GroomRoute optimize your route - finding the best order so you spend less time driving and more time grooming (or resting).
            </p>

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <span style={{ backgroundColor: '#A5744A', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', padding: '14px 32px', display: 'inline-block' }}>
                Add Your First Customer
              </span>
            </div>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <h2 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 'bold', margin: '24px 0 16px' }}>
              What groomers notice first
            </h2>

            <div style={{ margin: '20px 0' }}>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '26px', margin: '12px 0' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                <strong>Less driving</strong> - Routes clustered by area, not scattered across town
              </p>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '26px', margin: '12px 0' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                <strong>Energy protected</strong> - Workload limits so you don&apos;t overbook yourself
              </p>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '26px', margin: '12px 0' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', marginRight: '8px' }}>✓</span>
                <strong>Fewer surprises</strong> - One tap handles &quot;running late&quot; messages to all your clients
              </p>
            </div>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            {/* Help Box */}
            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '20px 24px', margin: '24px 0', border: '1px solid #dcfce7' }}>
              <p style={{ color: '#166534', fontSize: '16px', margin: '0 0 8px 0' }}>
                <strong>We&apos;re here for you</strong>
              </p>
              <p style={{ color: '#15803d', fontSize: '14px', lineHeight: '22px', margin: '0' }}>
                Questions? Need help importing your client list? Just reply to this email. A real person reads every message - usually within a few hours.
              </p>
            </div>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Or check out our <span style={{ color: '#A5744A', textDecoration: 'underline' }}>help center</span> anytime.
            </p>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0 4px' }}>
              Here&apos;s to calmer days ahead,
            </p>

            <p style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '600', margin: '0 0 24px' }}>
              The GroomRoute Team
            </p>

            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '22px', margin: '24px 0 0', fontStyle: 'italic' }}>
              <strong>P.S.</strong> If GroomRoute doesn&apos;t make your days noticeably calmer within 30 days, we&apos;ll refund every penny. No questions asked.
            </p>
          </div>

          {/* Footer */}
          <div style={{ padding: '32px 48px 0', textAlign: 'center' }}>
            <p style={{ color: '#8898aa', fontSize: '12px', lineHeight: '16px', margin: '8px 0' }}>
              GroomRoute - The scheduling system built only for mobile groomers
            </p>
            <p style={{ color: '#8898aa', fontSize: '12px', lineHeight: '16px', margin: '8px 0' }}>
              <span style={{ color: '#8898aa', textDecoration: 'underline' }}>Privacy Policy</span>
              {" | "}
              <span style={{ color: '#8898aa', textDecoration: 'underline' }}>Terms of Service</span>
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
      ? "As an Admin, you&apos;ll have full access to manage appointments, customers, and team settings."
      : "As a Groomer, you'll be able to view your appointments, manage your route, and update appointment statuses.";

    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '600px', margin: '0 auto', padding: '20px 0 48px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', padding: '32px 20px 0' }}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                    <img
                      src="/images/app-icon-192.png"
                      width="32"
                      height="32"
                      alt="GroomRoute"
                      style={{ borderRadius: '6px' }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold' }}>
                      Groom<span style={{ color: '#A5744A' }}>Route</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Content */}
          <div style={{ padding: '0 48px' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '32px 0 24px' }}>
              You&apos;re Invited!
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
              This invitation link will expire in 7 days. If you didn&apos;t expect this email, you can safely ignore it.
            </p>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Questions? Reply to this email and we&apos;ll help you get started.
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

  if (template === "password-reset") {
    const { userName } = sampleData["password-reset"];
    const firstName = userName.split(" ")[0];

    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '600px', margin: '0 auto', padding: '20px 0 48px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', padding: '32px 20px 0' }}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                    <img
                      src="/images/app-icon-192.png"
                      width="32"
                      height="32"
                      alt="GroomRoute"
                      style={{ borderRadius: '6px' }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold' }}>
                      Groom<span style={{ color: '#A5744A' }}>Route</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Content */}
          <div style={{ padding: '0 48px' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '32px 0 24px' }}>
              Reset Your Password
            </h1>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Hi {firstName},
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              We received a request to reset your password for your GroomRoute account. Click the button below to create a new password.
            </p>

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <span style={{ backgroundColor: '#A5744A', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', padding: '14px 32px', display: 'inline-block' }}>
                Reset Password
              </span>
            </div>

            <p style={{ color: '#8898aa', fontSize: '13px', lineHeight: '20px', textAlign: 'center', margin: '16px 0' }}>
              This link will expire in 1 hour. If you didn&apos;t request a password reset, you can safely ignore this email - your password won&apos;t be changed.
            </p>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              If the button doesn&apos;t work, copy and paste this link into your browser:
            </p>

            <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '20px', wordBreak: 'break-all' }}>
              <span style={{ color: '#A5744A', textDecoration: 'underline' }}>https://groomroute.com/auth/reset-password?token=sample-token</span>
            </p>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Need help? Reply to this email and we&apos;ll assist you.
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

  if (template === "pwa-install-reminder") {
    const { userName, daysSinceSignup } = sampleData["pwa-install-reminder"];
    const firstName = userName.split(" ")[0];

    return (
      <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '600px', margin: '0 auto', padding: '20px 0 48px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', padding: '32px 20px 0' }}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: '0 auto' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'middle', paddingRight: '8px' }}>
                    <img
                      src="/images/app-icon-192.png"
                      width="32"
                      height="32"
                      alt="GroomRoute"
                      style={{ borderRadius: '6px' }}
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold' }}>
                      Groom<span style={{ color: '#A5744A' }}>Route</span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Content */}
          <div style={{ padding: '0 48px' }}>
            <h1 style={{ color: '#1a1a1a', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', margin: '32px 0 24px' }}>
              Access GroomRoute in One Tap
            </h1>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Hi {firstName},
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              You&apos;ve been using GroomRoute for {daysSinceSignup} days now - we hope it&apos;s making your
              grooming days smoother! Here&apos;s a quick tip to make things even easier:
            </p>

            <div style={{ backgroundColor: '#f8f5f2', borderRadius: '8px', padding: '20px 24px', margin: '24px 0', borderLeft: '4px solid #A5744A' }}>
              <p style={{ color: '#A5744A', fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px' }}>
                Add GroomRoute to Your Home Screen
              </p>
              <p style={{ color: '#525f7f', fontSize: '15px', lineHeight: '24px', margin: '0' }}>
                Install GroomRoute as an app on your phone for instant access - no searching
                through bookmarks or typing URLs. It works just like a native app!
              </p>
            </div>

            <h2 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 'bold', margin: '24px 0 16px' }}>
              How to Install (30 seconds)
            </h2>

            <div style={{ margin: '16px 0', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ color: '#1a1a1a', fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px' }}>
                On iPhone (Safari):
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '4px 0', paddingLeft: '8px' }}>
                1. Open groomroute.com/dashboard in Safari
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '4px 0', paddingLeft: '8px' }}>
                2. Tap the Share button (square with arrow)
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '4px 0', paddingLeft: '8px' }}>
                3. Scroll down and tap &quot;Add to Home Screen&quot;
              </p>
            </div>

            <div style={{ margin: '16px 0', padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ color: '#1a1a1a', fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px' }}>
                On Android (Chrome):
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '4px 0', paddingLeft: '8px' }}>
                1. Open groomroute.com/dashboard in Chrome
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '4px 0', paddingLeft: '8px' }}>
                2. Tap the menu (three dots) at the top right
              </p>
              <p style={{ color: '#525f7f', fontSize: '14px', lineHeight: '22px', margin: '4px 0', paddingLeft: '8px' }}>
                3. Tap &quot;Install app&quot; or &quot;Add to Home screen&quot;
              </p>
            </div>

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <span style={{ backgroundColor: '#A5744A', borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', padding: '14px 32px', display: 'inline-block' }}>
                Open GroomRoute Now
              </span>
            </div>

            <hr style={{ borderColor: '#e6ebf1', margin: '32px 0', border: 'none', borderTop: '1px solid #e6ebf1' }} />

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Once installed, you&apos;ll have GroomRoute right on your home screen - perfect for
              checking your route each morning or updating appointments on the go.
            </p>

            <p style={{ color: '#525f7f', fontSize: '16px', lineHeight: '26px', margin: '16px 0' }}>
              Questions or need help? Just reply to this email!
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

  return null;
}
