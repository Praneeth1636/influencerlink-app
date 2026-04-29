import { SignIn } from "@clerk/nextjs";
import { AuthChrome } from "@/components/auth/auth-chrome";
import { clerkAppearance } from "@/components/auth/clerk-appearance";

export default function LoginPage() {
  return (
    <AuthChrome
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      switchPrompt={{
        question: "Don't have an account?",
        href: "/signup",
        label: "Sign up"
      }}
    >
      <SignIn
        appearance={clerkAppearance}
        path="/login"
        routing="path"
        signUpUrl="/signup"
        fallbackRedirectUrl="/onboarding"
      />
    </AuthChrome>
  );
}
