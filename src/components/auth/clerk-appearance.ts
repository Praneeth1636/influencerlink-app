// Shared Clerk component theming. Notion-style light surface with the brand
// orange accent (#D86B3D). Used for the global UserButton (layout/app-shell)
// and the auth forms (login/signup) via clerkLightAppearance.

const notionVariables = {
  colorPrimary: "#D86B3D",
  colorBackground: "#ffffff",
  colorInputBackground: "#ffffff",
  colorInputText: "#37352f",
  colorText: "#37352f",
  colorTextSecondary: "#787774",
  borderRadius: "0.5rem",
  fontFamily: "inherit"
};

export const clerkAppearance = {
  variables: notionVariables,
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "rounded-md border-[#e9e9e7] bg-white text-[#37352f] hover:bg-[#f7f7f5]",
    formButtonPrimary: "rounded-md bg-[#37352f] text-white hover:bg-[#262420]",
    footerActionLink: "text-[#D86B3D] hover:text-[#bf5a30] hover:underline",
    formFieldInput: "rounded-md border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus:border-[#8CC9E8]",
    dividerLine: "bg-[#e9e9e7]",
    dividerText: "text-[#787774]"
  }
};

export const clerkLightAppearance = {
  variables: notionVariables,
  elements: {
    rootBox: "w-full",
    card: "w-full border-0 bg-transparent shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton: "h-12 rounded-md border-[#e9e9e7] bg-white text-[#37352f] hover:bg-[#f7f7f5]",
    formButtonPrimary: "h-12 rounded-md bg-[#37352f] text-white hover:bg-[#262420]",
    footerActionLink: "text-[#D86B3D] hover:text-[#bf5a30] hover:underline",
    formFieldLabel: "text-[#37352f] font-semibold",
    formFieldInput:
      "h-12 rounded-md border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f] focus:border-[#8CC9E8] focus:ring-[#8CC9E8]/25",
    otpCodeFieldInputs: "gap-2 justify-center",
    otpCodeFieldInput:
      "h-14 w-12 rounded-md border border-[#e9e9e7] bg-white text-center text-xl font-semibold text-[#37352f] focus:border-[#D86B3D] focus:ring-2 focus:ring-[#D86B3D]/25 focus:outline-none",
    formResendCodeLink: "text-[#D86B3D] hover:text-[#bf5a30] font-semibold",
    identityPreview: "rounded-md border border-[#e9e9e7] bg-[#fbfbfa] text-[#37352f]",
    identityPreviewText: "text-[#37352f]",
    identityPreviewEditButton: "text-[#D86B3D] hover:text-[#bf5a30]",
    dividerLine: "bg-[#e9e9e7]",
    dividerText: "text-[#787774]",
    footer: "hidden"
  }
};
