import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Bazzato Vendor",
  description: "Vendor portal for Bazzato shop owners"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
