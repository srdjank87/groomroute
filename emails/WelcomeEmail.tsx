import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userName: string;
  planName: string;
  trialDays?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://groomroute.com";

export default function WelcomeEmail({
  userName = "there",
  planName = "Growth",
  trialDays = 14,
}: WelcomeEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>Welcome to GroomRoute - Finally, a calm day awaits.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
              <tr>
                <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                  <Img
                    src={`${baseUrl}/images/app-icon-192.png`}
                    width="32"
                    height="32"
                    alt="GroomRoute"
                    style={{ borderRadius: "6px" }}
                  />
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  <Text style={logoText}>
                    Groom<span style={{ color: "#A5744A" }}>Route</span>
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Finally, a calm day.</Heading>

            <Text style={paragraph}>Hi {firstName},</Text>

            <Text style={paragraph}>
              Welcome to GroomRoute. We're genuinely glad you're here.
            </Text>

            <Text style={paragraph}>
              We built this for groomers like you - people who love what they do,
              but are tired of the chaos. The zigzagging across town. The stress of running late.
              The days that leave your body aching and your energy depleted.
            </Text>

            <Text style={paragraph}>
              <strong>You deserve calm, predictable days.</strong> That's what GroomRoute is about.
            </Text>

            {/* Trial Info Box */}
            <Section style={trialBox}>
              <Text style={trialBoxText}>
                <strong>Your {trialDays}-day free trial is active</strong>
                <br />
                <span style={{ fontSize: "14px", opacity: 0.8 }}>
                  {planName} Plan - Full access, no commitment
                </span>
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Single Clear Next Step */}
            <Heading as="h2" style={subheading}>
              Your first step: Add a customer
            </Heading>

            <Text style={paragraph}>
              The best way to see how GroomRoute works? Add one of your regular customers.
              Just one. It takes 30 seconds.
            </Text>

            <Text style={paragraph}>
              Once you have customers in the system, you can schedule appointments and
              watch GroomRoute optimize your route - finding the best order so you spend
              less time driving and more time grooming (or resting).
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={`${baseUrl}/dashboard/customers/new`}>
                Add Your First Customer
              </Button>
            </Section>

            <Hr style={hr} />

            {/* What You'll Notice */}
            <Heading as="h2" style={subheading}>
              What groomers notice first
            </Heading>

            <Section style={featureList}>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> <strong>Less driving</strong> - Routes
                clustered by area, not scattered across town
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> <strong>Energy protected</strong> -
                Workload limits so you don't overbook yourself
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> <strong>Fewer surprises</strong> -
                One tap handles "running late" messages to all your clients
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Help Offer */}
            <Section style={helpBox}>
              <Text style={helpBoxText}>
                <strong>We're here for you</strong>
              </Text>
              <Text style={helpBoxSubtext}>
                Questions? Need help importing your client list? Just reply to this email.
                A real person reads every message - usually within a few hours.
              </Text>
            </Section>

            <Text style={paragraph}>
              Or check out our{" "}
              <Link href={`${baseUrl}/help`} style={link}>
                help center
              </Link>{" "}
              anytime.
            </Text>

            <Hr style={hr} />

            {/* Sign off */}
            <Text style={signature}>
              Here's to calmer days ahead,
            </Text>

            <Text style={signatureTeam}>
              The GroomRoute Team
            </Text>

            <Text style={ps}>
              <strong>P.S.</strong> If GroomRoute doesn't make your days noticeably calmer
              within 30 days, we'll refund every penny. No questions asked.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              GroomRoute - The scheduling system built only for mobile groomers
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {" | "}
              <Link href={`${baseUrl}/terms`} style={footerLink}>
                Terms of Service
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const logoSection = {
  padding: "32px 20px 0",
  textAlign: "center" as const,
};

const logoText = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
  display: "inline",
};

const content = {
  padding: "0 48px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "32px 0 24px",
};

const subheading = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "24px 0 16px",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const trialBox = {
  backgroundColor: "#fef7f0",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #f5e6d8",
};

const trialBoxText = {
  color: "#8B6239",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
};

const featureList = {
  margin: "20px 0",
};

const featureItem = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "12px 0",
};

const checkmark = {
  color: "#10b981",
  fontWeight: "bold",
  marginRight: "8px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#A5744A",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const helpBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "20px 24px",
  margin: "24px 0",
  border: "1px solid #dcfce7",
};

const helpBoxText = {
  color: "#166534",
  fontSize: "16px",
  margin: "0 0 8px 0",
};

const helpBoxSubtext = {
  color: "#15803d",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const link = {
  color: "#A5744A",
  textDecoration: "underline",
};

const signature = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0 4px",
};

const signatureTeam = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 24px",
};

const ps = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "24px 0 0",
  fontStyle: "italic",
};

const footer = {
  padding: "0 48px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "8px 0",
};

const footerLink = {
  color: "#8898aa",
  textDecoration: "underline",
};
