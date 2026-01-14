"use client";

import Link from "next/link";
import Image from "next/image";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: January 14, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing or using GroomRoute (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              GroomRoute is a scheduling and route optimization software designed specifically for mobile pet grooming businesses. The Service includes appointment scheduling, route planning, client management, and related features as described on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-700 mb-4">To use the Service, you must:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate, complete, and current registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Payment</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Billing</h3>
            <p className="text-gray-700 mb-4">
              The Service is offered on a subscription basis. You agree to pay all fees associated with your selected plan. Fees are billed in advance on a monthly or annual basis depending on your selection.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Free Trial</h3>
            <p className="text-gray-700 mb-4">
              We offer a 14-day free trial for new accounts. You will not be charged during the trial period. If you do not cancel before the trial ends, you will be automatically charged for your selected plan.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Refunds</h3>
            <p className="text-gray-700 mb-4">
              We offer a 30-day money-back guarantee. If you are not satisfied with the Service within the first 30 days of your paid subscription, contact us for a full refund. After 30 days, fees are non-refundable.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Price Changes</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify our pricing. Any price changes will be communicated to you in advance and will take effect at the start of the next billing cycle.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload malicious code or content</li>
              <li>Resell, sublicense, or redistribute the Service without authorization</li>
              <li>Use the Service to send spam or unsolicited communications</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Data</h2>
            <p className="text-gray-700 mb-4">
              You retain ownership of all data you input into the Service (&quot;Your Data&quot;). You grant us a limited license to use Your Data solely to provide the Service to you. You are responsible for ensuring you have the right to input any client data into the Service.
            </p>
            <p className="text-gray-700 mb-4">
              We recommend regularly exporting and backing up Your Data. While we maintain backups, we are not responsible for data loss.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The Service and its original content (excluding Your Data), features, and functionality are and will remain the exclusive property of GroomRoute. The Service is protected by copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-gray-700 mb-4">
              We do not warrant that the Service will be uninterrupted, secure, or error-free. Route optimization and time estimates are approximations and should not be relied upon as guarantees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GROOMROUTE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="text-gray-700 mb-4">
              Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold harmless GroomRoute, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 mb-4">
              You may cancel your subscription at any time through your account settings. We may terminate or suspend your account immediately, without prior notice, if you breach these Terms.
            </p>
            <p className="text-gray-700 mb-4">
              Upon termination, your right to use the Service will immediately cease. You may request export of Your Data within 30 days of termination.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration in accordance with applicable arbitration rules.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> legal@groomroute.com
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
