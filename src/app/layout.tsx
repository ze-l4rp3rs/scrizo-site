import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

// Applied by the server so the stored theme is present before first paint.
// React only warns about <script> in client-rendered components; this one is
// static markup rendered once as part of the document.
const themeBootstrap =
  "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')return;var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t);r.style.colorScheme=t;}catch(e){}})();";

export const metadata: Metadata = {
  title: "Company Brain — AI agent for how the company works",
  description:
    "Chat across People, Teams, Projects, Documents, and Decisions with visible proof.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-full flex flex-col font-sans`}
      >
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeBootstrap }}
        />
        <ThemeProvider disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
