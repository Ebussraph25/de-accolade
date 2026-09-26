"use client";
import { Field, FormStatus, TextArea } from "./Field";
import { Honeypot, useSubmit } from "./useSubmit";

export function CommentForm({ articleId }: { articleId: string }) {
  const { state, submit } = useSubmit("/api/comments");
  const e = state.errors;
  return (
    <form onSubmit={(ev) => { ev.preventDefault(); submit(ev.currentTarget, { article_id: articleId }); }} className="relative grid gap-4" noValidate>
      <Honeypot />
      <TextArea label="Your comment" name="body" required rows={4} maxLength={2000} error={e.body ?? e.article_id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" error={e.name} />
        <Field label="Email" name="email" type="email" required autoComplete="email" error={e.email} hint="Never published." />
      </div>
      <FormStatus status={state.status} message={state.message} success="Thanks. Your comment will appear once a moderator has reviewed it." />
      <div><button className="btn btn-primary" disabled={state.status === "sending"}>{state.status === "sending" ? "Posting…" : "Post comment"}</button></div>
    </form>
  );
}
