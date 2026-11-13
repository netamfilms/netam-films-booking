import {NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase-admin";
import {defaultServices} from "@/lib/config";
import {estimate} from "@/lib/format";
export async function POST(req:Request){
 try{
  const b=await req.json();
  if(!b.name||!b.phone||! /^[6-9]\d{9}$/.test(b.phone)||!b.date||!b.venue||!Array.isArray(b.selected)||!b.selected.length) return NextResponse.json({error:"Please complete all required fields."},{status:400});
  if(new Date(b.date+"T00:00:00")<new Date(new Date().toISOString().slice(0,10)+"T00:00:00"))return NextResponse.json({error:"Event date cannot be in the past."},{status:400});
  const db=adminDb();
  const {data:serviceRows}=await db.from("services").select("*").eq("active",true);
  const catalog=serviceRows?.length?serviceRows:defaultServices;
  const selected=catalog.filter((s:any)=>b.selected.includes(s.key));
  if(selected.length!==b.selected.length)return NextResponse.json({error:"One or more selected services are unavailable."},{status:400});
  const days=Math.max(1,Math.min(30,Number(b.days)||1));
  const quantities={cameraUnits:Math.max(0,Number(b.cameraUnits)||0),cinematic:Math.max(0,Number(b.cinematic)||0),drone:Math.max(0,Number(b.drone)||0),photoSheets:Math.max(0,Number(b.photoSheets)||0)};
  const total=estimate(selected,days,quantities),advance=Math.round(total*.3);
  const payload={customer_name:String(b.name).slice(0,120),phone:b.phone,event_date:b.date,event_type:String(b.eventType||"Other"),photographers:Number(b.photographers)||0,videographers:Number(b.videographers)||0,camera_units:quantities.cameraUnits,event_days:days,selected_services:selected.map((s:any)=>({key:s.key,name:s.name,price:s.price,kind:s.kind})),cinematic_days:quantities.cinematic,drone_days:quantities.drone,photo_sheets:quantities.photoSheets,schedule:String(b.schedule||"").slice(0,5000),venue:String(b.venue).slice(0,2000),requirements:String(b.requirements||"").slice(0,3000),estimate_total:total,advance_due:advance,balance_due:total-advance,payment_method:b.paymentMethod==="cash"?"cash":"upi",booking_status:"pending_review",payment_status:"advance_pending"};
  const {data,error}=await db.from("bookings").insert(payload).select("id").single();if(error)throw error;
  return NextResponse.json({booking:{id:data.id},estimate:total,advance},{status:201});
 }catch(e:any){console.error(e);return NextResponse.json({error:"Could not save booking. Please contact the studio on WhatsApp."},{status:500});}
}
