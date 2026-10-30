import mongoose from 'mongoose';
const {Schema} = mongoose;

const conditionsSchema = new Schema({
  dataRange: { from: Date, to: Date},
  advanceDays: {min: {type: Number, min:0},max:{type: Number, min : 0} },
  qty: {min: {type: Number, min: 1},max:{type: Number, min : 1} },
  seatTiers: [String],

},{_id: false} );

const effectSchema = new Schema ({
  type: {type: String,enum: ['PERCENT', 'FLAT', 'FIXED_PRICE'], required: true},
  value: {type: Number,required: true,min:0},

},{_id: false});

const pricingRuleSchema = new Schema({
  eventId: {type:Schema.Types.ObjectId, ref: 'Event', required :true},
  name: {type: String,required :true,trim :true},
  kind: {type: String,enum:['EARLY_BIRD','GROUP','SEAT_TIER','CUSTOM'],default: 'CUSTOM'},
  priority: {type: Number,default:'100'},
  stackable:{type: Boolean , default:'false'},
  active: {type: Booleon, default:'true'},
  conditions: {type: conditionsSchema, default: () =>({})},
  effect: {type: effectSchema, required: 'true'},
  currentVersion: {type: Number ,default: 1},
  createdBy: {type  : Schema.Types.ObjectId, ref: 'User',required: true},

}, {timestamps: true});

pricingRuleSchema.index({eventId: 1,active: 1,priority: 1});

module.exports = mongoose.model('PricingRule', pricingRuleSchema);