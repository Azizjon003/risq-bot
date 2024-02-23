const { Scenes } = require("telegraf");
import start from "./start";
import branches from "./branches";
import orderProducts from "./orderProducts";
import admin from "./admin";
import adminFillials from "./adminFillials";
import editFillials from "./fillialsEdit";
import addbranchUser from "./addBranchesUser";
import publicUsers from "./publicUsers";
import addBranch from "./addBranch";
import addProducts from "./addProducts";
const stage = new Scenes.Stage([
  start,
  branches,
  orderProducts,
  addBranch,
  admin,
  adminFillials,
  editFillials,
  addbranchUser,
  publicUsers,
  addProducts,
]);

export default stage;
