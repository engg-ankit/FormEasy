import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ChatSupport } from "@/components/chat-support";
import { SplashScreen } from "@/components/splash-screen";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1B2559",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "FormEasy — Every Form. One Platform.",
    template: "%s | FormEasy",
  },
  description:
    "Professional form filling service for college registrations, exam applications, scholarships, government forms, and more. Skip the cyber café — we handle it all online.",
  keywords: [
    "form filling service",
    "exam form online",
    "college registration",
    "scholarship form",
    "government exam form",
    "SSC form",
    "Railway form",
    "Banking exam",
    "online form submission",
    "India",
  ],
  authors: [{ name: "FormEasy" }],
  creator: "FormEasy",
  metadataBase: new URL("https://formeasy.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "FormEasy",
    title: "FormEasy — Every Form. One Platform.",
    description:
      "Professional form filling service for college registrations, exam applications, scholarships, government forms, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FormEasy — Every Form. One Platform.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormEasy — Every Form. One Platform.",
    description:
      "Professional form filling service for college registrations, exam applications, scholarships, government forms, and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${inter.variable} min-h-full flex flex-col`}>
        <SplashScreen />
        <Providers>{children}</Providers>
        <ChatSupport />
      </body>
    </html>
  );
}
