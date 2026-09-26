import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Common = { label: string; name: string; error?: string; hint?: ReactNode };

export function Field({ label, name, error, hint, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}{rest.required && <span className="text-accent"> *</span>}</label>
      <input id={id} name={name} className="field" aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-live">{error}</p>}
    </div>
  );
}

export function TextArea({ label, name, error, hint, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}{rest.required && <span className="text-accent"> *</span>}</label>
      <textarea id={id} name={name} className="field min-h-32" aria-invalid={!!error || undefined} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm text-live">{error}</p>}
    </div>
  );
}

export function Select({ label, name, error, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">{label}{rest.required && <span className="text-accent"> *</span>}</label>
      <select id={id} name={name} className="field" aria-invalid={!!error || undefined} {...rest}>{children}</select>
      {error && <p className="mt-1 text-sm text-live">{error}</p>}
    </div>
  );
}

export function FormStatus({ status, message, success }: { status: string; message?: string; success: string }) {
  if (status === "done") return <p role="status" className="border-l-4 border-gold-500 bg-gold-100/60 px-4 py-3 text-navy-900 dark:bg-navy-900 dark:text-gold-100">{success}</p>;
  if (status === "error") return <p role="alert" className="border-l-4 border-live bg-live/10 px-4 py-3 text-sm">{message}</p>;
  return null;
}
