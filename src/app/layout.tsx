import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ChatSupport } from "@/components/chat-support";
import { SplashScreen } from "@/components/splash-screen";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { PwaRegister } from "@/components/pwa-register";

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
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "ClickNsit — Online Cyber Cafe",
    template: "%s | ClickNsit",
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
  authors: [{ name: "ClickNsit" }],
  creator: "ClickNsit",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://clickandsit.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ClickNsit",
    title: "ClickNsit — Online Cyber Cafe",
    description:
      "India's trusted online cyber cafe for form filling — college registrations, exam applications, scholarships, government forms, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClickNsit — Online Cyber Cafe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickNsit — Online Cyber Cafe",
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
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ClickNsit" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${sora.variable} ${inter.variable} min-h-full flex flex-col`}>
        <SplashScreen />
        <Providers>
          <div className="flex-1 flex flex-col pb-[calc(68px+env(safe-area-inset-bottom))] md:pb-0">
            {children}
          </div>
          <MobileTabBar />
        </Providers>
        <ChatSupport />
        <WhatsAppButton />
      </body>
    </html>
  );
}
