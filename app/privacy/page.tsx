"use client";

import Link from "next/link";
import Image from "next/image";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="border-b border-base-300 bg-base-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={16}
              height={16}
              className="w-6 h-6"
            />
            <span className="font-bold text-lg">
              <GroomRouteLogo />
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link
              href="/auth/signup?plan=growth&billing=monthly"
              className="btn btn-gradient btn-sm hidden sm:inline-flex items-center"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: January 14, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              GroomRoute (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile grooming scheduling software and related services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-4">We may collect personally identifiable information that you provide to us, including:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Business information (business name, address)</li>
              <li>Payment and billing information</li>
              <li>Account credentials</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Client Data</h3>
            <p className="text-gray-700 mb-4">As a scheduling platform, we store data you input about your clients:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Client names, addresses, and contact information</li>
              <li>Pet information (names, breeds, sizes, notes)</li>
              <li>Appointment history and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Information</h3>
            <p className="text-gray-700 mb-4">We automatically collect certain information when you use our service:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Device and browser information</li>
              <li>IP address and general location</li>
              <li>Usage patterns and feature interactions</li>
              <li>Error logs and performance data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative messages, updates, and support communications</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage trends to improve user experience</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (payment processing, hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> If required by law or in response to valid legal requests</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you have given us explicit permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information. This includes encryption of data in transit and at rest, secure authentication, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> privacy@groomroute.com
            </p>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <aside>
          <div className="flex items-center gap-2 font-bold text-xl mb-2">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <GroomRouteLogo />
          </div>
          <p className="max-w-md">The scheduling system built only for mobile groomers.</p>
          <div className="flex gap-4 mt-4">
            <Link href="/privacy" className="link link-hover text-sm">Privacy Policy</Link>
            <Link href="/terms" className="link link-hover text-sm">Terms of Service</Link>
          </div>
          <p className="text-sm opacity-70 mt-4">&copy; 2025 GroomRoute. All rights reserved.</p>
        </aside>
      </footer>
    </main>
  );
}
