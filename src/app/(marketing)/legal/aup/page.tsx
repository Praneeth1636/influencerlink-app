export const metadata = {
  title: "Acceptable Use · Terrace",
  description: "Rules of the road on Terrace."
};

export default function AupPage() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Legal</p>
      <h1>Acceptable Use Policy</h1>
      <p>
        <em>Last updated: May 18, 2026.</em>
      </p>

      <p>
        Terrace exists so creators and brands can do honest work together. The rules below keep that possible. Breaking
        them can result in warnings, content removal, payment holds, or account termination.
      </p>

      <h2>You may not</h2>
      <ul>
        <li>
          <strong>Misrepresent metrics.</strong> No fake followers, bought engagement, paid bots, or unverified reach
          claims. Connect your real platform accounts.
        </li>
        <li>
          <strong>Impersonate.</strong> No fake names, fake brands, or accounts representing someone you are not
          authorized to represent.
        </li>
        <li>
          <strong>Solicit off-platform.</strong> Brands and creators must keep the contract phase (offer, acceptance,
          payment) on Terrace. You may move execution (drafts, files) off-platform after a brief is hired.
        </li>
        <li>
          <strong>Spam.</strong> No mass-unsolicited DMs, brief-bombing, or duplicate applications across many briefs
          you don&apos;t actually fit.
        </li>
        <li>
          <strong>Discriminate.</strong> No briefs or messages that exclude on the basis of protected characteristics
          (race, religion, gender identity, disability, etc.).
        </li>
        <li>
          <strong>Distribute unlawful content.</strong> No CSAM, non-consensual intimate imagery, terrorist content,
          stolen IP, hate speech, harassment, or doxxing.
        </li>
        <li>
          <strong>Defraud.</strong> No chargeback fraud, payment laundering, or briefs that conceal their true intent.
        </li>
        <li>
          <strong>Abuse the system.</strong> No scraping, automated mass-querying, reverse engineering, or attempting to
          bypass rate limits, paywalls, or security controls.
        </li>
      </ul>

      <h2>Brand-specific rules</h2>
      <ul>
        <li>Briefs must be honest about deliverables, budget, exclusivity, and usage rights.</li>
        <li>Pay creators on the agreed schedule. Funds in escrow release on delivery.</li>
        <li>FTC disclosure obligations remain yours. Don&apos;t ask creators to hide sponsored content.</li>
      </ul>

      <h2>Creator-specific rules</h2>
      <ul>
        <li>Deliver what you accepted, on time, to the scope agreed.</li>
        <li>Disclose conflicts (e.g. competing brand deal, exclusivity overlap) before applying.</li>
        <li>Follow each platform&apos;s rules — Terrace doesn&apos;t override Instagram, TikTok, or YouTube policy.</li>
      </ul>

      <h2>Reporting</h2>
      <p>
        See something that breaks these rules? <a href="mailto:abuse@terrace.app">abuse@terrace.app</a>. Include URLs,
        screenshots, and any context.
      </p>

      <h2>Enforcement</h2>
      <p>
        We act on reports and on our own detection. Decisions are at Terrace&apos;s discretion. Severe violations
        (fraud, illegal content) result in immediate termination. Repeat lesser violations escalate from warning to
        suspension to termination.
      </p>
    </>
  );
}
