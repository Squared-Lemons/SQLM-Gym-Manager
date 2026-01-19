import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@app/ui";
import "@app/ui/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gym Member Portal",
  description: "Access your gym membership and classes",
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
