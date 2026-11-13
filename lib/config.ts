export const business = {
  name: "NETAM FILMS",
  address: "Mendhari, Wadrafnagar, Chhattisgarh, India",
  phone: "8817578863",
  whatsapp: process.env.BUSINESS_WHATSAPP || "918817578863",
};
export const defaultServices = [
  {key:"photography",name:"Photography / Camera Unit",unit:"per unit / day",price:3000,kind:"quantity_days"},
  {key:"cinematic",name:"Cinematic Video (15-minute film)",unit:"per day",price:4000,kind:"days"},
  {key:"traditional",name:"Traditional Video",unit:"price on request",price:0,kind:"quote"},
  {key:"drone",name:"Drone Shooting",unit:"per day",price:4000,kind:"days"},
  {key:"editing",name:"Video Mixing / Editing",unit:"market-based",price:0,kind:"quote"},
  {key:"photo_sheet",name:"Photo Sheet",unit:"per sheet",price:120,kind:"quantity"},
] as const;
export const eventTypes = ["Wedding","Engagement","Haldi","Mehndi","Birthday","Anniversary","Reception","Other"];
