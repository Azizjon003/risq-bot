import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import path from "path";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";
import { addAllDataToExcel } from "../utils/addExcelAllDatas";
import { sleep } from "./fillialsEdit";
import fs from "fs";

const scene = new Scenes.BaseScene("admin");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

let keyboard = [
  "Bugungi buyurtmalar",
  "Filiallar",
  "Foydalanuvchilar",
  "Mahsulotlar",
  "Filliallarga odam qo'shish",
  "Umumiy statistika",
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

scene.on("message", async (ctx: any) => {
  const text = ctx.update.message?.text?.trim();
  console.log(text, "nimadirlar");
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
  } else if (text === "Umumiy statistika") {
    const endOrders = (await prisma.orderTimes.findMany({
      orderBy: {
        created_at: "desc",
      },

      take: 2,
    })) || [
      { created_at: new Date(new Date().getTime() - 86400 * 1000) },
      { created_at: new Date(new Date().getTime() - 7 * 86400 * 1000) },
    ];

    const products = await prisma.orderProducts.findMany({
      where: {
        created_at: {
          lte: endOrders[0]?.created_at,
          gte: endOrders[1]?.created_at,
        },
      },
      include: {
        product: true,
        order: {
          include: {
            branch: true,
          },
        },
      },
    });
    let productsData = products.map((item) => {
      return {
        product: item.product.name,
        count: item.count,
        branch: item.order.branch.name,
        created_at: item.created_at,
      };
    });

    let text = `Umumiy statistika\n\n`;

    let trash = await prisma.trash.findMany({
      where: {
        created_at: {
          lte: endOrders[0].created_at,
          gte: endOrders[1].created_at,
        },
      },
    });

    let trushData = [];
    for (let [index, item] of trash.entries()) {
      let product = await prisma.product.findUnique({
        where: {
          id: item.product_id,
        },
      });

      let user = await prisma.user.findUnique({
        where: {
          id: item.user_id,
        },
        include: {
          branch: true,
        },
      });
      trushData.push({
        product: product?.name,
        count: item.count,
        branch: user?.branch?.name,
        created_at: item.created_at,
      });
    }
    const data = {
      totalProdutcs: products.length,
      totalTrash: trash.length,
      products: productsData,
      trash: trushData,
    };

    let filename = path.join(
      __dirname,
      `../public/${new Date().getTime()}.xlsx`
    );
    const datas = await addAllDataToExcel(filename, data);

    if (!datas)
      return ctx.reply(
        "Faylni yuklashda xatolik qaytadan raqamni kiritib ko'ring"
      );
    await sleep(1000);

    const readFile = fs.readFileSync(filename);
    const id = ctx.from.id;
    ctx.telegram.sendDocument(
      id,
      {
        source: readFile,
        filename: "data.xlsx",
      },
      {
        caption: `Umumiy ma'lumot ma'lumot`,
      }
    );
    return ctx.scene.enter("admin");
  }
});

export default scene;
