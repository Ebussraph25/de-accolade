"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "./Icons";

export function SearchDialog({ label = "Search" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement).closest("input,textarea,select")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 p-2 hover:text-accent" aria-label={label}>
        <SearchIcon />
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
        className="m-0 mx-auto mt-[12vh] w-[min(40rem,calc(100%-2rem))] max-w-none bg-bg p-0 text-fg shadow-2xl backdrop:bg-navy-950/60 backdrop:backdrop-blur-sm"
      >
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q")?.toString().trim();
            setOpen(false);
            router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
          }}
          className="flex items-center gap-3 border-b-2 border-gold-500 px-4 py-3"
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <label htmlFor="site-search" className="sr-only">Search De Accolade</label>
          <input id="site-search" name="q" autoFocus placeholder="Search stories, videos and people" className="w-full bg-transparent py-2 font-serif text-xl outline-none placeholder:text-muted" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close search" className="p-1 text-muted hover:text-fg"><CloseIcon /></button>
        </form>
        <p className="px-4 py-3 text-sm text-muted">Press Enter to search. Use filters on the results page to narrow by section, language, type or date.</p>
      </dialog>
    </>
  );
}
