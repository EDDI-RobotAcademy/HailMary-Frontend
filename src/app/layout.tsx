import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import AmplitudeProvider from "./AmplitudeProvider";

export const metadata: Metadata = {
  title: "도화선",
  description: "서사 기반의 사주 해석 서비스",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full bg-white antialiased">
      <body className="mx-auto flex min-h-full max-w-md flex-col">
        <AmplitudeProvider />
        {children}
      </body>
    </html>
  );
}
