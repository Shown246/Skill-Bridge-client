"use client";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, clearAccessToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Success, User } from "@/lib/types";
import { useRouter } from "next/navigation";

export function SiteNav() {
  const router = useRouter();
  const session = authClient.useSession();
  const me = useQuery({ queryKey:["me"], queryFn:() => apiFetch<Success<User>>("/api/v1/me", { auth:true }).then(r=>r.data), retry:false, enabled:Boolean(session.data) });
  const dashboard = me.data ? `/${me.data.role.toLowerCase()}` : "/login";
  return <header className="site-header"><div className="container nav">
    <Link href="/" className="brand"><span className="brand-mark"><BookOpen size={21}/></span>SkillBridge</Link>
    <nav className="nav-links" aria-label="Primary">
      <Link href="/tutors" className="optional">Find tutors</Link>
      {me.data ? <><Link href={dashboard}>Dashboard</Link><button className="button button-secondary" onClick={async()=>{ await authClient.signOut(); clearAccessToken(); router.push("/"); router.refresh(); }}>Sign out</button></> : <><Link href="/login">Sign in</Link><Link className="button" href="/register">Join free</Link></>}
    </nav>
  </div></header>;
}
