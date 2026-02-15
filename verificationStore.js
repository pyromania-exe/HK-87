const pending = new Map();

module.exports = {
  create(discordUser, robloxInput) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    pending.set(code, {
      discordId: discordUser.id,
      robloxInput,
      createdAt: Date.now(),
    });

    return code;
  },

  get(code) {
    return pending.get(code) || null;
  },

  consume(code) {
    const data = pending.get(code);
    if (data) pending.delete(code);
    return data || null;
  },

  pendingEntries() {
    return pending.entries();
  }
};
