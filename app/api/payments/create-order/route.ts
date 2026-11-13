import {NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase-admin";
import {razorpayClient} from "@/lib/razorpay";
export async function POST(req:Request){
 try{
  const {bookingId}=await req.json();if(!bookingId)return NextResponse.json({error:"Booking ID required"},{status:400});
  const db=adminDb();const {data:b,error}=await db.from("bookings").select("id,advance_due,payment_status,booking_status").eq("id",bookingId).single();
  if(error||!b)return NextResponse.json({error:"Booking not found"},{status:404});
  if(b.payment_status==="paid")return NextResponse.json({error:"Advance already paid"},{status:409});
  if(!b.advance_due)return NextResponse.json({error:"No advance amount is due"},{status:400});
  const order=await razorpayClient().orders.create({amount:b.advance_due*100,currency:"INR",receipt:String(b.id).slice(0,40),notes:{booking_id:b.id}});
  await db.from("payments").insert({booking_id:b.id,provider:"razorpay",provider_order_id:order.id,amount:b.advance_due,status:"created"});
  const base=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin;
  const url=`${base}/pay/${encodeURIComponent(b.id)}?order=${encodeURIComponent(order.id)}`;
  return NextResponse.json({checkoutUrl:url,orderId:order.id});
 }catch(e){console.error(e);return NextResponse.json({error:"Online payment is temporarily unavailable. Please contact the studio."},{status:503});}
}
