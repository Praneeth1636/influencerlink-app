export const metadata = {
  title: "Terms of Service · Terrace",
  description: "The agreement that governs your use of Terrace."
};

export default function TermsPage() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Legal · placeholder</p>
      <h1>Terms of Service</h1>
      <p>
        <em>Last updated: May 18, 2026.</em>
      </p>

      <h2>1. Agreement</h2>
      <p>
        By creating a Terrace account or using the service, you agree to these Terms of Service. If you do not agree, do
        not use Terrace.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must be at least 16 years old to create a creator account, and at least 18 to create a brand account or to
        send or receive payments through Terrace. You are responsible for keeping your credentials secure and for every
        activity that occurs under your account.
      </p>

      <h2>3. Roles</h2>
      <ul>
        <li>
          <strong>Creators</strong> publish a verified profile and may apply to brand briefs, accept work, and receive
          payouts.
        </li>
        <li>
          <strong>Brands</strong> publish briefs, shortlist applicants, hire creators, and pay through Terrace.
        </li>
      </ul>

      <h2>4. Payments</h2>
      <p>
        Terrace uses Stripe Connect to escrow brief budgets and release funds to creators on delivery. Stripe&apos;s
        terms govern the underlying payments. Terrace deducts a platform fee disclosed at checkout. Refunds,
        chargebacks, and disputes are handled per the Acceptable Use policy.
      </p>

      <h2>5. Content</h2>
      <p>
        You retain ownership of everything you post. By posting, you grant Terrace a non-exclusive license to display,
        host, and distribute your content within the service and in marketing materials, with attribution.
      </p>

      <h2>6. Prohibited conduct</h2>
      <p>See the Acceptable Use policy.</p>

      <h2>7. Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these Terms or the Acceptable Use policy. You may close your
        account at any time from Settings.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        Terrace is provided &quot;as is.&quot; We do not warrant that the service will be uninterrupted or error-free.
        Verification of audience metrics is a best-effort signal, not a guarantee.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Terrace&apos;s aggregate liability for any claim arising from these
        Terms is limited to the greater of the fees you paid to Terrace in the prior 12 months or USD 100.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these Terms. Material changes will be announced in-product and via email. Continued use after the
        effective date constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions: <a href="mailto:legal@terrace.app">legal@terrace.app</a>.
      </p>
    </>
  );
}
