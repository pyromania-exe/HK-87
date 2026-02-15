const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const store = require('../verificationStore');
const linkStore = require('../linkStore');
const { removeOldRankRoles } = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('confirm')
    .setDescription('Confirm your Roblox verification.'),

  async execute(interaction) {
    const user = interaction.user;

    const pendingEntry = [...store.pendingEntries()]
      .find(([code, data]) => data.discordId === user.id);

    if (!pendingEntry) {
      return interaction.reply({
        content: `HK‑87 detects no active verification request. Use **/verify** first.`,
        flags: 64
      });
    }

    const [code, data] = pendingEntry;

    // 1) Check bio for code
    const bioCheck = await axios.post('http://localhost:3000/check-bio', {
      code,
      robloxInput: data.robloxInput
    });

    if (!bioCheck.data.success) {
      return interaction.reply({
        content: `HK‑87 could not locate the verification code in your Roblox bio. Ensure the code is visible and try again.`,
        flags: 64
      });
    }

    // 2) Get rank name
    const rankRes = await axios.post('http://localhost:3000/get-rank', {
      robloxInput: data.robloxInput
    });

    if (!rankRes.data.success) {
      return interaction.reply({
        content: `HK‑87 could not retrieve your Roblox rank. Ensure you are in the correct group.`,
        flags: 64
      });
    }

    const rankName = rankRes.data.rank;

    // 3) Store link for future /sync
    linkStore.setLink(user.id, data.robloxInput);

    // 4) Consume pending verification
    store.consume(code);

    // 5) Discord role logic
    const guild = await interaction.client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(user.id);

    const verifiedRoleId = process.env.VERIFIED_ROLE_ID;
    const unverifiedRoleId = process.env.UNVERIFIED_ROLE_ID;

    // Remove Unverified
    if (process.env.UNVERIFIED_ROLE_ID && member.roles.cache.has(process.env.UNVERIFIED_ROLE_ID)) {
      await member.roles.remove(process.env.UNVERIFIED_ROLE_ID).catch(err => console.log("Remove unverified error:", err));
    }

    // Add Verified
    if (process.env.VERIFIED_ROLE_ID && !member.roles.cache.has(process.env.VERIFIED_ROLE_ID)) {
      await member.roles.add(process.env.VERIFIED_ROLE_ID).catch(err => console.log("Add verified error:", err));
    }

    // Remove old rank roles
    await removeOldRankRoles(member, guild, rankName);

    // Find or create rank role
    let rankRole = guild.roles.cache.find(r => r.name === rankName);

    if (!rankRole) {
      rankRole = await guild.roles.create({
        name: rankName,
        reason: 'HK‑87 auto‑created Roblox rank role'
      }).catch(err => console.log("Create rank role error:", err));
    }

    // Assign rank role
    await member.roles.add(rankRole.id).catch(err => console.log("Add rank role error:", err));

    // Nickname user
    await member.setNickname(data.robloxInput).catch(err => console.log("Nickname error:", err));

    return interaction.reply({
      content: `**Verification Complete.** HK‑87 has confirmed your Roblox identity and assigned the rank **${rankName}**.`,
      flags: 64
    });
  }
};
