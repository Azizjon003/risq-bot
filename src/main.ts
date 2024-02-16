require("dotenv").config();
import { Context, Middleware } from "telegraf";
import bot from "./core/bot";
import session from "./core/session";
import botStart from "./utils/startBot";
import stage from "./scenes/index";
bot.use(session);

const middleware: Middleware<Context> = (ctx: any, next) => {
  ctx?.session ?? (ctx.session = {});
};
bot.use(stage.middleware());

bot.start((ctx) => ctx.reply("start"));

botStart(bot);
