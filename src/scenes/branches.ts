import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("branches");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

scene.on("message", async (ctx: any) => {
  const text = ctx.update.message?.text.trim();
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

  if (user?.branch?.name !== text) {
    ctx.reply("Sizda bunday filial mavjud emas!");
    return ctx.scene.enter("start");
  }

  console.log(user, "salom");
  const products = await prisma.product.findMany();
  let length = products.length;
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
  let product = addInlineKeyboard(products);
  product = product.filter((item) => item.length > 0);
  console.log(product);
  // const inlineKeyboard = createInlineKeyboard(product);
  // console.log(inlineKeyboard);
  ctx.reply("Kerakli mahsulotni tanlang!", {
    reply_markup: {
      inline_keyboard: product,
    },
  });
});

export default scene;
