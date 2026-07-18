"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Category, PaginatedSuccess, Tutor } from "@/lib/types";
import { EmptyState, ErrorState, Input, LinkButton, Select } from "./ui";
import { TutorCard } from "./tutor-card";

export function TutorSearch({categories}:{categories:Category[]}){
 const params=useSearchParams(),router=useRouter(),pathname=usePathname();
 const [query,setQuery]=useState(params.get("q")||"");
 useEffect(()=>setQuery(params.get("q")||""),[params]);
 const key=params.toString();
 const result=useQuery({queryKey:["tutors",key],queryFn:({signal})=>apiFetch<PaginatedSuccess<Tutor>>(`/api/v1/tutors?${key}`,{signal}),placeholderData:p=>p});
 const update=(name:string,value:string)=>{const p=new URLSearchParams(params.toString());if(value)p.set(name,value);else p.delete(name);if(name!=="page")p.delete("page");router.push(`${pathname}?${p}`)};
 useEffect(()=>{const id=setTimeout(()=>{if(query!==(params.get("q")||""))update("q",query)},400);return()=>clearTimeout(id)},[query]); // eslint-disable-line react-hooks/exhaustive-deps
 const page=Number(params.get("page")||1),total=result.data?.pagination.totalPages||1;
 const pages=useMemo(()=>Array.from({length:Math.min(total,5)},(_,i)=>Math.max(1,Math.min(page-2,total-4))+i).filter(n=>n<=total),[page,total]);
 return <><div className="filters"><label className="field"><span>Keyword</span><Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tutor name or skill"/></label><label className="field"><span>Subject</span><Select value={params.get("category")||""} onChange={e=>update("category",e.target.value)}><option value="">All subjects</option>{categories.map(c=><option value={c.slug} key={c.id}>{c.name}</option>)}</Select></label><label className="field"><span>Minimum rating</span><Select value={params.get("minRating")||""} onChange={e=>update("minRating",e.target.value)}><option value="">Any rating</option>{[4,3,2,1].map(n=><option value={n} key={n}>{n}+ stars</option>)}</Select></label><label className="field"><span>Max hourly rate</span><Input type="number" min="1" value={params.get("maxRate")||""} onChange={e=>update("maxRate",e.target.value)} placeholder="No maximum"/></label><label className="field"><span>Sort by</span><Select value={params.get("sort")||"recommended"} onChange={e=>update("sort",e.target.value)}><option value="recommended">Recommended</option><option value="rating_desc">Highest rated</option><option value="reviews_desc">Most reviewed</option><option value="price_asc">Lowest price</option><option value="price_desc">Highest price</option></Select></label></div>
 {key&&<div style={{marginBottom:"1rem"}}><LinkButton className="button-secondary" href="/tutors">Clear all filters</LinkButton></div>}
 {result.isPending?<div className="grid-3" aria-live="polite">{[1,2,3].map(n=><div className="card" key={n}>Loading tutor…</div>)}</div>:result.isError?<ErrorState error={result.error} retry={()=>result.refetch()}/>:!result.data.data.length?<EmptyState title="No tutors match"><span>Try removing a filter or searching for a broader subject.</span></EmptyState>:<><p className="muted" aria-live="polite">{result.data.pagination.totalItems} tutor{result.data.pagination.totalItems===1?"":"s"} found</p><div className="grid-3">{result.data.data.map(t=><TutorCard tutor={t} key={t.id}/>)}</div><nav className="pagination" aria-label="Tutor results pages"><button className="button button-secondary" disabled={page<=1} onClick={()=>update("page",String(page-1))}>Previous</button>{pages.map(n=><button key={n} aria-current={n===page?"page":undefined} className={n===page?"button":"button button-secondary"} onClick={()=>update("page",String(n))}>{n}</button>)}<button className="button button-secondary" disabled={page>=total} onClick={()=>update("page",String(page+1))}>Next</button></nav></>}
 </>
}
