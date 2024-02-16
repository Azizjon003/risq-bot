const { Scenes } = require("telegraf");
import start from "./start";
import branches from "./branches";
import orderProducts from "./orderProducts";
const stage = new Scenes.Stage([start, branches, orderProducts]);

export default stage;
