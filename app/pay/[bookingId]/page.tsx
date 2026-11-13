"use client";
import {useEffect,useState} from "react";
import Script from "next/script";
import {useParams,useSearchParams} from "next/navigation";
export default function PayPage(){
 const params=useParams();const search=useSearchParams();const [info,setInfo]=useState<any>(null);const [msg,setMsg]=useState("Preparing secure payment...");
 useEffect(()=>{fetch("/api/payments/order-info?order="+encodeURIComponent(search.get("order")||"")).then(r=>r.json()).then(setInfo).catch(()=>setMsg("Unable to load payment details."));},[search]);
 async function pay(){if(!info||!(window as any).Razorpay)return;const rz=new (window as any).Razorpay({key:info.keyId,amount:info.amount,currency:"INR",name:"NETAM FILMS",description:"Booking advance",order_id:info.orderId,handler:async(response:any)=>{const r=await fetch("/api/payments/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...response,bookingId:params.bookingId})});const d=await r.json();setMsg(r.ok?"Payment verified. The studio will review and confirm your booking.":d.error||"Verification failed.");},prefill:{name:info.customerName,contact:info.phone},theme:{color:"#b58a42"}});rz.open();}
 return <main style={{maxWidth:520,margin:"10vh auto",padding:24,textAlign:"center"}}><Script src="https://checkout.razorpay.com/v1/checkout.js"/><div style={{fontFamily:"serif",fontSize:30}}>NETAM FILMS</div><h2>Secure advance payment</h2><p>{msg}</p>{info&&<><p>Booking advance: <b>₹{info.amount/100}</b></p><button className="btn gold" onClick={pay}>PAY ADVANCE SECURELY</button></>}</main>
}
