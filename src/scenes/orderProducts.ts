import { Markup, Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard, formatNumber } from "../utils/functions";

const scene = new Scenes.BaseScene("orders");

scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));
scene.hears("Bosh Menyu", (ctx: any) => ctx.scene.enter("start"));

scene.hears(/^[0-9]+$/, async (ctx: any) => {
  const product = ctx.session.product;
  const count = ctx.update.message.text;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
    include: {
      orders: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  console.log(user?.orders);
  const orderId = user?.orders.length == 0 ? user?.orders[0]?.id : "nimadir";
  let orders = await prisma.order.findFirst({
    where: {
      id: orderId,
      // messageId: null,
    },
  });

  console.log(orders);
  const branch = await prisma.branch.findFirst({
    where: {
      id: String(user?.branchId),
    },
  });
  if (orders?.messageId) {
    orders = await prisma.order.create({
      data: {
        userId: String(user?.id),
        branchId: String(user?.branchId),
      },
    });
  }

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

  let orderProducts;
  if (!isOrderProduct) {
    orderProducts = await prisma.orderProducts.create({
      data: {
        order_id: String(orders?.id),
        product_id: String(product?.id),
        count: Number(count),
      },
    });
  } else {
    orderProducts = await prisma.orderProducts.update({
      where: {
        id: String(isOrderProduct?.id),
      },
      data: {
        count: Number(count) + isOrderProduct.count,
      },
    });
  }

  if (count * 1 === 0) {
    await prisma.orderProducts.delete({
      where: {
        id: orderProducts.id,
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
    } \n`;
    text += txt;
  }

  ctx.reply(
    "Buyurtma qabul qilindi!" +
      `\n${text} \n Qaytadan buyurtmaga mahsulot qo'shing`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Mahsulot qidirish",
              switch_inline_query_current_chat: "",
            },
          ],
        ],
      },
    }
  );
  // ctx.reply(text, {
  //   reply_murkup: {
  //     remove_keyboard: true,
  //     keyboard: [["Bosh Menyu"]],
  //     resize_keyboard: true,
  //   },
  // });

  // const channelId = process.env.CHANNEL_ID;
  // ctx.telegram.sendMessage(
  //   channelId,
  //   `${branch?.name} fillial buyurtma qildi` + text
  // );

  ctx.reply(
    "Mahsulotni kiriting yoki bosh menyuga o'ting",
    Markup.keyboard([["Bosh Menyu"]])
      .resize()
      .oneTime()
  );
  // return ctx.scene.enter("branches");
});
scene.on("message", async (ctx: any) => {
  const data = ctx.update.message.text.trim();
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
    include: {
      orders: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });

  let product = await prisma.product.findFirst({
    where: {
      name: String(data),
    },
  });

  console.log(product);

  if (!product) {
    ctx.reply(
      `Mahsulot topilmadi.Lekin mahsulotni qo'shib qo'ydik!.Endi Mahsulot sonini kiriting(Faqat son kiriting):`
    );

    product = await prisma.product.create({
      data: {
        name: String(data),
        price: 0,
      },
    });

    // ctx.reply(`Bu mahsulot mavjud emas.Qaytadan urinib ko'ring!`);
  }

  const today =
    user?.orders.length == 0 ? user?.orders[0]?.created_at : new Date();
  // today.setHours(0, 0, 0, 0); // Sanani belgilangan vaqtni (0:00:00) sozlaymiz

  let orderProducts = await prisma.orderProducts.findFirst({
    where: {
      product_id: String(product?.id),

      order: {
        userId: String(user?.id),
        branchId: String(user?.branchId),
        created_at: {
          gte: today,
        },
      },
    },
  });
  console.log(orderProducts);

  if (orderProducts) {
    let text = `Siz bugun ushbu mahsulotni buyurtma qilgansiz bugun uchun. \nMahsulot: ${product.name}\n Soni: ${orderProducts.count}.Mahsulotni qayta buyurtma qilish uchun sonni kiriting (faqat son kiriting):`;
    ctx.session.product = product;
    return ctx.reply(text, {
      reply_markup: {
        remove_keyboard: true,
        keyboard: [["Bosh Menyu"]],
        resize_keyboard: true,
      },
    });
  }
  const text = `Mahsulot: ${product.name}\nMahsulot sonini kiriting(Faqat son kiriting):`;
  ctx.session.product = product;

  ctx.reply(text, {
    reply_murkup: {
      remove_keyboard: true,
      keyboard: [["Bosh Menyu"]],
      resize_keyboard: true,
    },
  });

  // ctx.reply("Mahsulotni kiriting yoki bosh menyuga o'ting", {
  //   reply_murkup: {
  //     remove_keyboard: true,
  //     keyboard: [["Bosh Menyu"]],
  //     resize_keyboard: true,
  //   },
  // });
});

export default scene;
