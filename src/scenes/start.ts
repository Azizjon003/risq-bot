import { Scenes } from "telegraf";
const scene = new Scenes.BaseScene("start");

scene.enter((ctx) => ctx.reply("start User"));

export default scene;
