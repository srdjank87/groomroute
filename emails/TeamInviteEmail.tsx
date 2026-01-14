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

interface TeamInviteEmailProps {
  inviterName: string;
  businessName: string;
  role: "ADMIN" | "GROOMER";
  inviteToken: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://groomroute.com";

export default function TeamInviteEmail({
  inviterName = "Your team",
  businessName = "a grooming business",
  role = "GROOMER",
  inviteToken = "token",
}: TeamInviteEmailProps) {
  const inviteUrl = `${baseUrl}/invite/${inviteToken}`;
  const roleDisplay = role === "ADMIN" ? "Admin" : "Groomer";
  const roleDescription =
    role === "ADMIN"
      ? "As an Admin, you'll have full access to manage appointments, customers, and team settings."
      : "As a Groomer, you'll be able to view your appointments, manage your route, and update appointment statuses.";

  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {businessName} on GroomRoute!</Preview>
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
            <Heading style={heading}>You're Invited!</Heading>

            <Text style={paragraph}>
              <strong>{inviterName}</strong> has invited you to join{" "}
              <strong>{businessName}</strong> on GroomRoute as a{" "}
              <strong>{roleDisplay}</strong>.
            </Text>

            <Section style={roleBox}>
              <Text style={roleTitle}>Your Role: {roleDisplay}</Text>
              <Text style={roleDesc}>{roleDescription}</Text>
            </Section>

            <Text style={paragraph}>
              GroomRoute helps mobile pet groomers manage their appointments, optimize routes, and
              run their business more efficiently.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={inviteUrl}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={smallText}>
              This invitation link will expire in 7 days. If you didn't expect this email, you can
              safely ignore it.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              Questions? Reply to this email and we'll help you get started.
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

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const roleBox = {
  backgroundColor: "#f8f5f2",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "24px 0",
  borderLeft: "4px solid #A5744A",
};

const roleTitle = {
  color: "#A5744A",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 8px",
};

const roleDesc = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
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
