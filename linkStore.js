const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'links.json');

function load() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  setLink(discordId, robloxInput) {
    const data = load();
    data[discordId] = { robloxInput };
    save(data);
  },

  getLink(discordId) {
    const data = load();
    return data[discordId] || null;
  }
};
