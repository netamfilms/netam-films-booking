import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase-server";
import {adminDb} from "@/lib/supabase-admin";
export async function PATCH(req:Request,{params}:{params:{id:string}}){
 const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser();if(!user||user.email?.toLowerCase()!==process.env.ADMIN_EMAIL?.toLowerCase())return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await req.json();const db=adminDb();
 if(body.booking_status==="confirmed"){
  const {data,error}=await db.rpc("confirm_booking",{booking_id:params.id});
  if(error)return NextResponse.json({error:error.message.includes("DATE_CONFLICT")?"Date conflict: another confirmed booking already uses this date range.":"Could not confirm booking."},{status:409});
  if(body.payment_status!==undefined)await db.from("bookings").update({payment_status:body.payment_status}).eq("id",params.id);
  return NextResponse.json({booking:data});
 }
 const allowed:any={};for(const k of ["booking_status","payment_status"])if(body[k]!==undefined)allowed[k]=body[k];
 const {data,error}=await db.from("bookings").update(allowed).eq("id",params.id).select().single();if(error)return NextResponse.json({error:"Could not update booking"},{status:400});return NextResponse.json({booking:data});
}
