"use client";
import {useState} from "react";
import {createBrowserClient} from "@supabase/ssr";
export default function Login(){
 const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");
 async function go(e:any){e.preventDefault();const sb=createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);const {error}=await sb.auth.signInWithPassword({email,password});if(error)setError(error.message);else location.href="/admin";}
 return <main style={{maxWidth:420,margin:"12vh auto",padding:25}}><h1 className="serif">NETAM FILMS</h1><h2>Admin Login</h2><form onSubmit={go} className="panel"><div className="field"><label>ADMIN EMAIL</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field" style={{marginTop:15}}><label>PASSWORD</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>{error&&<p className="error">{error}</p>}<button className="btn gold" style={{width:"100%",marginTop:20}}>SIGN IN</button></form></main>
}
