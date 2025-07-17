const mongoose = require('mongoose');

const userChatStatsSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  chatCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('UserChatStats', userChatStatsSchema);
