import express from "express";
import { getQuote } from "../services/pricingQuote.js";

const router = express.Router();

router.post("/quote",async (req,res) =>{
  try{
    const{eventId,seats} = req.body;
    if(!eventId || !Array.isArray(seats) || !seats.length)
      return res.status(400).json({message: "eventId aur seats chahiye"});
    res.json(await getQuote(eventId,seats));
  } catch(e){
    res.status(e.status || 400).json({message: e.message});

  }
});

export default router;