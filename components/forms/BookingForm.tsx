"use client";
import { bookingPackages } from "@/lib/validation";
import { Field, FormStatus, Select, TextArea } from "./Field";
import { Honeypot, useSubmit } from "./useSubmit";

export function BookingForm({ defaultPackage }: { defaultPackage?: string }) {
  const { state, submit } = useSubmit("/api/booking");
  const e = state.errors;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form onSubmit={(ev) => { ev.preventDefault(); submit(ev.currentTarget); }} className="relative grid gap-4" noValidate>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required autoComplete="name" error={e.name} />
        <Field label="Phone / WhatsApp" name="phone" type="tel" required autoComplete="tel" error={e.phone} />
      </div>
      <Field label="Email" name="email" type="email" required autoComplete="email" error={e.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Coverage package" name="package" required defaultValue={defaultPackage ?? ""} error={e.package}>
          <option value="" disabled>Choose a package</option>
          {bookingPackages.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Field label="Event date" name="event_date" type="date" min={today} error={e.event_date} />
      </div>
      <Field label="Location" name="location" placeholder="Town, venue" error={e.location} />
      <TextArea label="Tell us about the event" name="details" rows={4} error={e.details} placeholder="Expected guests, programme, what you would like covered" />
      <FormStatus status={state.status} message={state.message} success="Request received. Our events desk will call you within one working day to confirm details and pricing." />
      <div><button className="btn btn-primary" disabled={state.status === "sending"}>{state.status === "sending" ? "Sending…" : "Request coverage"}</button></div>
    </form>
  );
}
