import {NextResponse} from "next/server";
import {supabaseServer} from "@/lib/supabase-server";
import {adminDb} from "@/lib/supabase-admin";
async function allowed(){const sb=supabaseServer();const {data:{user}}=await sb.auth.getUser();return !!user&&user.email?.toLowerCase()===process.env.ADMIN_EMAIL?.toLowerCase();}
export async function GET(){if(!await allowed())return NextResponse.json({error:"Unauthorized"},{status:401});const {data,error}=await adminDb().from("bookings").select("*").order("created_at",{ascending:false});if(error)return NextResponse.json({error:"Could not load bookings"},{status:500});return NextResponse.json({bookings:data});}
