import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});
export const metadata = {
    title: "Sistem RAB Kontraktor",
    description: "Susun RAB proyek konstruksi berbasis AHSP, dengan rekomendasi AI dan export PDF.",
};
export default function RootLayout({ children }) {
    return (<html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 font-sans text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>);
}
