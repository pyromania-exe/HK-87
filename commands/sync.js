const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const linkStore = require('../linkStore');
const { removeOldRankRoles } = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Sync your Roblox rank with Discord.'),

  async execute(interaction) {
    const user = interaction.user;

    const link = linkStore.getLink(user.id);
    if (!link) {
      return interaction.reply({
        content: `HK‑87 has no record of your Roblox identity. Use **/verify** first.`,
        flags: 64
      });
    }

    const rankRes = await axios.post('http://localhost:3000/get-rank', {
      robloxInput: link.robloxInput
    });

    if (!rankRes.data.success) {
      return interaction.reply({
        content: `HK‑87 could not retrieve your Roblox rank. Ensure you are in the correct group.`,
        flags: 64
      });
    }

    const rankName = rankRes.data.rank;

    const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(user.id);

    // Remove old rank roles
    await removeOldRankRoles(member, guild, rankName);

    // Find or create the new rank role
    let rankRole = guild.roles.cache.find(r => r.name === rankName);

    if (!rankRole) {
      rankRole = await guild.roles.create({
        name: rankName,
        reason: 'HK‑87 auto‑created Roblox rank role (sync)'
      });
    }

    // Assign the new rank role
    await member.roles.add(rankRole.id).catch(() => {});

    // Nickname user to Roblox username
    await member.setNickname(link.robloxInput).catch(() => {});

    return interaction.reply({
      content: `HK‑87 has synchronized your rank to **${rankName}**.`,
      flags: 64
    });
  }
};
