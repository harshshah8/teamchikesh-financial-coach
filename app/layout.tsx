import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Team Chikesh Financial Coach",
  description: "Private personal finance coach for Harsh and Anubhuti"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-3xl pb-24">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
