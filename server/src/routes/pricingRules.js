import express from "express";
import mongoose from "mongoose";
import PricingRule from "../models/PricingRule.js";
import PricingRuleVersion from "../models/PricingRuleVersion.js";
import Event from "../models/Event.js";
import { ruleSchema } from "../validators/pricingRule";

const router = express.Router({mergeParams: true});
async function loadevent(req,res,next){
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({message: " event not found"});
  if(STring(event.organizer)!== String(req.user._id))
    return res.status(403).json({message: "  not your event"});
  req.event = event;
  next();
}

function checkAgainstEvent(rule,event){
  const prices = (event.tiers || []).map((t) => t.price );
  if (!prices.length) return null;
  const min = Math.min(...prices);
  if (rule.effect.type === "FLAT" && rule.effect.value >min)
    return "flat discount "
  return null;
}

const snap = (doc) => {
  const o = doc.toObject();
  delete o._v;
  return o;
};
//create
router.post("/", loadevent,async(req,res,next)=> {
  const parsed = ruleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({errors: parsed.error.flatten()});
  const err = checkAgainstEvent(parsed.data,req.event);
  if (err) return res.status(400).json({message: err});

  const session = await mongoose.startSession();
  try{
    let rule;
    await session.withTransaction(async () => {
      [rule] = await PricingRule.create(
        [{...parsed.data,eventId: req.event._id,createdBy: req.user._id, currentVersion : 1}],
        {session}
      );
      await PriceRuleVersion.create(
        [{...parsed.data,eventId: req.event.id,createdBy: req.user._id, currentVersion : 1}],
        {session}
      );

    });
res.status(201).json(rule);
  }catch(e) {next(e);} finally {session.endSession();}
});


router.get("/",loadevent,async(req,res) => {
  res.json(await PricingRule.find({eventId: req.event._id}).sort({priority: 1}));

});

router.put("/:ruleId",loadevent,async (req,res,next) => {

  const parsed = ruleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({errors: parsed.error.flatten()});
const err = checkAgainstEvent(parsed.data,req.event);
if (err) return res.status(400).json({message: err});

const session = await mongoose.startSession();
try{
  let rule;
  await session.withTransaction(async ()=>{
  rule = await PricingRule.findOne({_id:req.params.ruleId,eventId: req.event._id}).session(session);
  if(!rule) throw Object.assign(new Error("Rule not found"), {status:404});
  rule.set(parsed.data);
  rule.currentVersion +=1;
  await rule.save({session});
  await PricingRuleVersion.ceate(
    [{ruleId: rule._id, version: rule.currentVersion, snapshot: snap(rule), changedBy: req.user._id}],
    {session}

  );
});
res.json(rule);
} catch(e){
  if(e.status) return res.status(e.status).json({message: e.message});
  next(e);
}finally{session.endSession();}

});

router.patch("/:ruleId/toggle", loadevent,async(req,res,next)=> {
  const session = await mongoose.startSession();
  try{
    let rule;
    await session.withTransaction(async () => {
      rule = await PricingRule.findOne({_id: req.params.ruleId,eventId: req.event._id}).session(session);
      if (!rule) throw Object.assign(new Error("Rule not found"), {status: 404});
      rule.active = !rule.active;
      rule.currentVersion += 1;
      await PricingRuleVersion.create(
        [{ruleId : rule._id,version : rule.currentVersion,snapshot:snap(rule),changedBy: req.user._id}],
        {session}
      );
    });
    res.json(rule);

  }catch(e){
    if(e.status) return res.status(e.status).json({message: e.message});
    next(e);

  }finally{session.endSession();}
});

router.get("/:ruleId/versions", loadevent, async(req,res) =>{
  res.json(await PricingRuleVersion.find({ruleId: req.params.ruleId}).sort({version : -1}));

})

export default router;

