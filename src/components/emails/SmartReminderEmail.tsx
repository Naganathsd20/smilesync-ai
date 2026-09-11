import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SmartReminderEmailProps {
  userName: string;
  title: string;
  description: string;
  type: string;
  dueDate: string;
}

export function SmartReminderEmail({
  userName,
  title,
  description,
  type,
  dueDate,
}: SmartReminderEmailProps) {
  const formattedType = type ? type.replace("_", " ") : "CARE REMINDER";

  return (
    <Html>
      <Head />
      <Preview>{`SmileSync AI Care Reminder: ${title}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://i.ibb.co.com/tRy6cC2/logo2.png"
              width="50"
              height="50"
              alt="SmileSync AI"
              style={logo}
            />
            <Text style={logoText}>SmileSync AI</Text>
          </Section>

          <Heading style={h1}>Smart Oral Care Reminder 🦷</Heading>

          <Text style={text}>Hi {userName || "there"},</Text>

          <Text style={text}>
            Here is a personalized oral health reminder generated for your SmileSync AI care routine:
          </Text>

          <Section style={reminderCard}>
            <Text style={typeBadge}>{formattedType}</Text>
            <Text style={reminderTitle}>{title}</Text>
            <Text style={reminderDescription}>{description}</Text>
            <Text style={dueDateText}>Target Date: {dueDate}</Text>
          </Section>

          <Text style={text}>
            Staying consistent with your oral care routine helps prevent dental issues before they start.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/reminders"}>
              View Smart Reminders Hub
            </Link>
          </Section>

          <Text style={footer}>
            Best regards,
            <br />
            The SmileSync AI Team
          </Text>

          <Text style={footerText}>
            This is an automated educational reminder based on your SmileSync AI profile.
            If you have questions, please contact support@smilesyncai.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default SmartReminderEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const logoContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  borderRadius: "8px",
  display: "inline",
  verticalAlign: "middle",
};

const logoText = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#2563eb",
  margin: "0",
  display: "inline",
  marginLeft: "12px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const reminderCard = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
};

const typeBadge = {
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  color: "#2563eb",
  backgroundColor: "#dbeafe",
  padding: "4px 10px",
  borderRadius: "12px",
  textTransform: "uppercase" as const,
  marginBottom: "12px",
};

const reminderTitle = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "700",
  margin: "8px 0 8px 0",
};

const reminderDescription = {
  color: "#475569",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const dueDateText = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "500",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "32px 0 16px 0",
};

const footerText = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "16px 0 0 0",
  textAlign: "center" as const,
};
