import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Supply Chain Lab — 五层上游产业链树",
  description:
    "可交互拆解大语言模型能力提升如何传导到 GPU、HBM、网络、硅光、封装、电力与液冷产业链。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
