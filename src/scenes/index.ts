const { Scenes } = require("telegraf");
import start from "./start";
import branches from "./branches";
const stage = new Scenes.Stage([start, branches]);

export default stage;
