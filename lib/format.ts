export const money=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n||0);
export function estimate(items:any[],days:number,quantities:any) {
  return items.reduce((sum,s)=>{
    if(s.kind==="quote") return sum;
    const qty=s.kind==="quantity_days" ? (quantities.cameraUnits||0)*days :
      s.kind==="days" ? (quantities[s.key]||0) :
      s.kind==="quantity" ? (quantities.photoSheets||0) : 0;
    return sum+(Number(s.price)*qty);
  },0);
}
