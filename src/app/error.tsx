"use client";
import { ErrorState } from "@/components/ui";
export default function ErrorPage({error,reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="container section"><ErrorState error={error} retry={reset}/></div>}
