import type { Metadata } from "next";

import "@/app/globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { TopBar } from "@/components/top-bar";

export const metadata: Metadata = {
  title: "KidBank",
  description: "Money coach app for kids"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        <main className="mx-auto min-h-screen w-full max-w-md px-6 pb-32 pt-24">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
