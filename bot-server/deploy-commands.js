import * as dotenv from "dotenv";
import * as fs from "fs";

import { REST, Routes } from "discord.js";

dotenv.config({ path: "../.env" });

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

(async () => {
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const { command } = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  // Construct and prepare an instance of the REST module
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  // and deploy your commands!

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const deploy_prod = () => {
      return Routes.applicationCommands(process.env.CLIENT_ID);
    };

    const deploy_dev = () => {
      return Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      );
    };

    const data = await rest.put(
      process.env.PROD === 1 ? deploy_prod() : deploy_dev(),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
