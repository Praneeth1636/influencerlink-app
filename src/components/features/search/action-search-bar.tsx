"use client";

import {
  AudioLines,
  BadgeCheck,
  BriefcaseBusiness,
  Clapperboard,
  LayoutGrid,
  Search,
  Send,
  Sparkles,
  Users
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TerraceSearchAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  href?: string;
  shortcut?: string;
  end?: string;
  query?: string;
}

const DEFAULT_ACTIONS: TerraceSearchAction[] = [
  {
    id: "beauty-creators",
    label: "Beauty creators",
    icon: <Users className="h-4 w-4 text-[#d86b3d]" />,
    description: "Audience-fit discovery",
    href: "/search?q=beauty",
    shortcut: "B",
    end: "Creator",
    query: "beauty"
  },
  {
    id: "open-collabs",
    label: "Open to collabs",
    icon: <BadgeCheck className="h-4 w-4 text-[#3e95bd]" />,
    description: "Creators accepting briefs",
    href: "/search?open=1",
    shortcut: "O",
    end: "Signal",
    query: "open"
  },
  {
    id: "brand-briefs",
    label: "Brand briefs",
    icon: <BriefcaseBusiness className="h-4 w-4 text-[#c87544]" />,
    description: "Active campaign asks",
    href: "/jobs",
    shortcut: "J",
    end: "Jobs",
    query: "brief"
  },
  {
    id: "content-drops",
    label: "Content drops",
    icon: <Clapperboard className="h-4 w-4 text-[#5c7ea1]" />,
    description: "Recent proof posts",
    href: "/feed",
    end: "Feed",
    query: "drop"
  },
  {
    id: "ai-match",
    label: "AI match a brief",
    icon: <Sparkles className="h-4 w-4 text-[#de8c68]" />,
    description: "Find creators from a campaign note",
    href: "/search?mode=ai",
    end: "Agent",
    query: "AI matching"
  },
  {
    id: "voice-note",
    label: "Voice note to search",
    icon: <AudioLines className="h-4 w-4 text-[#6ea3c1]" />,
    description: "Capture a brief idea",
    end: "Beta",
    query: ""
  },
  {
    id: "market-map",
    label: "Creator market map",
    icon: <LayoutGrid className="h-4 w-4 text-[#a57a66]" />,
    description: "Niches, rates, and reach",
    href: "/analytics",
    end: "View",
    query: "market"
  }
];

const animationVariants = {
  container: {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.18,
        staggerChildren: 0.035
      }
    },
    exit: {
      opacity: 0,
      y: -4,
      scale: 0.98,
      transition: { duration: 0.14 }
    }
  },
  item: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.16 } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.1 } }
  }
} as const;

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

export function TerraceActionSearchBar({
  actions = DEFAULT_ACTIONS,
  className,
  inputClassName,
  label = "Search Terrace",
  onActionSelect,
  onQueryChange,
  placeholder = "Search creators, brands, briefs...",
  query
}: {
  actions?: TerraceSearchAction[];
  className?: string;
  inputClassName?: string;
  label?: string;
  onActionSelect?: (action: TerraceSearchAction) => void;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  query: string;
}) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const debouncedQuery = useDebouncedValue(query, 140);

  const filteredActions = React.useMemo(() => {
    const normalizedQuery = debouncedQuery.toLowerCase().trim();
    if (!normalizedQuery) return actions;

    return actions.filter((action) => {
      const searchableText = `${action.label} ${action.description ?? ""} ${action.end ?? ""}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [actions, debouncedQuery]);

  const isOpen = isFocused && filteredActions.length > 0;

  const selectAction = React.useCallback(
    (action: TerraceSearchAction) => {
      onQueryChange(action.query ?? action.label);
      onActionSelect?.(action);
      setIsFocused(false);
      setActiveIndex(-1);
      if (action.href) {
        window.location.assign(action.href);
      }
    },
    [onActionSelect, onQueryChange]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((current) => (current < filteredActions.length - 1 ? current + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((current) => (current > 0 ? current - 1 : filteredActions.length - 1));
          break;
        case "Enter":
          if (activeIndex >= 0 && filteredActions[activeIndex]) {
            event.preventDefault();
            selectAction(filteredActions[activeIndex]);
          }
          break;
        case "Escape":
          setIsFocused(false);
          setActiveIndex(-1);
          break;
      }
    },
    [activeIndex, filteredActions, isOpen, selectAction]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <label className="sr-only" htmlFor="terrace-action-search">
        {label}
      </label>
      <div className="relative">
        <Input
          aria-activedescendant={activeIndex >= 0 ? `terrace-action-${filteredActions[activeIndex]?.id}` : undefined}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          autoComplete="off"
          className={cn(
            "h-11 rounded-full border-[#e9e9e7] bg-white pr-11 pl-11 text-sm shadow-[0_10px_30px_rgba(17,24,39,0.035)] outline-none placeholder:text-[#9b9a97] focus-visible:border-[#9dcfe5] focus-visible:ring-[#9dcfe5]/45",
            inputClassName
          )}
          id="terrace-action-search"
          onBlur={() => {
            window.setTimeout(() => {
              setIsFocused(false);
              setActiveIndex(-1);
            }, 160);
          }}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          type="text"
          value={query}
        />
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8a94a5]" />
        <div className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {query.length > 0 ? (
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                initial={{ y: -12, opacity: 0 }}
                key="send"
                transition={{ duration: 0.16 }}
              >
                <Send className="h-4 w-4 text-[#d86b3d]" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                initial={{ y: -12, opacity: 0 }}
                key="search"
                transition={{ duration: 0.16 }}
              >
                <Sparkles className="h-4 w-4 text-[#8a94a5]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate="show"
            aria-label="Terrace search suggestions"
            className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-[22px] border border-[#e9e9e7] bg-white/96 p-2 shadow-[0_28px_80px_rgba(21,24,31,0.14)] backdrop-blur-xl"
            exit="exit"
            initial="hidden"
            role="listbox"
            variants={animationVariants.container}
          >
            <motion.ul className="grid gap-1" role="none">
              {filteredActions.map((action, index) => (
                <motion.li
                  aria-selected={activeIndex === index}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition",
                    activeIndex === index ? "bg-[#f7f7f7]" : "hover:bg-[#f7f7f7]"
                  )}
                  id={`terrace-action-${action.id}`}
                  key={action.id}
                  layout
                  onClick={() => selectAction(action)}
                  role="option"
                  variants={animationVariants.item}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-[#e9e9e7] bg-white">
                      {action.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#37352f]">{action.label}</span>
                      {action.description ? (
                        <span className="block truncate text-xs font-medium text-[#7b8494]">{action.description}</span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {action.shortcut ? (
                      <span className="rounded-md border border-[#e9e9e7] bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#8a94a5]">
                        {action.shortcut}
                      </span>
                    ) : null}
                    {action.end ? <span className="text-xs font-bold text-[#9b9a97]">{action.end}</span> : null}
                  </div>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-2 flex items-center justify-between border-t border-[#e9e9e7] px-3 pt-2 text-[11px] font-semibold text-[#9b9a97]">
              <span>Arrow keys to move</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
