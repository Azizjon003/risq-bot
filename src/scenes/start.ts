import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { keyboards } from "../utils/keyboards";
const scene = new Scenes.BaseScene("start");

export let keyboard = [
  "Bugungi buyurtmalar",
  "Filiallar",
  "Foydalanuvchilar",
  "Mahsulotlar",
  "Filliallarga odam qo'shish",
];
scene.enter(async (ctx: any) => {
  const user_id = ctx.from?.id;
  const user_name = ctx.from?.first_name || ctx.from?.username;
  console.log("ctx");
  const enable = await enabled(String(user_id), String(user_name));

  console.log(enable, "enable");
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
    let branch = [["Bugungi buyurtmalar"]];
    for (let i = 0; i < length; i++) {
      branch.push([branches[i].name]);
    }
    branch.reverse();

    await ctx.reply("Добро пожаловать в бот", {
      ...keyboards(branch),
      remove_keyboard: true,
    });
    console.log("Добро пожаловать в бот");
    return ctx.scene.enter("branches");
  } else if (enable === "two") {
    ctx.reply("Добро пожаловать в бот");
  } else if (enable === "three") {
    ctx.reply("Добро пожаловать в бот");
  } else if (enable === "four") {
    ctx.reply("Welcome to the bot admin!", {
      ...keyboards(keyboard),
      remove_keyboard: true,
    });
    return ctx.scene.enter("admin");
  }
});

export default scene;
