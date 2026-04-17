import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Studio Practice",
  description: "9 sessions a week. Every medium touched.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Studio",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1916",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#1A1916" }}>{children}</body>
    </html>
  );
}
