require("dotenv").config();
import { Context, Middleware } from "telegraf";
import bot from "./core/bot";
import session from "./core/session";
import botStart from "./utils/startBot";
import stage from "./scenes/index";
import { SceneContext } from "telegraf/typings/scenes";
import findProductByName from "./utils/searchFunction";
import prisma from "../prisma/prisma";
bot.use(session);

const middleware: Middleware<Context | SceneContext> = (ctx: any, next) => {
  ctx?.session ?? (ctx.session = {});
};
bot.use(stage.middleware());

bot.start((ctx: any) => ctx.scene.enter("start"));

// bot.action(/^leader/, async (ctx: any) => {
//   const id = ctx.from.id;

//   console.log(ctx.update.callback_query);
//   const messageId = ctx.update.callback_query.message.message_id;
//   const inlineMessageId = ctx.update.callback_query.inline_message_id;
//   const query = ctx.update.callback_query.data.split("_")[1];
//   const isProduct = await prisma.order.findFirst({
//     where: {
//       id: query,
//     },
//     include: {
//       orderProducts: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });
//   if (!isProduct) {
//     ctx.reply("Bunday mahsulot topilmadi");
//     return;
//   }
//   const userId = isProduct.userId;
//   const user = await prisma.user.findFirst({
//     where: {
//       id: userId,
//     },
//     include: {
//       branch: true,
//     },
//   });

//   if (!user) {
//     ctx.reply("Foydalanuvchi topilmadi");
//     return;
//   }

//   let today = new Date();
//   today.setHours(0, 0, 0, 0);
//   let order = await prisma.order.findFirst({
//     where: {
//       AND: [
//         {
//           userId: String(user?.id),
//         },
//         {
//           branchId: user?.branch?.id,
//         },
//       ],
//       created_at: {
//         gte: today,
//       },
//     },
//   });
//   const orderProduct = await prisma.orderProducts.findMany({
//     where: {
//       order_id: order?.id,
//       created_at: {
//         gte: today,
//       },
//     },
//     include: {
//       product: true,
//     },
//   });

//   if (orderProduct.length === 0) {
//     ctx.reply("Mahsulot hali buyurtma bermadingiz");
//     return ctx.scene.enter("branches");
//   }

//   let text = `Sizning buyurtmangiz: \n`;
//   let inlineKeyboard = [];
//   for (let i = 0; i < orderProduct.length; i++) {
//     let txt = `${i + 1}. ${orderProduct[i].count} x ${
//       orderProduct[i].product.name
//     } \n`;

//     inlineKeyboard.push([
//       {
//         text: `${orderProduct[i].product.name}`,
//         callback_data: `aziz_${orderProduct[i].id}`,
//       },
//     ]);
//     text += txt;
//   }
//   inlineKeyboard.push([
//     {
//       text: "Tasdiqlash",
//       callback_data: `leader_${order?.id}`,
//     },
//   ]);

//   const channelId = process.env.CHANNEL_ID;

//   ctx.telegram.editMessageText(
//     id,
//     messageId,
//     inlineMessageId,
//     text + `\n Mahsulotlar tasdiqlandi`,
//     {
//       reply_markup: {
//         inline_keyboard: [],
//       },
//     }
//   );

//   ctx.telegram.sendMessage(channelId, text, {
//     parse_mode: "HTML",
//   });
// });

bot.telegram.setMyCommands([
  {
    command: "start",
    description: "Botni ishga tushirish",
  },
]);
bot.on("inline_query", async (ctx: any) => {
  const query = ctx.inlineQuery.query;
  let results: any = [];
  // Mahsulotlarni qidirish uchun kerakli kod
  const products = await findProductByName(query);
  console.log(products);
  products.forEach((product, i) => {
    results.push({
      type: "article",
      id: i,
      title: product.name,
      description: product.description,
      input_message_content: {
        message_text: product.name,
      },
    });
  });
  // });
  // await ctx.replanswerInlineQuery("Mahsulotlar");
  await ctx.answerInlineQuery(results);
});
bot.catch((err: any, ctx: any) => {
  console.log(`Ooops, encountered an error for ${ctx}`, err);
});
botStart(bot);
