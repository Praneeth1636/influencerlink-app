// Marketing route group layout. Top nav with theme toggle + signed-in /
// signed-out CTAs. Pages render below the nav.

import { MarketingFooter } from "@/components/layouts/marketing-footer";
import { MarketingNav } from "@/components/layouts/marketing-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
