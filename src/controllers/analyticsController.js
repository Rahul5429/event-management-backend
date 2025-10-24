const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const mongoose = require('mongoose');

/**
 * Returns:
 * - totalUsers
 * - totalEvents
 * - registrationsPerDay (last 7 or provided range)
 * - mostPopularEvent
 * - activeUsersLast7Days
 */
exports.getOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();

    // registrations per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const registrationsPerDay = await Registration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // most popular event (by registrations total)
    const popular = await Registration.aggregate([
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    let mostPopularEvent = null;
    if (popular.length) {
      mostPopularEvent = await Event.findById(popular[0]._id).lean();
      mostPopularEvent.registrations = popular[0].count;
    }

    // active users last 7 days (users who registered or logged in? we use registrations)
    const activeUsers = await Registration.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$user', lastActive: { $max: '$createdAt' } } },
      { $count: 'activeUsers' }
    ]);
    const activeUsersCount = (activeUsers[0] && activeUsers[0].activeUsers) || 0;

    res.json({
      totalUsers,
      totalEvents,
      registrationsPerDay,
      mostPopularEvent,
      activeUsersLast7Days: activeUsersCount
    });
  } catch (err) {
    next(err);
  }
};
