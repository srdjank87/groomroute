import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PWAInstallReminderEmailProps {
  userName: string;
  daysSinceSignup: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://groomroute.com";

export default function PWAInstallReminderEmail({
  userName = "there",
  daysSinceSignup = 5,
}: PWAInstallReminderEmailProps) {
  const firstName = userName.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>Quick tip: Add GroomRoute to your home screen for faster access</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>GroomRoute</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Access GroomRoute in One Tap</Heading>

            <Text style={paragraph}>Hi {firstName},</Text>

            <Text style={paragraph}>
              You've been using GroomRoute for {daysSinceSignup} days now - we hope it's making your
              grooming days smoother! Here's a quick tip to make things even easier:
            </Text>

            <Section style={tipBox}>
              <Text style={tipTitle}>Add GroomRoute to Your Home Screen</Text>
              <Text style={tipText}>
                Install GroomRoute as an app on your phone for instant access - no searching
                through bookmarks or typing URLs. It works just like a native app!
              </Text>
            </Section>

            <Heading as="h2" style={subheading}>
              How to Install (30 seconds)
            </Heading>

            <Section style={instructionSection}>
              <Text style={instructionTitle}>On iPhone (Safari):</Text>
              <Text style={stepItem}>
                1. Open <Link href={`${baseUrl}/dashboard`} style={link}>groomroute.com/dashboard</Link> in Safari
              </Text>
              <Text style={stepItem}>
                2. Tap the Share button (square with arrow)
              </Text>
              <Text style={stepItem}>
                3. Scroll down and tap "Add to Home Screen"
              </Text>
            </Section>

            <Section style={instructionSection}>
              <Text style={instructionTitle}>On Android (Chrome):</Text>
              <Text style={stepItem}>
                1. Open <Link href={`${baseUrl}/dashboard`} style={link}>groomroute.com/dashboard</Link> in Chrome
              </Text>
              <Text style={stepItem}>
                2. Tap the menu (three dots) at the top right
              </Text>
              <Text style={stepItem}>
                3. Tap "Install app" or "Add to Home screen"
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={`${baseUrl}/dashboard`}>
                Open GroomRoute Now
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              Once installed, you'll have GroomRoute right on your home screen - perfect for
              checking your route each morning or updating appointments on the go.
            </Text>

            <Text style={paragraph}>
              Questions or need help? Just reply to this email!
            </Text>

            <Text style={signature}>
              Happy grooming!
              <br />
              The GroomRoute Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              GroomRoute - Route planning for mobile pet groomers
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/unsubscribe`} style={footerLink}>
                Unsubscribe
              </Link>
              {" | "}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
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
  color: "#A5744A",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0",
};

const content = {
  padding: "0 48px",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "28px",
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

const tipBox = {
  backgroundColor: "#f8f5f2",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "24px 0",
  borderLeft: "4px solid #A5744A",
};

const tipTitle = {
  color: "#A5744A",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const tipText = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
};

const instructionSection = {
  margin: "16px 0",
  padding: "12px 16px",
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
};

const instructionTitle = {
  color: "#1a1a1a",
  fontSize: "15px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const stepItem = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "4px 0",
  paddingLeft: "8px",
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
  margin: "24px 0 0",
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
