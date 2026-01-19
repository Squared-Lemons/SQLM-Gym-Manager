import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@app/ui";
import "@app/ui/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gym Management - Owner Dashboard",
  description: "Manage your gym business with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
