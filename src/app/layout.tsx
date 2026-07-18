import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = { title: { default:"SkillBridge — Learn from exceptional tutors", template:"%s · SkillBridge" }, description:"Discover trusted tutors and book focused one-to-one learning sessions." };
export default function RootLayout({ children }: Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Providers><SiteNav/><main>{children}</main><SiteFooter/></Providers></body></html>}
