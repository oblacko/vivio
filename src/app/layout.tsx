import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import { FloatingUploadButton } from "@/components/upload/FloatingUploadButton";
import { UploadProvider } from "@/lib/contexts/upload-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vivio - Video Challenge App",
  description: "Create amazing 6-second videos with AI",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <UploadProvider>
          <Navigation />
          <QueryProvider>
            {children}
            <FloatingUploadButton />
          </QueryProvider>
          <Toaster />
        </UploadProvider>
      </body>
    </html>
  );
}
