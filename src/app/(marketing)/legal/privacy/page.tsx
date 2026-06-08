export const metadata = {
  title: "Privacy Policy · Terrace",
  description: "What data Terrace collects, how we use it, and your rights."
};

export default function PrivacyPage() {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.2em] text-[#9b9a97] uppercase">Legal</p>
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: May 18, 2026.</em>
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> — name, email, password hash (via Clerk), role (creator or brand), and the
          fields you fill in during onboarding.
        </li>
        <li>
          <strong>Profile data</strong> — handle, bio, niches, location, rates, portfolio media, cover and avatar
          images.
        </li>
        <li>
          <strong>Connected platform data</strong> — when you authorize Instagram, TikTok, or YouTube, we read your
          follower count, engagement rate, recent posts, and public profile metadata via the platform&apos;s API. We do
          not read DMs or private content.
        </li>
        <li>
          <strong>Payment data</strong> — Stripe Connect handles card and payout information. Terrace never sees full
          card numbers. We store payment status, amounts, and Stripe account references.
        </li>
        <li>
          <strong>Usage data</strong> — pages viewed, searches run, messages sent, applications submitted. Used to power
          features and to improve the product.
        </li>
        <li>
          <strong>Device data</strong> — IP, user agent, approximate location. Used for security and analytics.
        </li>
      </ul>

      <h2>2. How we use it</h2>
      <ul>
        <li>Provide and operate Terrace (matching, messaging, payments).</li>
        <li>Verify creator metrics and detect fraudulent accounts.</li>
        <li>Send transactional and product email (you can disable product email in Settings).</li>
        <li>Comply with legal obligations and protect Terrace and our users.</li>
      </ul>

      <h2>3. Sharing</h2>
      <p>We share data only with the subprocessors needed to run the service:</p>
      <ul>
        <li>Clerk (authentication)</li>
        <li>Stripe (payments and payouts)</li>
        <li>Neon (database hosting)</li>
        <li>Resend (transactional email)</li>
        <li>Cloudflare R2 (file storage)</li>
        <li>Sentry, PostHog (operational analytics — anonymized where possible)</li>
      </ul>
      <p>We do not sell personal data.</p>

      <h2>4. Retention</h2>
      <p>
        We keep account data for as long as your account is active, plus 12 months for legal and audit purposes. You can
        request earlier deletion at any time.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Depending on jurisdiction (GDPR, CCPA, and similar), you have the right to access, correct, export, restrict, or
        delete your personal data. Submit requests to <a href="mailto:privacy@terrace.app">privacy@terrace.app</a>.
      </p>

      <h2>6. Children</h2>
      <p>Terrace is not directed to children under 16 and we do not knowingly collect data from them.</p>

      <h2>7. Security</h2>
      <p>
        Data in transit is encrypted with TLS. Platform OAuth tokens are encrypted at rest with AES. Access to
        production systems is restricted and logged.
      </p>

      <h2>8. International transfers</h2>
      <p>Data may be processed in the United States and other jurisdictions where our subprocessors operate.</p>

      <h2>9. Changes</h2>
      <p>
        We may update this policy. Material changes will be announced in-product and via email. The &quot;Last
        updated&quot; date reflects the latest revision.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions: <a href="mailto:privacy@terrace.app">privacy@terrace.app</a>.
      </p>
    </>
  );
}
