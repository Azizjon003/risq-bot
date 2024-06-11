import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard, formatNumber } from "../utils/functions";
import { channel } from "diagnostics_channel";
import moment from "moment-timezone";
const scene = new Scenes.BaseScene("branches");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));
scene.hears("Bugungi buyurtmalar", async (ctx: any) => {
  const id = ctx.from.id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(id),
    },
    include: {
      branch: true,
      orders: {
        orderBy: {
          created_at: "desc",
        },
        include: {
          orderProducts: true,
        },
      },
    },
  });
  console.log(user?.orders);

  let today = user?.orders[0].created_at;
  const order = user?.orders[0].id;
  // today.setHours(0, 0, 0, 0);

  const orderProduct = await prisma.orderProducts.findMany({
    where: {
      order_id: order,
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
    } =  ${orderProduct[i].count * orderProduct[i].product.price} so'mg\n`;
    text += txt;
  }

  ctx.reply(
    "Buyurtma qabul qilindi!" +
      `\n${text}  \n Qaytadan buyurtmaga mahsulot qo'shing`,
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
scene.hears("Fillialni almashtirish", async (ctx: any) => {
  let branches = await prisma.branch.findMany({});
  let branchesInlineKeyboard: any = [];
  branches.forEach((branch) => {
    branchesInlineKeyboard.push([
      {
        text: branch.name,
        callback_data: `${branch.id}`,
      },
    ]);
  });
  const txt =
    "Assalomu alaykum, " +
    ctx.from?.first_name +
    "!\n" +
    "Sizga qaysi filialga kirishni xohlaysiz?.Shu fillialni  belgilang";

  ctx.reply(txt, {
    reply_markup: {
      inline_keyboard: branchesInlineKeyboard,
    },
  });

  return ctx.scene.enter("addbranch");
});

scene.action("send", async (ctx: any) => {
  const id = ctx.from.id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(id),
    },
    include: {
      branch: true,
      orders: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });
  console.log(user, "user");

  let today = user?.orders[0].created_at;
  const orderId = user?.orders[0].id;
  console.log(today, "today");
  // today.setHours(0, 0, 0, 0);
  let order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
  });
  const orderProduct = await prisma.orderProducts.findMany({
    where: {
      // order_id: order?.id,
      // order: {
      //   AND: [
      //     {
      //       userId: String(user?.id),
      //     },
      //     {
      //       branchId: user?.branch?.id,
      //     },
      //   ],
      // userId: String(user?.id),
      // branchId: user?.branch?.id,
      // },
      // created_at: {
      //   gt: today,
      // },
      order_id: orderId,
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
  let inlineKeyboard = [];
  for (let i = 0; i < orderProduct.length; i++) {
    let txt = `${i + 1}. ${orderProduct[i].count} x ${
      orderProduct[i].product.name
    } \n`;

    text += txt;
  }

  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });
  const channelId = process.env.CHANNEL_ID || "nimadir";
  const messageId = order?.messageId;

  console.log(channelId, "channelId", messageId);
  const formattedDate = moment(new Date())
    .tz("Asia/Tashkent")
    .format("YYYY-MM-DD HH:mm:ss");
  if (messageId) {
    // ctx.telegram.editMessageText(
    // `#${user?.branch?.name}\n${text}  \n Yuborilgan <a href="tg://user?id=${id}">${user?.name}</a>
    //  Yangilanish vaqti:${formattedDate}
    // `,
    //   {
    //     parse_mode: "HTML",
    //     // reply_markup: {
    //     //   inline_keyboard: inlineKeyboard,
    //     // },
    //   }
    // );
    ctx.telegram.editMessageText(
      channelId,
      Number(messageId),
      undefined,
      `#${user?.branch?.name}\n${text}  \n Yuborilgan <a href="tg://user?id=${id}">${user?.name}</a>\nYangilanish vaqti:${formattedDate}
      `,
      {
        parse_mode: "HTML",
        // reply_markup: {
        //   inline_keyboard: inlineKeyboard,
        // },
      }
    );
  } else {
    const messages = await ctx.telegram.sendMessage(
      channelId,
      `#${user?.branch?.name}\n${text}  \n Yuborilgan <a href="tg://user?id=${id}">${user?.name}</a>\nYangilanish vaqti:${formattedDate}
      `,
      {
        parse_mode: "HTML",
        // reply_markup: {
        //   inline_keyboard: inlineKeyboard,
        // },
      }
    );

    const messageIds = messages.message_id;

    await prisma.order.update({
      where: {
        id: order?.id,
      },
      data: {
        messageId: String(messageIds),
      },
    });
  }
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
