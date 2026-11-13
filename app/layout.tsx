import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"NETAM FILMS | Wedding & Event Photography",description:"Book professional wedding photography, cinematic films, drone shoots and event coverage in Wadrafnagar, Chhattisgarh."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
