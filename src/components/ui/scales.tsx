import { cn } from "@/lib/utils";

export function Scales({
  orientation = "vertical",
  className
}: {
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const vertical = orientation === "vertical";

  return (
    <div className={cn("absolute inset-0 overflow-hidden opacity-50", className)} aria-hidden="true">
      {Array.from({ length: 28 }, (_, index) => (
        <span
          className={cn(
            "absolute bg-gradient-to-b from-transparent via-sky-500/30 to-transparent",
            vertical ? "h-full w-px" : "h-px w-full"
          )}
          key={index}
          style={vertical ? { left: `${index * 4}%` } : { top: `${index * 4}%` }}
        />
      ))}
      {Array.from({ length: 10 }, (_, index) => (
        <span
          className={cn("absolute bg-white/10", vertical ? "h-full w-[2px]" : "h-[2px] w-full")}
          key={`major-${index}`}
          style={vertical ? { left: `${index * 12}%` } : { top: `${index * 12}%` }}
        />
      ))}
    </div>
  );
}
