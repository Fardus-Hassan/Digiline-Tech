import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { escapeHtml } from "./html.js";

const enabled = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transport = enabled
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

type NewMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  messageHtml?: string | null;
};

/** Emails the admin about a new contact message. Never throws: a mail problem must not lose the message. */
export async function notifyNewMessage(msg: NewMessage) {
  if (!transport) return;
  const to = env.NOTIFY_EMAIL || env.SMTP_USER!;
  const link = `${env.CLIENT_URL}/admin/messages?id=${msg.id}`;
  const body = msg.messageHtml || `<p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p>`;
  const row = (label: string, value?: string | null) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>` : "";

  try {
    await transport.sendMail({
      from: `"Digiline Tech Website" <${env.SMTP_USER}>`,
      to,
      replyTo: `"${msg.name.replace(/"/g, "")}" <${msg.email}>`,
      subject: `New message: ${msg.subject || `from ${msg.name}`}`,
      text: `${msg.name} <${msg.email}>${msg.phone ? ` · ${msg.phone}` : ""}\n\n${msg.message}\n\nOpen in admin: ${link}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a">
  <h2 style="margin:0 0 16px">New message from your website</h2>
  <table style="font-size:14px;margin-bottom:16px">${row("Name", msg.name)}${row("Email", msg.email)}${row("Phone", msg.phone)}${row("Subject", msg.subject)}</table>
  <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;font-size:15px;line-height:1.6">${body}</div>
  <p style="margin-top:24px"><a href="${link}" style="background:#ff5a00;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Open in admin panel</a></p>
</div>`,
    });
  } catch (err) {
    console.error("Failed to send new-message notification:", err);
  }
}
