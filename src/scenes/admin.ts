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

scene.action("add", async (ctx: any) => {
  ctx.reply("Mahsulot qo'shish. Mahsulot nomini kiriting");
  ctx.session.user = {
    action: "add",
  };
  return ctx.scene.enter("addproducts");
});

scene.action("delete", async (ctx: any) => {
  ctx.reply("Mahsulotni o'chirish. Mahsulot nomini kiriting");
  ctx.session.user = {
    action: "delete",
  };
  return ctx.scene.enter("addproducts");
});

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

    let buttons = [
      [
        {
          text: "Mahsulot qo'shish",
          callback_data: "add",
        },
      ],
      [
        {
          text: "Mahsulotni o'chirish",
          callback_data: "delete",
        },
      ],
    ];

    ctx.reply(text, {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  } else if (text === "Filliallarga odam qo'shish") {
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

    // let keyboard = createInlineKeyboard(buttons);

    ctx.reply("Filiallarimiz fillialni tanlang", {
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
    return ctx.scene.enter("addBranchesUser");
  }
});

export default scene;
