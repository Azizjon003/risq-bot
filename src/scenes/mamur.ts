import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { chunkArrayInline, createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";
import moment from "moment-timezone";
const scene = new Scenes.BaseScene("mamur");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

scene.hears("Oxirgi yetkazilgan vaqt", async (ctx: any) => {
  const ordersTime = await prisma.orderTimes.findFirst({
    orderBy: {
      created_at: "desc",
    },
  });

  if (!ordersTime) {
    ctx.reply("Hozircha buyurtmalar yo'q");
    return ctx.scene.enter("start");
  }

  const formattedDate = moment(ordersTime.created_at)
    .tz("Asia/Tashkent")
    .format("YYYY-MM-DD HH:mm:ss");

  let text = `Oxirgi yetkazilgan vaqt: ${formattedDate}`;
  ctx.reply(text, {});
});

scene.hears("Mahsulotlarni yetkazish", async (ctx) => {
  const ordersTime = await prisma.orderTimes.findFirst({
    orderBy: {
      created_at: "desc",
    },
  });

  const products = await getPaginatedProducts(
    ordersTime?.created_at || new Date(new Date().getTime() - 24 * 3600 * 1000),
    1,
    4
  );

  const total = products.total;
  const categoryProducts = products.products;

  if (total > 4)
    categoryProducts.push({
      text: "Keyingi sahifa",
      callback_data: `next_2`,
    });

  categoryProducts.push({
    text: "Yetkazilganligni tasdiqlash",
    callback_data: "leader",
  });
  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.sendMessage(
    `Quyidagi mahsulotlardan o'chirmoqchi bo'lganingnizni tanlang.Umumiy mahsulotlar soni ${total}`,
    {
      reply_markup: {
        inline_keyboard: inlineKeyboards,
      },
    }
  );
});

scene.action(/^next_/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;
  const ordersTime = await prisma.orderTimes.findFirst({
    orderBy: {
      created_at: "desc",
    },
  });

  const page = Number(callbackData.split("_")[1]);

  console.log(callbackData);
  let categoryDatas = await getPaginatedProducts(
    ordersTime?.created_at || new Date(new Date().getTime() - 86400 * 1000),
    page,
    4
  );

  const total = categoryDatas.total;
  const categoryProducts = categoryDatas.products;

  if (total >= page * 4) {
    categoryProducts.push({
      text: "Keyingi sahifa",
      callback_data: `next_${page + 1}`,
    });
  }
  categoryProducts.push({
    text: "Oldingi sahifa",
    callback_data: `prev_${page - 1}`,
  });

  categoryProducts.push({
    text: "Asosiy menyuga qaytish",
    callback_data: "main_menu",
  });

  categoryProducts.push({
    text: "Yetkazilganligni tasdiqlash",
    callback_data: "leader",
  });
  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.editMessageText(
    `uyidagi mahsulotlardan o'chirmoqchi bo'lganingnizni tanlang.Umumiy mahsulotlar soni ${total}`,
    {
      reply_markup: {
        inline_keyboard: inlineKeyboards,
      },
    }
  );
});

scene.action(/^prev/, async (ctx: any) => {
  const callbackData = ctx.callbackQuery.data;

  const page = Number(callbackData.split("_")[1]);

  const ordersTime = await prisma.orderTimes.findFirst({
    orderBy: {
      created_at: "desc",
    },
  });
  console.log(callbackData);
  let categoryDatas = await getPaginatedProducts(
    ordersTime?.created_at || new Date(new Date().getTime() - 86400 * 1000),
    page,
    4
  );

  const total = categoryDatas.total;
  const categoryProducts = categoryDatas.products;

  if (page >= 1) {
    categoryProducts.push({
      text: "Keyingi sahifa",
      callback_data: `next_${page + 1}`,
    });
    if (page !== 1)
      categoryProducts.push({
        text: "Avvalgi sahifa",
        callback_data: `prev_${page - 1}`,
      });
  }

  categoryProducts.push({
    text: "Asosiy menyuga qaytish",
    callback_data: "main_menu",
  });

  categoryProducts.push({
    text: "Yetkazilganligni tasdiqlash",
    callback_data: "leader",
  });
  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.editMessageText(
    `uyidagi mahsulotlardan o'chirmoqchi bo'lganingnizni tanlang.Umumiy mahsulotlar soni ${total}`,
    {
      reply_markup: {
        inline_keyboard: inlineKeyboards,
      },
    }
  );
});
scene.action(/^aziz/, async (ctx: any) => {
  const id = ctx.from.id;

  console.log(ctx.update.callback_query);
  const messageId = ctx.update.callback_query.message.message_id;
  const inlineMessageId = ctx.update.callback_query.inline_message_id;
  const query = ctx.update.callback_query.data.split("_")[1];
  const page = Number(ctx.update.callback_query.data.split("_")[2]);
  const isProduct = await prisma.orderProducts.findFirst({
    where: {
      id: query,
    },
    include: {
      order: true,
      product: true,
    },
  });

  if (!isProduct) {
    ctx.reply("Bunday mahsulot topilmadi");
    return;
  }
  const userId = isProduct.order.userId;

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      branch: true,
    },
  });

  if (!user) {
    ctx.reply("Foydalanuvchi topilmadi");
    return;
  }
  const deleteProduct = await prisma.orderProducts.delete({
    where: {
      id: query,
    },
  });

  const trashCreate = await prisma.trash.create({
    data: {
      user_id: user.id,
      product_id: isProduct.product.id,
      name: isProduct.product.name,
      count: String(isProduct?.count || 0),
    },
  });

  const ordersTime = await prisma.orderTimes.findFirst({
    orderBy: {
      created_at: "desc",
    },
  });

  const products = await getPaginatedProducts(
    ordersTime?.created_at || new Date(new Date().getTime() - 24 * 3600 * 1000),
    Number(page),
    4
  );

  const total = products.total;
  const categoryProducts = products.products;

  if (total >= page * 4) {
    categoryProducts.push({
      text: "Keyingi sahifa",
      callback_data: `next_${page + 1}`,
    });
  }
  categoryProducts.push({
    text: "Oldingi sahifa",
    callback_data: `prev_${page - 1}`,
  });

  categoryProducts.push({
    text: "Asosiy menyuga qaytish",
    callback_data: "main_menu",
  });
  categoryProducts.push({
    text: "Yetkazilganligni tasdiqlash",
    callback_data: "leader",
  });
  const inlineKeyboards = chunkArrayInline(categoryProducts, 1);

  console.log(inlineKeyboards);
  await ctx.editMessageText(
    `Quyidagi mahsulotlardan o'chirmoqchi bo'lganingnizni tanlang.Umumiy mahsulotlar soni ${total}`,
    {
      reply_markup: {
        inline_keyboard: inlineKeyboards,
      },
    }
  );

  // ctx.telegram.sendMessage(
  //   admin?.telegram_id,
  //   `#${user?.branch?.name}\n${text}  \n Yuborilgan <a href="tg://user?id=${user.telegram_id}">${user?.name}</a>`,
  //   {
  //     parse_mode: "HTML",
  //     reply_markup: {
  //       inline_keyboard: inlineKeyboard,
  //     },
  //   }
  // );
});

scene.action("leader", async (ctx: any) => {
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  const ordersTime = await prisma.orderTimes.create({
    data: {
      time: new Date(),
      user_id: String(user?.id),
    },
  });

  ctx.editMessageText("Buyurtmalar yetkazildi");
});

scene.hears("Filiallar", async (ctx: any) => {
  const branches = await prisma.branch.findMany({});
  let buttons = branches.map((item) => {
    return [
      {
        text: item.name,
        callback_data: item.id,
      },
    ];
  });

  ctx.reply("Filiallarimiz", {
    reply_markup: {
      inline_keyboard: buttons,
    },
  });

  return ctx.scene.enter("editFillials");
});

async function getPaginatedProducts(
  // prisma: any,
  times: Date,
  page: number,
  pageSize: number
) {
  const skip = (page - 1) * pageSize;

  const products = (
    await prisma.orderProducts.findMany({
      where: {
        created_at: {
          gte: times instanceof Date ? times.toISOString() : times,
        },
      },
      take: pageSize,
      skip: skip,
      include: {
        product: true,
      },
    })
  ).map((item: any) => {
    return {
      text: `${item.product.name}`,
      callback_data: `aziz_${item.id}_${page}`,
    };
  });

  const totalCount = await prisma.orderProducts.count({
    where: {
      created_at: {
        gte: times instanceof Date ? times.toISOString() : times,
      },
    },
  });

  return {
    products,
    total: totalCount,
  };
}

export default scene;
