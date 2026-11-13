import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase-server";
import {adminDb} from "@/lib/supabase-admin";
async function allowed(){const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser();return !!user&&user.email?.toLowerCase()===process.env.ADMIN_EMAIL?.toLowerCase();}
export async function GET(){if(!await allowed())return NextResponse.json({error:"Unauthorized"},{status:401});const {data}=await adminDb().from("services").select("*").order("sort_order");return NextResponse.json({services:data||[]});}
export async function PATCH(req:Request){if(!await allowed())return NextResponse.json({error:"Unauthorized"},{status:401});const {key,price,active}=await req.json();if(!key||!Number.isFinite(Number(price))||Number(price)<0)return NextResponse.json({error:"Invalid service price"},{status:400});const {error}=await adminDb().from("services").update({price:Number(price),active:!!active}).eq("key",key);if(error)return NextResponse.json({error:"Update failed"},{status:400});return NextResponse.json({ok:true});}
