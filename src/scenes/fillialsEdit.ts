import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";
import path from "path";
import { createExcelFile } from "../utils/addExcel";
import fs from "fs";

const scene = new Scenes.BaseScene("editFillials");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

scene.action("add", async (ctx: any) => {
  const text = ctx.update.callback_query?.data;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  if (user?.role !== "ADMIN") {
    return ctx.reply("Adminga mumkin faqat");
  }
  ctx.session.user = {
    current_action: "new_branch",
  };
  const txt = "Yangi filial nomini kiriting";
  ctx.reply(txt);
});

scene.action(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, async (ctx: any) => {
  const branchId = ctx.update.callback_query?.data;
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
    },
  });

  if (!branch) {
    return ctx.reply("Filial topilmadi");
  }

  ctx.session.user = {
    current_action: "handle_branch",
    branch_id: branchId,
  };

  let text = `Filial nomi: ${branch.name}.Necha kunlik buyurtmalar haqida ma'lumot olmoqchisiz?`;
  let buttons = [
    [
      {
        text: "1 kun",
        callback_data: "1",
      },
      {
        text: "3 kun",
        callback_data: "3",
      },
    ],
    [
      {
        text: "7 kun",
        callback_data: "7",
      },
      {
        text: "30 kun",
        callback_data: "30",
      },
    ],
  ];
  ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
});

scene.action(/^\d+$/, async (ctx: any) => {
  const numberOfDays = ctx.update.callback_query?.data;
  const id = ctx.from.id;
  const branchId = ctx.session.user.branch_id;
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
    },
  });

  if (!branch) return ctx.reply("Bunday fillial yo'q");
  const date = new Date(
    new Date().getTime() - Number(numberOfDays) * 86400 * 1000
  );
  const orders = await prisma.order.findMany({
    where: {
      created_at: {
        gte: date,
      },
      branchId: branchId,
    },
    include: {
      orderProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  let datas = [];
  for (let order of orders) {
    for (let orderProduct of order.orderProducts) {
      datas.push({
        name: orderProduct.product.name,
        count: orderProduct.count,
        created_at: order.created_at,
      });
    }
  }

  console.log(datas);
  datas = aggregateData(datas);

  let filename = path.join(__dirname, `../public/${branch.name}.xlsx`);

  const files = await createExcelFile(filename, datas);
  if (!files)
    return ctx.reply(
      "Faylni yuklashda xatolik qaytadan raqamni kiritib ko'ring"
    );
  await sleep(1000);

  const readFile = fs.readFileSync(filename);

  ctx.telegram.sendDocument(
    id,
    {
      source: readFile,
      filename: "data.xlsx",
    },
    {
      caption: `${numberOfDays} kunlik ma'lumot`,
    }
  );
  return ctx.scene.enter("admin");
});
scene.on("message", async (ctx: any) => {
  const text = ctx.update.message?.text?.trim();
  const id = ctx.from.id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(id),
    },
  });

  if (user?.role !== "ADMIN") {
    return ctx.reply("Adminga mumkin faqat");
  }

  const current_action = ctx.session.user.current_action;

  if (current_action === "new_branch") {
    const branch = await prisma.branch.create({
      data: {
        name: text,
        address: "",
      },
    });

    ctx.reply("Yangi fillial qo'shildi");
    return ctx.scene.enter("admin");
  }
});

export default scene;

export async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function aggregateData(data: any) {
  return data.reduce((acc: any, curr: any) => {
    const existingItemIndex = acc.findIndex(
      (item: any) => item.name === curr.name
    );
    if (existingItemIndex !== -1) {
      acc[existingItemIndex].count += curr.count;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
}
