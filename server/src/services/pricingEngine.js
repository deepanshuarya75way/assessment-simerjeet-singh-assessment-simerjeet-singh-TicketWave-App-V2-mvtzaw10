const DAY_MS = 24*60*60*1000;

function inRange(val,min,max){
  if(min != null && val < min) return false;
  if(max != null && val > max) return false;
}

function eligibleSeats(rule,ctx){
  const {seats, now,eventStart} = ctx;
  const c = rule.conditions || {};

  if(c.dataRange?.from && now < new Date(c.dateRange.from)) return null;
    if(c.dataRange?.to && now > new Date(c.dateRange.to)) return null;

    const advanceDays = Math.floor((new Date(eventStart)- now/ DAY_MS));
    if(!inRange(advanceDays, c.advanceDays?.min,c.advanceDays?.max)) return null;
    if(!inRange(seats.length,c.qty?.min, c.qty?.max)) return null;
    
    const tiers = c.seattiers || [];
    const list = tiers.length ? seats.filter(s => tiers.includes(s.tier)) : seats;
    return list.length ? list : null;



}

function discount(rule,list){
  const base = list.reduce((sum,s) => sum + s.price, 0);
  const {type, value} = rule.effect;
  if( type === 'PERCENT') return Math.round((base*value) / 100 );
  if( type === 'FLAT') return value * list.length;
  if( type === 'FIXED_PRICE') return Math.max(0,base - value * list.length);
  return 0;
}

export function computePrice({seats,rules,eventStart,now = new date()}) {
  const basePrice = seats.reduce((sum,s) => sum + s.price, 0);
  const ctx = {seats, now, eventStart};

  const ordered = rules
  .filter(r => r.active)
  .sort((a,b) =>
    a.priority - b.priority ||
  new Date(a.createdAt) - new Date(b.createdAt) ||
  String(a._id.localeCompare(String(b._id))
));

const lines = [];
let total = basePrice;

for(const rule of ordered){
  const list = eligibleSeats(rule,ctx);
  if(!list) continue;

  let discount = discountFor(rule,list);
  discount = Math.min(discount,total);
  if(discount <= 0)continue;

  lines.push({
    ruleId: rule_Id,
    ruleVersion: rule.currentVersion,
    label: rule.name,
    amount: -discount,
  });
  total -= discount;

  if (!rule.stackable)break;
}
return {currency: 'INR',basePrice,lines,total};

}