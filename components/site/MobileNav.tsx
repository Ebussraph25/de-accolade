"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "./Icons";

export type NavGroup = { href: string; label: string; children?: { href: string; label: string }[] };

export function MobileNav({ groups }: { groups: NavGroup[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} className="p-2" aria-label="Open menu" aria-expanded={open}>
        <MenuIcon className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button className="flex-1 bg-navy-950/60" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav className="h-full w-[min(22rem,88vw)] overflow-y-auto bg-bg p-5 shadow-xl" aria-label="Mobile" onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} className="p-2" aria-label="Close menu"><CloseIcon /></button>
            </div>
            <ul className="divide-y divide-rule">
              {groups.map((g) => (
                <li key={g.href} className="py-3">
                  <Link href={g.href} className="font-serif text-xl font-semibold">{g.label}</Link>
                  {g.children && (
                    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {g.children.map((c) => (
                        <li key={c.href}><Link href={c.href} className="text-[0.95rem] text-muted hover:text-fg">{c.label}</Link></li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
