import Navbar from "@/components/Navbar";
import React from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}