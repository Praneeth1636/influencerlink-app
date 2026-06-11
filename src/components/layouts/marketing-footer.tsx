import Link from "next/link";

const productLinks = [
  { href: "/jobs", label: "Gigs" },
  { href: "/creators", label: "Creators" },
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
    <footer className="border-t border-[#e9e9e7] bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="Terrace" className="inline-flex items-center gap-3">
            <span className="logoMark miniLogo" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="flex items-baseline text-2xl font-semibold tracking-[-0.04em] text-[#37352f]">
              Terrace<span className="text-[#ED9568]">.</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#787774]">
            The professional network for creator deals. Verified reach, brand gigs, and payouts in one workspace.
          </p>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Company" links={companyLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>

      <div className="border-t border-[#e9e9e7]">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-5 text-xs text-[#9b9a97] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Terrace. All rights reserved.</p>
          <p>
            Built for creators &amp; brands who want{" "}
            <span className="font-semibold text-[#787774]">honest, proof-led collaboration.</span>
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
      <p className="text-xs font-semibold tracking-[0.18em] text-[#9b9a97] uppercase">{title}</p>
      <ul className="mt-4 grid gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className="text-sm font-medium text-[#787774] transition hover:text-[#37352f]"
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
