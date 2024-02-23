import { Scenes } from "telegraf";
import prisma from "../../prisma/prisma";
import { createInlineKeyboard } from "../utils/keyboards";
import { addInlineKeyboard } from "../utils/functions";

const scene = new Scenes.BaseScene("addproducts");
scene.hears("/start", (ctx: any) => ctx.scene.enter("start"));
scene.on("message", async (ctx: any) => {
  const action = ctx.session.user.action;
  const text = ctx.update.message?.text?.trim();
  if (action === "add") {
    ctx.session.user = {
      action: "add",
      name: text,
    };

    await prisma.product.create({
      data: {
        name: text,
        description: text,
        price: 0,
      },
    });
    ctx.reply("Mahsulot qo'shildi");
    return ctx.scene.enter("admin");
  } else if (action === "delete") {
    const product = await prisma.product.findUnique({
      where: {
        name: text,
      },
    });
    if (product) {
      await prisma.product.delete({
        where: {
          name: text,
        },
      });
      ctx.reply("Mahsulot o'chirildi");
      return ctx.scene.enter("admin");
    }
  }
});
export default scene;
