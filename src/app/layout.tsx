// src/app/layout.tsx
import { Header } from "@/components/shared/header";
import { Metadata } from "next";
//import "../styles/globals.css";

export const metadata: Metadata = {
  title: "SayVerse V0",
  description: "Voice-based social platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}