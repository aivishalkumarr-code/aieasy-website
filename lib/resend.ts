import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

let resendClient: Resend | null = null;

export const isResendConfigured = () => Boolean(resendApiKey);

export const getResendClient = () => {
  if (!resendApiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }

  return resendClient;
};

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "AIeasy <onboarding@resend.dev>";
