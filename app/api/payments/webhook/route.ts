import {NextResponse} from "next/server";
import crypto from "crypto";
import {adminDb} from "@/lib/supabase-admin";
export async function POST(req:Request){
 const raw=await req.text(),sig=req.headers.get("x-razorpay-signature")||"";
 const expected=crypto.createHmac("sha256",process.env.RAZORPAY_WEBHOOK_SECRET||"").update(raw).digest("hex");
 if(!sig||!process.env.RAZORPAY_WEBHOOK_SECRET||!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(sig)))return NextResponse.json({error:"Invalid webhook signature"},{status:400});
 try{const event=JSON.parse(raw);if(event.event==="payment.captured"){const pay=event.payload.payment.entity;const db=adminDb();const {data:p}=await db.from("payments").select("id,booking_id").eq("provider_order_id",pay.order_id).single();if(p){await db.from("payments").update({provider_payment_id:pay.id,status:"paid",verified_at:new Date().toISOString()}).eq("id",p.id);await db.from("bookings").update({payment_status:"paid",advance_paid_at:new Date().toISOString()}).eq("id",p.booking_id);}}return NextResponse.json({received:true});}catch{return NextResponse.json({error:"Webhook processing failed"},{status:500});}
}
