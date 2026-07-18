import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const cx = (...values: (string | false | null | undefined)[]) => values.filter(Boolean).join(" ");
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cx("button", className)} {...props} /> }
export function LinkButton({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) { return <Link href={href} className={cx("button", className)}>{children}</Link> }
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cx("input", className)} {...props} /> }
export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) { return <select className={cx("input", className)} {...props} /> }
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cx("input min-h-28", className)} {...props} /> }
export function Field({ label, error, children, hint }: { label: string; error?: string; children: React.ReactNode; hint?: string }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}{error && <small className="error" role="alert">{error}</small>}</label> }
export function EmptyState({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) { return <div className="empty"><h3>{title}</h3><p>{children}</p>{action}</div> }
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) { const message = error instanceof Error ? error.message : "Something went wrong."; return <div className="error-box" role="alert"><strong>We couldn’t load this.</strong><p>{message}</p>{retry && <Button onClick={retry}>Try again</Button>}</div> }
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) { return <span className={`badge badge-${tone}`}>{children}</span> }
export function Avatar({ name, image }: { name: string; image?: string | null }) { return image ? <img className="avatar" src={image} alt={`${name}'s avatar`} /> : <span className="avatar avatar-fallback" aria-hidden>{name.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</span> }
