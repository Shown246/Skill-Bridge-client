"use client";
import { useState } from "react";
import Link from "next/link";
import { BookOpen, Menu, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, clearAccessToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import type { Success, User } from "@/lib/types";
import { useRouter } from "next/navigation";

export function SiteNav() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const session = authClient.useSession();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Success<User>>("/api/v1/me", { auth: true }).then((r) => r.data),
    retry: false,
    enabled: Boolean(session.data),
  });
  const dashboard = me.data ? `/${me.data.role.toLowerCase()}` : "/login";

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <div className="nav">
          <Link href="/" className="brand" onClick={closeMenu}>
            <span className="brand-mark"><BookOpen size={21} /></span>
            SkillBridge
          </Link>
          <nav className="nav-links desktop-only" aria-label="Primary">
            <Link href="/tutors">Find tutors</Link>
            {session.isPending ? null : session.data && me.data ? (
              <>
                <Link href={dashboard}>Dashboard</Link>
                <button
                  className="button button-secondary"
                  onClick={async () => {
                    await authClient.signOut();
                    clearAccessToken();
                    queryClient.removeQueries({ queryKey: ["me"] });
                    router.push("/");
                    router.refresh();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Sign in</Link>
                <Link className="button" href="/register">Join free</Link>
              </>
            )}
          </nav>
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <Link href="/tutors" onClick={closeMenu}>Find tutors</Link>
            {session.isPending ? null : session.data && me.data ? (
              <>
                <Link href={dashboard} onClick={closeMenu}>Dashboard</Link>
                <button
                  className="button button-secondary"
                  style={{ width: "fit-content" }}
                  onClick={async () => {
                    closeMenu();
                    await authClient.signOut();
                    clearAccessToken();
                    queryClient.removeQueries({ queryKey: ["me"] });
                    router.push("/");
                    router.refresh();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", paddingTop: "0.25rem" }}>
                <Link href="/login" onClick={closeMenu} className="button button-secondary">Sign in</Link>
                <Link href="/register" onClick={closeMenu} className="button">Join free</Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
