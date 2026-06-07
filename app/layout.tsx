import type { Metadata } from "next";
import { Poppins, Alex_Brush } from "next/font/google";
import "./globals.css";
import { defaultLocale } from "@/i18n/config";

// Original Vindle fonts: Poppins for body, Alex Brush for the cursive title.
const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
});
const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alex-brush",
});

export const metadata: Metadata = {
  title: "Vindle — le jeu de mots quotidien",
  description:
    "Vindle : devine le mot du jour. Plusieurs modes, bilingue FR/EN, classement entre joueurs.",
  icons: { icon: "/heart.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      className={`${poppins.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
