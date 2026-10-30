import PricingRule from "../models/PricingRule.js";
import Event from "../models/Event.js";
import { computePrice } from "./pricingEngine";

function buildSeats(event,seats){
  return seats.map(({section,seatNumber})=> {
  const sec = event.seatSections.find((s) => s.name === section);
  if(!sec) throw new Error(`section ${section} does not exist in this event`);
  return{
    seatId: `${section} - ${seatNumber}`,
    tier: sec.name,
    price: Math.round(sec.price * 100),

  };
 } );
}

export async function getQuote(eventId,seats,event = null){
  const ev = event?(event.toObject?.()?? event): await Event.findById(eventId).lean();

  if(!ev) throw new Error("Event not found");

  const rules = await PricingRule.find({eventId,active: true}).lean();
  return computePrice({seats: buildSeats(ev,seats),rules,eventStart: ev.date});
}