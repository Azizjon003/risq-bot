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
  const branch_id = ctx.session.user?.branch_id;
  if (text === "Fikr bildirish") {
    ctx.session.user = {
      action: "fikr",
      branch_id: branch_id,
    };
    ctx.reply("Fikringizni yozib qoldiring  ");
  } else if (text === "Admin bilan aloqa") {
    ctx.session.user = {
      action: "aloqa",
      branch_id: branch_id,
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
  const branchId = ctx.session.user?.branch_id;
  let branch = await prisma.branch.findFirst({
    where: {
      id: String(branchId),
    },
  });

  if (!branch) {
    branch = {
      name: "Umumiy risq uchun",
      id: "0",
      address: "",
      created_at: new Date(),
      updated_at: new Date(),
    };
  }
  if (user.action === "fikr") {
    ctx.reply("Fikringiz qabul qilindi");
    ctx.telegram.sendMessage(
      groupId,
      `#${branch?.name}\nFikr: ${text}\nYuborilgan <a href="tg://user?id=${user_id}">${user_id}</a>`,
      {
        parse_mode: "HTML",
      }
    );
  } else if (user.action === "aloqa") {
    ctx.telegram.sendMessage(
      groupId,
      `#${branch?.name}\nAdmin uchun aloqa: ${text}\n\nYuborilgan <a href="tg://user?id=${user_id}">${user_id}</a>`,
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
