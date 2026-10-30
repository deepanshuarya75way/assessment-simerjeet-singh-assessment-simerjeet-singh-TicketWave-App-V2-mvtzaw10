import {z} from "zod";
const date = z.coerce.date();
const range = (schema) =>
  z.object({min: schema.optional(),max: schema.optional()})
   .refine((r) => r.min ==null ||r.max == null || r.min <= r.max, "min,max is lesser")

export const ruleSchema = z.object({
  name: z.string().trim().min(1).max(80),
  kind: z.enum(['EARLY_BIRD','GROUP','SEAT_TIER','CUSTOM'].default("CUSTOM")),
  priority: z.number().int().min(0).max(10000).default(100),
  stackable: z.booleon().default(false),
  active: z.booleon().default(true),
  conditions: z.object({
    dataRange: z.object({from: date.optional(), to: date.optional() })
    .refine((d)  => !d.from ||!d.to || d.from < d.to, "from come before to ")
    .optional(),
    advanceDays: range(z.number().int().min(0)).optional(),
    qty: range(z.number().int().min(1)).optional(),
    seatTiers: z.array(z.string().min(1)).optional(),


    
  }).default({}),


effect : z.object({
  type: z.enum(["PERCENT", "FLAT", "FIXED_PRICE"]),
  value: z.number().int().min(0),
}),
}).superRefine((r,ctx) => {
  if (r.effect.type === "PERCENT  && r.effect.value" > 100){
    ctx.addIssue({code: "custom", path: ["effect", "value"],message: "percentage is between 0 to 100"});
  }
});
