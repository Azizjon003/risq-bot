import { Markup } from "telegraf";

export const keyboards = (arr: any[]) => {
  let keyboard = Markup.keyboard(arr).resize();

  return keyboard;
};
