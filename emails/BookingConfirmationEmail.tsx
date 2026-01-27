import {
  Body,
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

interface BookingConfirmationEmailProps {
  clientName: string;
  petName: string;
  groomerName: string;
  appointmentDate: string; // Formatted date string, e.g., "Monday, January 15, 2024"
  appointmentTime: string; // Formatted time string, e.g., "10:00 AM"
  address: string;
  groomerPhone?: string;
  notes?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://groomroute.com";

export default function BookingConfirmationEmail({
  clientName = "there",
  petName = "your pet",
  groomerName = "Your Groomer",
  appointmentDate = "Monday, January 15, 2024",
  appointmentTime = "10:00 AM",
  address = "123 Main St, City, State",
  groomerPhone,
  notes,
}: BookingConfirmationEmailProps) {
  const firstName = clientName.split(" ")[0];

  return (
    <Html>
      <Head />
      <Preview>Your grooming appointment is confirmed for {appointmentDate}</Preview>
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
            <Heading style={heading}>Appointment Confirmed!</Heading>

            <Text style={paragraph}>Hi {firstName},</Text>

            <Text style={paragraph}>
              Great news! Your grooming appointment for <strong>{petName}</strong> has been confirmed.
            </Text>

            {/* Appointment Details Box */}
            <Section style={appointmentBox}>
              <Text style={appointmentTitle}>Appointment Details</Text>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td style={detailRow}>
                    <Text style={detailLabel}>Date:</Text>
                    <Text style={detailValue}>{appointmentDate}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailRow}>
                    <Text style={detailLabel}>Time:</Text>
                    <Text style={detailValue}>{appointmentTime}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailRow}>
                    <Text style={detailLabel}>Pet:</Text>
                    <Text style={detailValue}>{petName}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailRow}>
                    <Text style={detailLabel}>Groomer:</Text>
                    <Text style={detailValue}>{groomerName}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={detailRow}>
                    <Text style={detailLabel}>Location:</Text>
                    <Text style={detailValue}>{address}</Text>
                  </td>
                </tr>
              </table>
            </Section>

            {notes && (
              <Section style={notesBox}>
                <Text style={notesTitle}>Notes:</Text>
                <Text style={notesText}>{notes}</Text>
              </Section>
            )}

            {/* What to Expect */}
            <Heading as="h2" style={subheading}>
              What to expect
            </Heading>

            <Text style={paragraph}>
              {groomerName} will arrive at your location around the scheduled time.
              Mobile grooming is done right in our van/trailer, so please ensure:
            </Text>

            <Section style={checklistSection}>
              <Text style={checklistItem}>
                <span style={checkmark}>✓</span> We have access to a parking spot near your home
              </Text>
              <Text style={checklistItem}>
                <span style={checkmark}>✓</span> {petName} is ready and has had a chance to go potty
              </Text>
              <Text style={checklistItem}>
                <span style={checkmark}>✓</span> Someone is home to hand off and receive {petName}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Contact Info */}
            <Section style={contactBox}>
              <Text style={contactTitle}>Need to make changes?</Text>
              <Text style={contactText}>
                {groomerPhone ? (
                  <>
                    Contact {groomerName} directly at{" "}
                    <Link href={`tel:${groomerPhone}`} style={link}>
                      {groomerPhone}
                    </Link>
                  </>
                ) : (
                  <>Contact {groomerName} directly to reschedule or cancel.</>
                )}
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={paragraph}>
              We look forward to seeing {petName}!
            </Text>

            <Text style={signature}>
              {groomerName}
              <br />
              <span style={{ fontSize: "14px", color: "#6b7280" }}>via GroomRoute</span>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This appointment was booked through GroomRoute
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
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "32px 0 24px",
};

const subheading = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "24px 0 12px",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const appointmentBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #dcfce7",
};

const appointmentTitle = {
  color: "#166534",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const detailRow = {
  padding: "4px 0",
};

const detailLabel = {
  color: "#166534",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  display: "inline",
  width: "80px",
};

const detailValue = {
  color: "#15803d",
  fontSize: "14px",
  margin: "0 0 0 8px",
  display: "inline",
};

const notesBox = {
  backgroundColor: "#fef7f0",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
  borderLeft: "4px solid #A5744A",
};

const notesTitle = {
  color: "#8B6239",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const notesText = {
  color: "#8B6239",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const checklistSection = {
  margin: "16px 0",
};

const checklistItem = {
  color: "#525f7f",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "8px 0",
};

const checkmark = {
  color: "#10b981",
  fontWeight: "bold",
  marginRight: "8px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const contactBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
};

const contactTitle = {
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const contactText = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const link = {
  color: "#A5744A",
  textDecoration: "underline",
};

const signature = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
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
