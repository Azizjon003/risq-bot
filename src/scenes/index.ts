const { Scenes } = require("telegraf");
import start from "./start";
import branches from "./branches";
import orderProducts from "./orderProducts";
import admin from "./admin";
import adminFillials from "./adminFillials";
import editFillials from "./fillialsEdit";
import addbranchUser from "./addBranchesUser";
import publicUsers from "./publicUsers";
const stage = new Scenes.Stage([
  start,
  branches,
  orderProducts,
  admin,
  adminFillials,
  editFillials,
  addbranchUser,
  publicUsers,
]);

export default stage;
