require("dotenv").config();
const Discord = require("discord.js");
const { PassThrough } = require("stream");
const AudioManager = require("./AudioManager");

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"],
});
const audioManager = new AudioManager();
const stream = new PassThrough();

const trackNames = [
  "BARMAN_WORKING",
  "FULL_ROOM",
  "NIGHT_AMBIENCE",
  "PEOPLE_TALKING",
  "RAIN_ON_WINDOW",
  "SERVING_DRINKS",
  "STREET_AMBIENCE",
  "ESCALATOR",
  "JUNGLE",
  "PIGEONS",
  "NATURE",
];

client
  .on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    audioManager.start();
  })
  .on("message", async (message) => {
    const args = message.content.toLowerCase().split(" ");
    if (args[0] === "xjoin") {
      console.log("command:", args);
      try {
        if (!message.member.voice.channel) {
          return message.reply(
            "You need to be in a voice channel to summon me."
          );
        }
        const channel = await message.member.voice.channel.join();
        await broadcast(channel);
      } catch (err) {
        return message.reply("I need permission to join your voice channel.");
      }
    } else if (args[0] === "xleave") {
      console.log("command:", args);
      const channel = message.member.voice.channel;
      if (
        channel &&
        message.client.voice.connections.some(
          (connection) => connection.channel === channel
        )
      ) {
        channel.leave();
      } else {
        return message.reply("I'm not in your voice channel.");
      }
    } else if (args[0] === "xrejoin") {
      const channel = message.member.voice.channel;

      if (!channel) {
        return message.reply("You need to be in a voice channel.");
      }
      try {
        channel.leave();
        await sleep(1000);
        await channel.join();
      } catch (err) {
        return message.reply("I need permission to join your voice channel.");
      }
    } else if (args[0] === "xtracks") {
      console.log("command:", args);
      return message.reply(trackNames.join(", "));
    } else if (args[0] === "xgain") {
      console.log("command:", args);
      if (args.length < 3) {
        return message.reply(
          "Bad command format. Example: xgain FULL_ROOM 0.5"
        );
      }

      if (trackNames.includes(args[1].toUpperCase())) {
        const trackName = args[1].toUpperCase();
        const gain = Number(args[2]);

        if (!isNaN(gain) && gain >= 0 && gain <= 1) {
          // set gain for this track if it matches
          audioManager.tracks.forEach((track) => {
            const trackHumanName = track.name.replace(".wav", "").trim();
            if (trackHumanName === trackName) {
              track.volume = gain;
              return message.reply(
                `Gain value for ${trackName} set to ${gain}`
              );
            }
          });
        } else {
          return message.reply("Gain value is not a number from 0 to 1");
        }
      } else {
        return message.reply("Track name does not exist...");
      }
      // gain per channel
    } else if (message.content === "xremix") {
      console.log("command:", args);
      audioManager.remix();
      return message.reply("Track gains remixed, takes effect in 4 seconds");
    }
  })
  .on("error", console.error)
  .on("warn", console.warn)
  .on("debug", console.log);

client.login(process.env.DISCORD_TOKEN);

const broadcast = async (channel) => {
  try {
    const broadcast = client.voice.createBroadcast();

    broadcast.play(stream, { type: "converted" });
    broadcast.on("error", (err) => console.log(err));
    broadcast.on("start", () => console.log(`start`));
    broadcast.on("finish", () => console.log(`finish`));

    audioManager.setOutputStream(stream);
    audioManager.startTimer();

    channel.play(broadcast);
  } catch (e) {
    console.log(`Error connecting to voice channel: ${e}`);
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
