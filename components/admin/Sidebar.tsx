"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Wordmark } from "../site/Logo";
import { CloseIcon, MenuIcon } from "../site/Icons";

export type NavItem = { href: string; label: string; badge?: number };

export function Sidebar({ items, footer }: { items: NavItem[]; footer: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Newsroom" className="flex flex-1 flex-col">
      <ul className="space-y-0.5">
        {items.map((i) => {
          const active = path === i.href || (i.href !== "/admin/dashboard" && path.startsWith(i.href));
          return (
            <li key={i.href}>
              <Link href={i.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between px-3 py-2 text-[0.95rem] font-medium ${active ? "bg-white/10 text-white shadow-[inset_3px_0_0_var(--gold-500)]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                {i.label}
                {!!i.badge && <span className="min-w-6 rounded-full bg-gold-500 px-1.5 text-center text-xs font-bold text-navy-950">{i.badge}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto pt-8">{footer}</div>
    </nav>
  );
  return (
    <>
      <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white lg:hidden">
        <Link href="/admin/dashboard" className="text-white"><Wordmark size="sm" tone="onDark" /></Link>
        <button onClick={() => setOpen(true)} aria-label="Open newsroom menu" className="p-1"><MenuIcon /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-72 flex-col bg-navy-900 p-4">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="mb-4 self-end p-1 text-white"><CloseIcon /></button>
            {nav}
          </div>
          <button className="flex-1 bg-black/50" aria-label="Close menu" onClick={() => setOpen(false)} />
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-900 p-4 lg:flex">
        <Link href="/admin/dashboard" className="mb-8 block px-2 pt-2 text-white"><Wordmark size="sm" tone="onDark" /></Link>
        {nav}
      </aside>
    </>
  );
}
