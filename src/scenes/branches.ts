import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("branches");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));
scene.hears("Bugungi buyurtmalar", async (ctx: any) => {
  const id = ctx.from.id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(id),
    },
  });

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const orderProduct = await prisma.orderProducts.findMany({
    where: {
      order: {
        userId: String(user?.id),
      },
      created_at: {
        gte: today,
      },
    },
    include: {
      product: true,
    },
  });

  if (orderProduct.length === 0) {
    ctx.reply("Mahsulot hali buyurtma bermadingiz");
    return ctx.scene.enter("branches");
  }

  let text = `Sizning buyurtmangiz: \n`;
  let umumiyNarx = 0;
  for (let i = 0; i < orderProduct.length; i++) {
    let txt = `${i + 1}. ${orderProduct[i].count} x ${
      orderProduct[i].product.name
    } = ${orderProduct[i].count * orderProduct[i].product.price}\n`;
    umumiyNarx += orderProduct[i].count * orderProduct[i].product.price;
    text += txt;
  }

  ctx.reply(
    "Buyurtma qabul qilindi!" +
      `\n${text} \nUmumiy narxi: ${umumiyNarx} \n Qaytadan buyurtmaga mahsulot qo'shing`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Buyurtmani adminga yuborish",
              callback_data: "send",
            },
          ],
        ],
      },
    }
  );

  return ctx.scene.enter("branches");
});

scene.action("send", async (ctx: any) => {
  const id = ctx.from.id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(id),
    },
    include: {
      branch: true,
    },
  });

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  const orderProduct = await prisma.orderProducts.findMany({
    where: {
      order: {
        userId: String(user?.id),
      },
      created_at: {
        gte: today,
      },
    },
    include: {
      product: true,
    },
  });

  if (orderProduct.length === 0) {
    ctx.reply("Mahsulot hali buyurtma bermadingiz");
    return ctx.scene.enter("branches");
  }

  let text = `Sizning buyurtmangiz: \n`;
  let umumiyNarx = 0;
  for (let i = 0; i < orderProduct.length; i++) {
    let txt = `${i + 1}. ${orderProduct[i].count} x ${
      orderProduct[i].product.name
    } = ${orderProduct[i].count * orderProduct[i].product.price}\n`;
    umumiyNarx += orderProduct[i].count * orderProduct[i].product.price;
    text += txt;
  }
  const channelId = process.env.CHANNEL_ID;
  ctx.telegram.sendMessage(
    channelId,
    `#${user?.branch?.name}\n${text} \nUmumiy narxi: ${umumiyNarx} \n Yuborilgan <a href="tg://user?id=${id}">${user?.name}</a>`
  );
  ctx.reply("Buyurtma adminga yuborildi");

  return ctx.scene.enter("branches");
});

scene.on("message", async (ctx: any) => {
  const text = ctx.update.message?.text?.trim();
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
      branch: {
        name: text,
      },
    },
    include: {
      branch: true,
    },
  });
  console.log(text, "user");

  if (user?.branch?.name !== text) {
    ctx.reply("Sizda bunday filial mavjud emas!");
    return ctx.scene.enter("start");
  }

  console.log(user, "salom");

  // let product: {
  //   text: string;
  //   callbackData: string;
  // }[] = [];

  // for (let i = 0; i < length; i++) {
  //   product.push({
  //     text: String(products[i].name),
  //     callbackData: String(products[i].id), // Change this line
  //   });
  // }

  ctx.reply("Mahsulotni qidiring Inline usulda", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Mahsulot qidirish",
            switch_inline_query_current_chat: "",
          },
        ],
      ],
      remove_keyboard: true,
      // keyboard: [["Bosh Menyu"]],
      // resize_keyboard: true,
    },
  });

  return ctx.scene.enter("orders");
});

export default scene;
