const { Scenes } = require("telegraf");
import start from "./start";
import branches from "./branches";
import orderProducts from "./orderProducts";
import admin from "./admin";
import adminFillials from "./adminFillials";
import editFillials from "./fillialsEdit";
import addbranchUser from "./addBranchesUser";
const stage = new Scenes.Stage([
  start,
  branches,
  orderProducts,
  admin,
  adminFillials,
  editFillials,
  addbranchUser,
]);

export default stage;
