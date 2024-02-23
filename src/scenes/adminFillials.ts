import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("adminFillials");
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

  ctx.session.user = {
    current_action: "handle_branch",
    branch_id: branchId,
  };

  let text = `Filial nomi: ${branch.name}.Bugungi kungi buyurtmalarni qabul qiling`;

  let product = await prisma.orderProducts.findMany({
    where: {
      order: {
        branchId: branchId,
      },
      created_at: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    include: {
      product: true,
    },
  });

  text += `Sizning buyurtmangiz: \n`;
  let umumiyNarx = 0;

  for (let i = 0; i < product.length; i++) {
    let txt = `${i + 1}. ${product[i].count} x ${product[i].product.name}\n`;
    text += txt;
  }

  ctx.reply(
    "Buyurtma qabul qilindi!" +
      `\n${text}  \n Qaytadan buyurtmaga mahsulot qo'shing`
  );

  return ctx.scene.enter("admin");
});
export default scene;
