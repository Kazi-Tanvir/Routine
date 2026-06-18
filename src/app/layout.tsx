import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper Routine Tracker | Two-Person Schedule & Attendance",
  description: "A hand-drawn, paper-like daily class routine planner and attendance tracker for two students, with custom weekly templates and holiday logging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
