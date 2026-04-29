import { SignUp } from "@clerk/nextjs";
import { AuthChrome } from "@/components/auth/auth-chrome";
import { clerkAppearance } from "@/components/auth/clerk-appearance";

export default function SignupPage() {
  return (
    <AuthChrome
      title="Sign up"
      subtitle="Choose creator or company once you finish account setup."
      switchPrompt={{
        question: "Already have an account?",
        href: "/login",
        label: "Sign in"
      }}
    >
      <SignUp
        appearance={clerkAppearance}
        path="/signup"
        routing="path"
        signInUrl="/login"
        fallbackRedirectUrl="/onboarding"
      />
    </AuthChrome>
  );
}
