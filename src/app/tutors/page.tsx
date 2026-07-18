import type { Metadata } from "next";
import { Suspense } from "react";
import { TutorSearch } from "@/components/tutor-search";
import { env } from "@/lib/env";
import type { Category, Success } from "@/lib/types";
export const metadata:Metadata={title:"Find a tutor",description:"Search approved SkillBridge tutors by subject, rating, and hourly rate."};
async function categories(){try{const r=await fetch(`${env.apiBaseUrl}/api/v1/categories`,{next:{revalidate:300}});return r.ok?((await r.json()) as Success<Category[]>).data:[]}catch{return[]}}
export default async function TutorsPage(){return <div className="container"><header className="page-head"><span className="eyebrow">Tutor marketplace</span><h1>Find your learning match</h1><p className="muted">Every visible profile is active and approved by SkillBridge.</p></header><Suspense fallback={<p>Loading filters…</p>}><TutorSearch categories={await categories()}/></Suspense></div>}
