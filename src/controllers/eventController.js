const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const Queue = require('../services/queue').emailQueue;
const mongoose = require('mongoose');

const DEFAULT_PAGE_SIZE = 10;

/**
 * List events with search, filter, sort & pagination (no caching)
 */
exports.listEvents = async (req, res, next) => {
  try {
    const { page = 1, size = DEFAULT_PAGE_SIZE, q, category, location, organizer, sortBy = 'startDate', order = 'asc' } = req.query;
    const skip = (Math.max(1, page) - 1) * size;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (organizer) filter.organizer = organizer;

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [items, total] = await Promise.all([
      Event.find(filter).sort(sort).skip(skip).limit(parseInt(size)).lean().exec(),
      Event.countDocuments(filter)
    ]);

    res.json({ page: Number(page), size: Number(size), total, items });
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email').lean();
    if (!event) return res.status(404).json({ message: 'Not found' });
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.organizer = req.user.id;
    const event = new Event(payload);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(event, req.body);
    if (event.seatsLeft > event.capacity) event.seatsLeft = event.capacity;
    await event.save();
    res.json(event);
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'organizer' && event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await event.remove();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.registerForEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const existing = await Registration.findOne({ event: eventId, user: userId }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'Already registered' });
    }

    const event = await Event.findOneAndUpdate(
      { _id: eventId, seatsLeft: { $gt: 0 } },
      { $inc: { seatsLeft: -1 } },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No seats available' });
    }

    const reg = new Registration({ event: eventId, user: userId });
    await reg.save({ session });

    const notif = new Notification({
      user: userId,
      type: 'registration',
      payload: { eventId, title: event.title }
    });
    await notif.save({ session });

    await Queue.add('sendRegistrationEmail', {
      toUserId: userId,
      email: req.user.email,
      event: { id: event._id, title: event.title, startDate: event.startDate }
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Registered', registrationId: reg._id });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

exports.unregisterFromEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const reg = await Registration.findOneAndDelete({ event: eventId, user: userId }).session(session);
    if (!reg) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Registration not found' });
    }

    await Event.findByIdAndUpdate(eventId, { $inc: { seatsLeft: 1 } }, { session });

    const notif = new Notification({
      user: userId,
      type: 'unregistration',
      payload: { eventId }
    });
    await notif.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Unregistered' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};
