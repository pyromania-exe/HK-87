async function removeOldRankRoles(member, guild, currentRankName) {
  const allRoles = guild.roles.cache;

  for (const role of allRoles.values()) {
    if (role.name === currentRankName) continue;

    // Remove only HK‑87-created roles
    if (role.tags?.botId === guild.client.user.id) {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role.id).catch(() => {});
      }
    }
  }
}

module.exports = { removeOldRankRoles };