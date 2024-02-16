import { Scenes } from "telegraf";

const scene = new Scenes.BaseScene("start");

scene.on("message", async (ctx) => {
  const text = ctx.update.message;
  console.log(text);
  ctx.reply("Welcome to the Azizjon!");
});

export default scene;
