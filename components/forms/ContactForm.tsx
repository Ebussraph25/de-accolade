"use client";
import { Field, FormStatus, TextArea } from "./Field";
import { Honeypot, useSubmit } from "./useSubmit";

export function ContactForm() {
  const { state, submit } = useSubmit("/api/contact");
  const e = state.errors;
  return (
    <form onSubmit={(ev) => { ev.preventDefault(); submit(ev.currentTarget); }} className="relative grid gap-4" noValidate>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" required autoComplete="name" error={e.name} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={e.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" error={e.phone} />
        <Field label="Subject" name="subject" required error={e.subject} placeholder="Story tip, correction, partnership…" />
      </div>
      <TextArea label="Message" name="message" required rows={6} error={e.message} />
      <FormStatus status={state.status} message={state.message} success="Thank you. Your message has reached the newsroom and an editor will reply by email." />
      <div><button className="btn btn-primary" disabled={state.status === "sending"}>{state.status === "sending" ? "Sending…" : "Send message"}</button></div>
    </form>
  );
}
