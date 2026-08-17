import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Forge — AI Infrastructure Research Map",
  description:
    "Agent 驱动的技术、产业、公司与上下游关系研究平台。当前展示 AI 基础设施领域的五层美股产业链地图。",
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
