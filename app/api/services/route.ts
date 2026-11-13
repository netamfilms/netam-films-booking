import {NextResponse} from "next/server";
import {adminDb} from "@/lib/supabase-admin";
import {defaultServices} from "@/lib/config";
export async function GET(){
 try{const {data,error}=await adminDb().from("services").select("*").eq("active",true).order("sort_order");if(error)throw error;return NextResponse.json({services:data?.length?data:defaultServices});}
 catch{return NextResponse.json({services:defaultServices});}
}
