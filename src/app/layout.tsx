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
    default: "CyberSeva — Online Cyber Cafe",
    template: "%s | CyberSeva",
  },
  description:
    "India's trusted online cyber cafe for form filling — college registrations, exam applications, scholarships, government forms, and more. Fill forms from home!",
  keywords: [
    "online cyber cafe",
    "cyber cafe online",
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
  authors: [{ name: "CyberSeva" }],
  creator: "CyberSeva",
  metadataBase: new URL("https://cyberseva.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "CyberSeva",
    title: "CyberSeva — Online Cyber Cafe",
    description:
      "India's trusted online cyber cafe for form filling — college registrations, exam applications, scholarships, government forms, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CyberSeva — Online Cyber Cafe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberSeva — Online Cyber Cafe",
    description:
      "India's trusted online cyber cafe for form filling — college registrations, exam applications, scholarships, government forms, and more.",
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
