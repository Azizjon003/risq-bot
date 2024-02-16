import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { keyboards } from "../utils/keyboards";
const scene = new Scenes.BaseScene("start");

scene.enter(async (ctx: any) => {
  const user_id = ctx.from?.id;
  const user_name = ctx.from?.first_name || ctx.from?.username;
  const enable = await enabled(String(user_id), String(user_name));

  if (enable === "one") {
    let branches = await prisma.branch.findMany({
      where: {
        users: {
          some: {
            telegram_id: String(user_id),
          },
        },
      },
    });
    let length = branches.length;
    let branch = [];
    for (let i = 0; i < length; i++) {
      branch.push([branches[i].name]);
    }
    console.log(branch);

    ctx.reply("Welcome to the bot!", keyboards(branch));
    return ctx.scene.enter("branches");
    ctx.reply("Welcome to the bot!");
  } else if (enable === "two") {
    ctx.reply("You are not enabled to use the bot");
  } else if (enable === "three") {
    ctx.reply("Welcome to the bot!");
  } else if (enable === "four") {
    ctx.reply("Welcome to the bot admin!");
  }
});

export default scene;