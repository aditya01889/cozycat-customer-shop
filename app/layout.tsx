import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReactQueryProvider } from "@/lib/react-query/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CozyCatKitchen - Fresh Homemade Cat Food | Order Online",
    template: "%s | CozyCatKitchen"
  },
  description: "Fresh, homemade cat food made to order. No preservatives, no fillers - just real ingredients for your feline friend. Order complete meals, nutritious broths, healthy treats & celebration bakes.",
  keywords: [
    "fresh cat food",
    "homemade cat food", 
    "natural cat food",
    "cat food delivery",
    "healthy cat treats",
    "cat meals online",
    "preservative-free cat food",
    "cozy cat kitchen"
  ],
  authors: [{ name: "CozyCatKitchen" }],
  creator: "CozyCatKitchen",
  publisher: "CozyCatKitchen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cozycatkitchen.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cozycatkitchen.vercel.app',
    title: 'CozyCatKitchen - Fresh Homemade Cat Food',
    description: 'Fresh, homemade cat food made to order. No preservatives, no fillers - just real ingredients for your feline friend.',
    siteName: 'CozyCatKitchen',
    images: [
      {
        url: '/logo.png',
        width: 400,
        height: 400,
        alt: 'CozyCatKitchen Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CozyCatKitchen - Fresh Homemade Cat Food',
    description: 'Fresh, homemade cat food made to order. No preservatives, no fillers - just real ingredients.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ReactQueryProvider>
            <ToastProvider>
              <AuthProvider>
                <Navbar />
                <main className="min-h-screen bg-gray-50">
                  {children}
                </main>
                <Footer />
              </AuthProvider>
            </ToastProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
