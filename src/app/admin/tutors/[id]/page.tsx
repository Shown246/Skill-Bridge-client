import{AdminTutorDetail}from"@/components/admin-tutor-detail";export default async function Page({params}:{params:Promise<{id:string}>}){return <AdminTutorDetail id={(await params).id}/>}
