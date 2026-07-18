import { BookingDetail } from "@/components/booking-detail";export default async function Page({params}:{params:Promise<{id:string}>}){return <BookingDetail id={(await params).id} role="student"/>}
