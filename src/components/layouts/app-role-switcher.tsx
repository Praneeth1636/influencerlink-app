"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { BriefcaseBusiness, Loader2, UserRound } from "lucide-react";
import { setAppRolePreference } from "@/lib/auth/role-actions";
import type { AppRole } from "@/lib/auth/role";

export function AppRoleSwitcher({ role, compact = false }: { role: AppRole; compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function chooseRole(nextRole: AppRole) {
    if (nextRole === role || pending) return;

    startTransition(async () => {
      await setAppRolePreference(nextRole);
      router.push(nextRole === "brand" ? "/dashboard" : "/feed");
      router.refresh();
    });
  }

  const options = [
    { role: "creator" as const, label: "Creator", icon: UserRound },
    { role: "brand" as const, label: "Brand", icon: BriefcaseBusiness }
  ];

  return (
    <section
      aria-label="Workspace mode"
      className={
        compact
          ? "rounded-xl border border-[#e6e8ec] bg-white p-2"
          : "rounded-2xl border border-[#e6e8ec] bg-white p-3 shadow-[0_10px_26px_rgba(17,24,39,0.035)]"
      }
    >
      {!compact && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9b9a97] uppercase">Workspace</p>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9b9a97]" />}
        </div>
      )}
      <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#f3f5f7] p-1">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = role === option.role;

          return (
            <button
              aria-pressed={selected}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition duration-200 active:scale-[0.98] ${
                selected
                  ? "bg-white text-[#37352f] shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
                  : "text-[#787774] hover:bg-white/55 hover:text-[#37352f]"
              }`}
              disabled={pending}
              key={option.role}
              onClick={() => chooseRole(option.role)}
              type="button"
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
