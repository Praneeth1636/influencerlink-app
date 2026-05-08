import { dark } from "@clerk/themes";

// Shared Clerk component theming. Matches the Terrace dark surface and
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

export const clerkLightAppearance = {
  variables: {
    colorPrimary: "#D86B3D",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#111318",
    colorText: "#111318",
    colorTextSecondary: "#6b7280",
    borderRadius: "1rem",
    fontFamily: "inherit"
  },
  elements: {
    rootBox: "w-full",
    card: "w-full border-0 bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "h-12 rounded-xl border-[#e6e8ed] bg-white text-[#111318] shadow-sm hover:bg-[#f8fafc]",
    formButtonPrimary:
      "h-12 rounded-xl bg-[#111318] text-white shadow-[0_16px_36px_rgba(17,19,24,0.16)] hover:bg-[#242833]",
    footerActionLink: "text-[#D86B3D] hover:text-[#b9542e] hover:underline",
    formFieldLabel: "text-[#111318] font-semibold",
    formFieldInput:
      "h-12 rounded-xl border-[#e6e8ed] bg-[#fbfbfb] text-[#111318] focus:border-[#8CC9E8] focus:ring-[#8CC9E8]/25",
    dividerLine: "bg-[#e8ebef]",
    dividerText: "text-[#8a93a3]",
    footer: "hidden"
  }
};
