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
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Sanani belgilangan vaqtni (0:00:00) sozlaymiz

  let orderProducts = await prisma.orderProducts.findFirst({
    where: {
      product_id: String(product?.id),
      created_at: {
        gte: today,
      },
    },
  });
  console.log(orderProducts);

  if (orderProducts) {
    let text = `Siz bugun ushbu mahsulotni buyurtma qilgansiz bugun uchun. \nMahsulot: ${product.name}\nNarxi: ${product.price}\n Soni: ${orderProducts.count}.Mahsulotni qayta buyurtma qilish uchun sonni kiriting (faqat son kiriting):`;
    ctx.session.product = product;
    return ctx.reply(text);
  }
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

  const isOrderProduct = await prisma.orderProducts.findFirst({
    where: {
      order_id: String(orders?.id),
      product_id: String(product?.id),
    },
  });
  if (!isOrderProduct) {
    let orderProducts = await prisma.orderProducts.create({
      data: {
        order_id: String(orders?.id),
        product_id: String(product?.id),
        count: Number(count),
      },
    });
  } else {
    let orderProducts = await prisma.orderProducts.update({
      where: {
        id: String(isOrderProduct?.id),
      },
      data: {
        count: Number(count),
      },
    });
  }

  const orderProduct = await prisma.orderProducts.findMany({
    where: {
      order_id: String(orders?.id),
    },
    include: {
      product: true,
    },
  });

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
    "Buyurtma qabul qilindi!" + `\n${text} \nUmumiy narxi: ${umumiyNarx}`
  );
  return ctx.scene.enter("branches");
});

export default scene;
