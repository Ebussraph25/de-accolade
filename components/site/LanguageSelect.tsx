"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLanguage } from "@/app/actions/preferences";
import { languages, type LangCode } from "@/lib/taxonomy";
import { GlobeIcon } from "./Icons";

export function LanguageSelect({ current, className = "" }: { current: LangCode; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <GlobeIcon className="h-4 w-4" />
      <span className="sr-only">Language</span>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => start(async () => { await setLanguage(e.target.value); router.refresh(); })}
        className="cursor-pointer appearance-none bg-transparent pr-1 font-medium outline-none [&>option]:text-black"
      >
        {languages.map((l) => (<option key={l.code} value={l.code}>{l.native}</option>))}
      </select>
    </label>
  );
}
