'use client';

import { ClerkProvider } from '@clerk/nextjs';

export default function ClerkProviderWithLocale({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider 
      // 移除本地化以减少包大小
      // localization={enUS}
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
          socialButtonsPlacement: "top",
          showOptionalFields: false,
          shimmer: false // 禁用 shimmer 效果以减少 JS
        },
        variables: {
          colorPrimary: "#000000",
          colorBackground: "#ffffff",
          colorText: "#000000",
          colorTextSecondary: "#666666",
          borderRadius: "0.5rem",
          fontFamily: "system-ui, -apple-system, sans-serif"
        },
        elements: {
          formButtonPrimary: "bg-black hover:bg-gray-800 text-sm normal-case",
          card: "shadow-none",
          footer: "hidden",
          formFieldInput: "rounded-md border-gray-300 focus:border-black focus:ring-black",
          formFieldLabel: "text-gray-700",
          main: "min-w-[320px] font-sans",
          identityPreview: "shadow-sm border-gray-200"
        }
      }}
      // 性能优化选项
    >
      {children}
    </ClerkProvider>
  );
} 