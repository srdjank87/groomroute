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
      <Preview>Welcome to GroomRoute - Your mobile grooming business just got easier!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="150"
              height="40"
              alt="GroomRoute"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Welcome to GroomRoute!</Heading>

            <Text style={paragraph}>Hi {firstName},</Text>

            <Text style={paragraph}>
              Thank you for signing up for GroomRoute! We're thrilled to have you join our
              community of mobile pet groomers who are taking control of their business.
            </Text>

            <Text style={paragraph}>
              You're starting your <strong>{trialDays}-day free trial</strong> of the{" "}
              <strong>{planName} plan</strong>. During your trial, you'll have full access to:
            </Text>

            <Section style={featureList}>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Smart route optimization to save time and gas
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Easy appointment scheduling and management
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Customer and pet profiles at your fingertips
              </Text>
              <Text style={featureItem}>
                <span style={checkmark}>✓</span> Quick client messaging tools
              </Text>
            </Section>

            <Section style={buttonSection}>
              <Button style={button} href={`${baseUrl}/dashboard`}>
                Go to Your Dashboard
              </Button>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={subheading}>
              Getting Started
            </Heading>

            <Text style={paragraph}>
              Here's what we recommend doing first:
            </Text>

            <Text style={stepItem}>
              <strong>1. Add your customers</strong> - Import your existing clients or add them one
              by one.
            </Text>
            <Text style={stepItem}>
              <strong>2. Schedule appointments</strong> - Set up your first day of appointments.
            </Text>
            <Text style={stepItem}>
              <strong>3. Optimize your route</strong> - Let GroomRoute find the best order for your
              stops.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              Have questions? Reply to this email or check out our{" "}
              <Link href={`${baseUrl}/help`} style={link}>
                help center
              </Link>
              . We're here to help you succeed!
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

const logo = {
  margin: "0 auto",
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

const featureList = {
  margin: "24px 0",
  padding: "0 16px",
};

const featureItem = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
};

const checkmark = {
  color: "#A5744A",
  fontWeight: "bold",
  marginRight: "8px",
};

const stepItem = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "12px 0",
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
