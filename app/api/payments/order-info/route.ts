import {NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase-admin";
export async function GET(req:Request){
 try{const order=new URL(req.url).searchParams.get("order");if(!order)return NextResponse.json({error:"Order required"},{status:400});
 const db=adminDb();const {data:p}=await db.from("payments").select("booking_id,amount,provider_order_id").eq("provider_order_id",order).single();if(!p)return NextResponse.json({error:"Order not found"},{status:404});
 const {data:b}=await db.from("bookings").select("customer_name,phone").eq("id",p.booking_id).single();
 return NextResponse.json({orderId:order,amount:p.amount*100,keyId:process.env.RAZORPAY_KEY_ID,customerName:b?.customer_name,phone:b?.phone});
 }catch{return NextResponse.json({error:"Unable to load order"},{status:500});}
}
