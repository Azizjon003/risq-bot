import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("addbranch");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));

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
  await prisma.user.update({
    where: {
      telegram_id: String(ctx.from.id),
    },
    data: {
      branchId: branchId,
    },
  });

  ctx.session.user = {
    branch_id: branchId,
  };
  ctx.reply("Siz filialga qo'shildingiz");
  return ctx.scene.enter("start");
});

export default scene;
