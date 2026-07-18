import{AdminBookingDetail}from"@/components/admin-booking-detail";export default async function Page({params}:{params:Promise<{id:string}>}){return <AdminBookingDetail id={(await params).id}/>}
