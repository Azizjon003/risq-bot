import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";
import { keyboard2 } from "./start";
const scene = new Scenes.BaseScene("publicUsers");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));
scene.hears(keyboard2, (ctx: any) => {
  const user_id = ctx.from?.id;
  const text = ctx.message.text;
  if (text === "Fikr bildirish") {
    ctx.session.user = {
      action: "fikr",
    };
    ctx.reply("Fikringizni yozib qoldiring  ");
  } else if (text === "Admin bilan aloqa") {
    ctx.session.user = {
      action: "aloqa",
    };
    ctx.reply("Admin bilan aloqa");
  }
});
scene.on("message", async (ctx: any) => {
  const groupId = process.env.GROUP_ID;
  const user_id = ctx.from?.id;
  const user_name = ctx.from?.first_name || ctx.from?.username;
  const user = ctx.session.user;
  let text = ctx.message.text;
  if (user.action === "fikr") {
    ctx.reply("Fikringiz qabul qilindi");
    ctx.telegram.sendMessage(
      groupId,
      `Fikr: ${text}\nYuborilgan <a href="tg://user?id=${user_id}">${user_id}</a>`,
      {
        parse_mode: "HTML",
      }
    );
  } else if (user.action === "aloqa") {
    ctx.telegram.sendMessage(
      groupId,
      `Admin uchun aloqa: ${text}\n\nYuborilgan <a href="tg://user?id=${user_id}">${user_id}</a>`,
      {
        parse_mode: "HTML",
      }
    );
    ctx.reply("Xabar qabul qilindi");
  }
  ctx.session.user = null;
  return ctx.scene.enter("start");
});
export default scene;
