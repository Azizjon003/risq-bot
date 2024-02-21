import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("admin");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

let keyboard = [
  "Bugungi buyurtmalar",
  "Filiallar",
  "Foydalanuvchilar",
  "Mahsulotlar",
  "Filliallarga odam qo'shish",
];

scene.hears(keyboard, async (ctx: any) => {
  const text = ctx.update.message?.text?.trim();
  console.log(text);
  if (text === "Bugungi buyurtmalar") {
    const branches = await prisma.branch.findMany({});
    let buttons = branches.map((item) => {
      return [
        {
          text: item.name,
          callback_data: item.id,
        },
      ];
    });
    buttons.push([
      {
        text: "Orqaga",
        callback_data: "back",
      },
    ]);

    ctx.reply("Filialni tanlang", {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });

    return ctx.scene.enter("adminFillials");
  } else if (text === "Filiallar") {
    const branches = await prisma.branch.findMany({});
    let buttons = branches.map((item) => {
      return [
        {
          text: item.name,
          callback_data: item.id,
        },
      ];
    });
    buttons.push([
      {
        text: "Orqaga",
        callback_data: "back",
      },
    ]);
    buttons.push([
      {
        text: "Yangi filial qo'shish",
        callback_data: "add",
      },
    ]);

    // let keyboard = createInlineKeyboard(buttons);

    ctx.reply("Filiallarimiz", {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });

    return ctx.scene.enter("editFillials");
  } else if (text === "Foydalanuvchilar") {
    const users = await prisma.user.count({});
    ctx.reply(`Foydalanuvchilar soni: ${users}`);
  } else if (text === "Mahsulotlar") {
    const products = await prisma.product.count({});
    const popularProducts = await prisma.orderProducts.findMany({
      orderBy: {
        count: "desc",
      },
      include: {
        product: true,
      },
      take: 20,
    });
    let text = `Mahsulotlar soni: ${products}\n\n`;
    text += "Eng ko'p sotilgan mahsulotlar:\n";
    for (let i = 0; i < popularProducts.length; i++) {
      text += `${i + 1}. ${popularProducts[i].product.name} - ${
        popularProducts[i].count
      } ta\n`;
    }

    ctx.reply(text);
  }
});

export default scene;
