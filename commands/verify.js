const { SlashCommandBuilder } = require('discord.js');
const store = require('../verificationStore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Begin Roblox–Discord verification.')
    .addStringOption(option =>
      option.setName('roblox')
        .setDescription('Your Roblox username or user ID')
        .setRequired(true)
    ),

  async execute(interaction) {
    const robloxInput = interaction.options.getString('roblox');
    const user = interaction.user;

    const code = store.create(user, robloxInput);

    await interaction.reply({
      content: [
        `**HK‑87 // Verification Protocol Online**`,
        ``,
        `Roblox Identifier Received: **${robloxInput}**`,
        `Generated Cipher: **${code}**`,
        ``,
        `**To Verify:**`,
        `1. Go to your Roblox profile.`,
        `2. Edit your bio (About section).`,
        `3. Add this exact code: **${code}**`,
        `4. Keep it there for at least 30 seconds.`,
        `5. Then run: **/confirm**`,
        ``,
        `HK‑87 will scan your profile and bind your identity.`
      ].join('\n'),
      flags: 64
    });
  }
};