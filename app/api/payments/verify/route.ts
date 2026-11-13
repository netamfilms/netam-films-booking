import {NextResponse} from "next/server";
import crypto from "crypto";
import {adminDb} from "@/lib/supabase-admin";
export async function POST(req:Request){
 try{
  const {razorpay_order_id,razorpay_payment_id,razorpay_signature,bookingId}=await req.json();
  if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature||!bookingId)return NextResponse.json({error:"Payment details incomplete"},{status:400});
  const expected=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET||"").update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
  if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(razorpay_signature)))return NextResponse.json({error:"Payment signature verification failed"},{status:400});
  const db=adminDb();const {data:p}=await db.from("payments").select("id,booking_id,status").eq("provider_order_id",razorpay_order_id).single();
  if(!p||p.booking_id!==bookingId)return NextResponse.json({error:"Payment order does not match booking"},{status:400});
  await db.from("payments").update({provider_payment_id:razorpay_payment_id,status:"paid",verified_at:new Date().toISOString()}).eq("id",p.id);
  await db.from("bookings").update({payment_status:"paid",advance_paid_at:new Date().toISOString()}).eq("id",bookingId);
  return NextResponse.json({verified:true});
 }catch(e){console.error(e);return NextResponse.json({error:"Could not verify payment"},{status:500});}
}
