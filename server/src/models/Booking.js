import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    seats: {
      type: [
        {
          section: {
            type: String,
            required: true
          },
          seatNumber: {
            type: Number,
            required: true
          }
        }
      ],
      validate: [
        (val) => val.length > 0,
        'At least one seat must be selected'
      ]
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    qrCode: {
      type: String
    },
    priceBreakdown: {
    currency: {type:String,default: 'INR'},
    basePrice: {type: Number},
    lines: [{
      _id: false,
      ruleId: {type: mongoose.Schema.Types.ObjectId},
      ruleVersion: Number,
      label: String,
      amount: Number,
    }],
    total:{type: Number},

  },
  },
  {
    timestamps: true
  },
  
);

// Indexes for query performance
BookingSchema.index({ user: 1 });
BookingSchema.index({ event: 1 });
BookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', BookingSchema);

export default Booking;
