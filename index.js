require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const express = require('express');
const app = express();
app.use(express.json());

// Endpoint for backend to confirm verification
app.post('/confirm', async (req, res) => {
  const { discordId, robloxId, robloxUsername } = req.body;

  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const member = await guild.members.fetch(discordId);

    // TEMP: Just send a DM for now
    await member.send(
      `HK‑87 Verification Complete.\nLinked Roblox account: **${robloxUsername}** (${robloxId})`
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.json({ success: false });
  }
});

app.listen(3001, () => {
  console.log('HK‑87 Discord listener running on port 3001');
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js') && f !== 'utils.js');

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`HK‑87 activated as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: 'HK‑87 encountered an error.',
        flags: 64
      });
    } else {
      await interaction.reply({
        content: 'HK‑87 encountered an error.',
        flags: 64
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
