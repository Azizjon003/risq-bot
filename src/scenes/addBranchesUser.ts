import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("addBranchesUser");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

scene.action(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i, async (ctx: any) => {
  const branchId = ctx.update.callback_query?.data;
  const id = ctx.from.id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(id),
    },
  });

  if (!user) {
    return ctx.reply("Foydalanuvchi topilmadi");
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
    },
  });

  if (!branch) {
    return ctx.reply("Filial topilmadi");
  }

  const users = await prisma.user.findMany({
    where: {
      branchId: branchId,
    },
  });

  let buttons = [];

  for (let user of users) {
    buttons.push([
      {
        text: user.name,
        callback_data: user.id,
      },
    ]);
  }

  buttons.push([
    {
      text: "Orqaga",
      callback_data: "back",
    },
  ]);
  buttons.push([
    {
      text: "Yangi foydalanuvchi qo'shish",
      callback_data: "add",
    },
  ]);
  buttons.push([
    {
      text: "Foydalanuvchini o'chirish",
      callback_data: "deleteuser",
    },
  ]);

  let text = `Filial nomi: ${branch.name}. Foydalanuvchilar ro'yxati`;
  ctx.reply(text, {
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
  ctx.session.user = {
    current_action: "handle_branch",
    branch_id: branchId,
  };
});

scene.action("add", async (ctx: any) => {
  const text = ctx.update.callback_query?.data;
  const branchId = ctx.session.user.branch_id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  ctx.session.user = {
    current_action: "new_user",
    branch_id: branchId,
  };

  const txt = "Yangi foydalanuvchini qo'shish uchun uning idsini kiriting";
  ctx.reply(txt);
});
scene.action("deleteuser", async (ctx: any) => {
  const text = ctx.update.callback_query?.data;
  const branchId = ctx.session.user.branch_id;
  const user = await prisma.user.findFirst({
    where: {
      telegram_id: String(ctx.from.id),
    },
  });

  ctx.session.user = {
    current_action: "delete_action",
    branch_id: branchId,
  };

  const txt = "Foydalanuvchini o'chirish uchun uning idsini kiriting";
  ctx.reply(txt);
});

scene.hears(/^[0-9]+$/, async (ctx: any) => {
  const handle = ctx.session.user.current_action;
  const branchId = ctx.session.user.branch_id;
  const id = ctx.from.id;
  const userId = ctx.update.message?.text;

  if (handle === "new_user") {
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(userId),
      },
    });

    if (!user) {
      return ctx.reply("Foydalanuvchi mavjud emas");
    }

    await prisma.user.update({
      where: {
        telegram_id: String(userId),
      },
      data: {
        telegram_id: String(userId),
        branchId: branchId,
      },
    });

    ctx.reply("Foydalanuvchi qo'shildi");
    return ctx.scene.enter("admin");
  } else if (handle === "delete_action") {
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(userId),
      },
    });

    if (!user) {
      return ctx.reply("Foydalanuvchi mavjud emas");
    }

    await prisma.user.update({
      where: {
        telegram_id: String(userId),
      },
      data: {
        telegram_id: String(userId),
        branchId: "",
      },
    });

    ctx.reply("Foydalanuvchi o'chirildi");
    return ctx.scene.enter("admin");
  }
});

export default scene;
