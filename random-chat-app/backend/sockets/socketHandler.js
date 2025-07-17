const users = new Map(); // socket.id -> { username, sentiment, partnerId }
const sentimentAnalyzer = require('../utils/sentimentAnalyzer'); // Adjusted path

module.exports = (io, socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // JOIN with mood input
  socket.on('join', async ({ username, moodSentence }) => {
    const sentiment = sentimentAnalyzer(moodSentence); // 'positive' / 'neutral' / 'negative'
    console.log(`🧠 ${username}'s mood: ${moodSentence} ➡ ${sentiment}`);

    users.set(socket.id, { username, sentiment, partnerId: null });

    let partnerSocketId = null;

    for (let [id, user] of users.entries()) {
      if (
        id !== socket.id &&
        user.partnerId === null &&
        user.sentiment === sentiment
      ) {
        partnerSocketId = id;
        break;
      }
    }

    if (partnerSocketId) {
      users.get(socket.id).partnerId = partnerSocketId;
      users.get(partnerSocketId).partnerId = socket.id;

      const you = users.get(socket.id).username;
      const partner = users.get(partnerSocketId).username;

      io.to(socket.id).emit('status', `✅ Connected to ${partner}`);
      io.to(partnerSocketId).emit('status', `✅ Connected to ${you}`);
      io.to(socket.id).emit('partnerName', partner);
      io.to(partnerSocketId).emit('partnerName', you);

      console.log(`🔗 Matched: ${you} <--> ${partner}`);
    } else {
      io.to(socket.id).emit('status', '⌛ Waiting for someone who feels like you...');
    }
  });

  // MESSAGE
  socket.on('sendMessage', (msg) => {
    const user = users.get(socket.id);
    if (!user || !user.partnerId) {
      console.warn('❌ Cannot send message, no partner.', socket.id);
      return;
    }

    const partnerId = user.partnerId;
    const messageData = {
      sender: user.username,
      content: msg,
    };

    socket.emit('receiveMessage', messageData);
    io.to(partnerId).emit('receiveMessage', messageData);

    console.log(`📨 ${user.username} ➡ ${users.get(partnerId)?.username || 'Unknown'}: ${msg}`);
  });

  // TYPING
  socket.on('typing', () => {
    const partnerId = users.get(socket.id)?.partnerId;
    if (partnerId) {
      io.to(partnerId).emit('partnerTyping');
    }
  });

  // SKIP
  socket.on('skipChat', () => {
    const user = users.get(socket.id);
    if (user) {
      const partnerId = user.partnerId;
      if (partnerId && users.has(partnerId)) {
        users.get(partnerId).partnerId = null;
        io.to(partnerId).emit('status', '❌ Stranger skipped the chat.');
        io.to(partnerId).emit('partnerName', '');
      }

      users.set(socket.id, {
        username: user.username,
        sentiment: user.sentiment,
        partnerId: null,
      });

      // Try to find a new match
      let newPartner = null;
      for (let [id, u] of users.entries()) {
        if (
          id !== socket.id &&
          u.partnerId === null &&
          u.sentiment === user.sentiment
        ) {
          newPartner = id;
          break;
        }
      }

      if (newPartner) {
        users.get(socket.id).partnerId = newPartner;
        users.get(newPartner).partnerId = socket.id;

        const you = users.get(socket.id).username;
        const partner = users.get(newPartner).username;

        io.to(socket.id).emit('status', `✅ Connected to ${partner}`);
        io.to(newPartner).emit('status', `✅ Connected to ${you}`);
        io.to(socket.id).emit('partnerName', partner);
        io.to(newPartner).emit('partnerName', you);

        console.log(`🔁 Repaired: ${you} <--> ${partner}`);
      } else {
        io.to(socket.id).emit('status', '⌛ Waiting for someone who feels like you...');
      }
    }
  });

  // VOICE
  socket.on('voice-offer', (data) => {
    const partnerId = users.get(socket.id)?.partnerId;
    if (partnerId) {
      io.to(partnerId).emit('voice-offer', { sdp: data.sdp });
    }
  });

  socket.on('voice-answer', (data) => {
    const partnerId = users.get(socket.id)?.partnerId;
    if (partnerId) {
      io.to(partnerId).emit('voice-answer', { sdp: data.sdp });
    }
  });

  socket.on('ice-candidate', (data) => {
    const partnerId = users.get(socket.id)?.partnerId;
    if (partnerId) {
      io.to(partnerId).emit('ice-candidate', { candidate: data.candidate });
    }
  });

  socket.on('end-call', () => {
    const partnerId = users.get(socket.id)?.partnerId;
    if (partnerId) {
      io.to(partnerId).emit('call-ended');
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      const partnerId = user.partnerId;
      if (partnerId && users.has(partnerId)) {
        users.get(partnerId).partnerId = null;
        io.to(partnerId).emit('status', '❌ Stranger disconnected.');
        io.to(partnerId).emit('partnerName', '');
        io.to(partnerId).emit('call-ended');
      }
      users.delete(socket.id);
      console.log(`🔴 ${user.username} disconnected`);
    }
  });
};
