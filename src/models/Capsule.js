import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  preview:     { type: String, required: true },  
  message:     { type: String },                  
  timestamp:   { type: Date, default: Date.now },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  }
});

capsuleSchema.index({ location: '2dsphere' });

export default mongoose.model('Capsule', capsuleSchema);
