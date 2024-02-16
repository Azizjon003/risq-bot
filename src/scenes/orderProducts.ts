import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("orders");

scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

scene.on("callback_query", async (ctx: any) => {
  const data = ctx.update.callback_query.data;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  const product = await prisma.product.findFirst({
    where: {
      id: String(data),
    },
  });

  if (!product) return ctx.reply(`Bu mahsulot mavjud emas`);

  const text = `Mahsulot: ${product.name}\nNarxi: ${product.price}\nMahsulot sonini kiriting(Faqat son kiriting):`;
  ctx.session.product = product;
  ctx.reply(text);
});

scene.hears(/^[0-9]+$/, async (ctx: any) => {
  const product = ctx.session.product;
  const count = ctx.update.message.text;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Sanani belgilangan vaqtni (0:00:00) sozlaymiz

  console.log(today);
  let orders = await prisma.order.findFirst({
    where: {
      userId: String(user?.id),
      branchId: String(user?.branchId),
      created_at: {
        gte: today,
      },
    },
  });

  if (!orders) {
    orders = await prisma.order.create({
      data: {
        userId: String(user?.id),
        branchId: String(user?.branchId),
      },
    });
  }

  let orderProducts = await prisma.orderProducts.create({
    data: {
      order_id: String(orders?.id),
      product_id: String(product?.id),
      count: Number(count),
    },
  });

  ctx.reply("Buyurtma qabul qilindi!");
  return ctx.scene.enter("branches");
});

export default scene;
