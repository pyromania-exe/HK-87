require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Check bio for code
app.post('/check-bio', async (req, res) => {
  const { code, robloxInput } = req.body;

  try {
    let userId = robloxInput;

    if (isNaN(robloxInput)) {
      const lookup = await axios.post(
        "https://users.roblox.com/v1/usernames/users",
        {
          usernames: [robloxInput],
          excludeBannedUsers: false
        }
      );

      if (!lookup.data.data || lookup.data.data.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }

      userId = lookup.data.data[0].id;
    }

    const profile = await axios.get(
      `https://users.roblox.com/v1/users/${userId}`
    );

    const bio = profile.data.description || "";

    if (bio.includes(code)) {
      return res.json({ success: true, userId });
    }

    return res.json({ success: false, message: "Code not found in bio" });

  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Backend error" });
  }
});

// Helper: get Roblox rank name in a group
async function getRobloxRank(userId, groupId) {
  const res = await axios.get(
    `https://groups.roblox.com/v2/users/${userId}/groups/roles`
  );

  const groups = res.data.data;
  const entry = groups.find(g => g.group.id === Number(groupId));
  if (!entry) return null;

  return entry.role.name;
}

// Endpoint: get rank by robloxInput
app.post('/get-rank', async (req, res) => {
  const { robloxInput } = req.body;

  try {
    let userId = robloxInput;

    if (isNaN(robloxInput)) {
      const lookup = await axios.post(
        "https://users.roblox.com/v1/usernames/users",
        {
          usernames: [robloxInput],
          excludeBannedUsers: false
        }
      );

      if (!lookup.data.data || lookup.data.data.length === 0) {
        return res.json({ success: false, message: "User not found" });
      }

      userId = lookup.data.data[0].id;
    }

    const rankName = await getRobloxRank(userId, process.env.ROBLOX_GROUP_ID);
    if (!rankName) {
      return res.json({ success: false, message: "Not in group" });
    }

    return res.json({ success: true, rank: rankName });

  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Backend error" });
  }
});

app.listen(3000, () => {
  console.log('HK‑87 backend running on port 3000');
});
