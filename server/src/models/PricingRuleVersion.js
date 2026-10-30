import mongoose from 'mongoose';
const {Schema} = mongoose;

const versionSchema = new Schema({
  ruleId: {type:Schema.Types.ObjectId, ref: 'PricingRule', required :true},
  version: {type: Number,required :true},
  snapshot: {type: Schema.Types.Mixed,required: 'true' },
  
  changedBy: {type  : Schema.Types.ObjectId, ref: 'User'},


}, {timestamps: {createdAt: true,updatedAt: 'false'}});

versionSchema.index({ruleId: 1,version: 1, },{unique: true});

['updateOne','UpdateMany','findOneAndUpdate','deleteOne','deleteMany','findOneAndDelete'].forEach(op => versionSchema.pre(op,() =>{throw new Error('PricingRuleVersion is immutable');}));
module.exports = mongoose.model('PricingRuleVersion', versionSchema);