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

interface PasswordResetEmailProps {
  userName: string;
  resetToken: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://groomroute.com";

export default function PasswordResetEmail({
  userName = "there",
  resetToken = "token",
}: PasswordResetEmailProps) {
  const firstName = userName.split(" ")[0];
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your GroomRoute password</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Text style={logoText}>GroomRoute</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={heading}>Reset Your Password</Heading>

            <Text style={paragraph}>Hi {firstName},</Text>

            <Text style={paragraph}>
              We received a request to reset your password for your GroomRoute account.
              Click the button below to create a new password.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={smallText}>
              This link will expire in 1 hour. If you didn't request a password reset,
              you can safely ignore this email - your password won't be changed.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              If the button doesn't work, copy and paste this link into your browser:
            </Text>

            <Text style={linkText}>
              <Link href={resetUrl} style={link}>
                {resetUrl}
              </Link>
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              Need help? Reply to this email and we'll assist you.
            </Text>

            <Text style={signature}>
              The GroomRoute Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              GroomRoute - Route planning for mobile pet groomers
            </Text>
            <Text style={footerText}>
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

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
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

const smallText = {
  color: "#8898aa",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const linkText = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "20px",
  wordBreak: "break-all" as const,
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
