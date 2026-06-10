import Link from "next/link";

const productLinks = [
  { href: "/jobs", label: "Gigs" },
  { href: "/search", label: "Creators", prefetch: false },
  { href: "/pricing", label: "Pricing" }
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

const legalLinks = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/aup", label: "Acceptable Use" }
];

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#eadfd2] bg-[#fffdfa]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Terrace" className="inline-flex items-center gap-3">
            <span className="logoMark miniLogo" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="flex items-baseline font-serif text-2xl font-bold tracking-[-0.03em] text-[#221c16]">
              Terrace<span className="text-[#c75b2e]">.</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#6b5d4f]">
            The professional network for creator deals. Verified reach, brand gigs, and payouts in one workspace.
          </p>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Company" links={companyLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>

      <div className="border-t border-[#eadfd2]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-5 text-xs text-[#a08e7b] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Terrace. All rights reserved.</p>
          <p>
            Built for creators &amp; brands who want{" "}
            <span className="font-semibold text-[#6b5d4f]">honest, proof-led collaboration.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: Array<{ href: string; label: string; prefetch?: boolean }>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-[#a08e7b] uppercase">{title}</p>
      <ul className="mt-4 grid gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="text-sm font-medium text-[#6b5d4f] transition hover:text-[#221c16]"
              href={link.href}
              prefetch={link.prefetch}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
