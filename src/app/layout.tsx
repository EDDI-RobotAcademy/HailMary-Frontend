import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "도화선",
  description: "서사 기반의 사주 해석 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
