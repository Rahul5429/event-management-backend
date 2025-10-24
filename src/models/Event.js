const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  category: { type: String, index: true },
  location: { type: String, index: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date },
  capacity: { type: Number, required: true },
  seatsLeft: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ensure seatsLeft is initialized same as capacity
EventSchema.pre('validate', function (next) {
  if (this.isNew && (this.seatsLeft === undefined || this.seatsLeft === null)) {
    this.seatsLeft = this.capacity;
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
