import type { ReactNode } from "react";
import { FooterBlock } from "@/components/uitripled/footer-block-shadcnui";
import { Header } from "./components/Header";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <FooterBlock />
    </div>
  );
}
