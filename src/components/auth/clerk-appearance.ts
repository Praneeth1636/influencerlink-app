import { dark } from "@clerk/themes";

// Shared Clerk component theming. Matches the InfluencerLink dark surface and
// the brand orange accent used across the app (#D85A30).
export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#D85A30",
    colorBackground: "#151515",
    colorInputBackground: "#1f1f1f",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#9f9f9f",
    borderRadius: "0.75rem",
    fontFamily: "inherit"
  },
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "border-[#3a3a3a] bg-[#282828] hover:bg-[#303030]",
    formButtonPrimary: "bg-[#D85A30] hover:bg-[#c54f29] shadow-[0_18px_40px_rgba(216,90,48,0.24)] text-white",
    footerActionLink: "text-white hover:underline",
    formFieldInput: "border-[#303030] bg-[#1f1f1f] focus:border-[#D85A30]/60",
    dividerLine: "bg-[#424242]",
    dividerText: "text-[#8b8b8b]"
  }
};
