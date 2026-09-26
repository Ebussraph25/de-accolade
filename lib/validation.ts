import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(200);
const phone = z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "Enter a valid phone number");
/** Honeypot + minimum fill time: bots fill every field instantly. */
const antiSpam = { website: z.string().max(0).optional().or(z.literal("")), t: z.coerce.number().optional() };

export const newsletterSchema = z.object({ email, language: z.enum(["en", "ig", "yo", "ha"]).default("en"), ...antiSpam });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email,
  phone: phone.optional().or(z.literal("")),
  subject: z.string().trim().min(3, "Add a subject").max(150),
  message: z.string().trim().min(10, "Your message is too short").max(5000),
  ...antiSpam,
});

export const bookingPackages = [
  "Wedding coverage",
  "Community event coverage",
  "Corporate coverage",
  "Festival coverage",
  "Interview coverage",
] as const;

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email,
  phone: phone.min(7, "Enter a phone number we can call"),
  package: z.enum(bookingPackages, { message: "Choose a coverage package" }),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  details: z.string().trim().max(3000).optional().or(z.literal("")),
  ...antiSpam,
});

export const commentSchema = z.object({
  article_id: z.string().uuid(),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email,
  body: z
    .string()
    .trim()
    .min(2, "Write a comment")
    .max(2000, "Comments are limited to 2,000 characters")
    .refine((v) => (v.match(/https?:\/\//g) ?? []).length <= 2, "Comments may include at most two links"),
  ...antiSpam,
});

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = String(issue.path[0] ?? "form");
    out[k] ??= issue.message;
  }
  return out;
}
