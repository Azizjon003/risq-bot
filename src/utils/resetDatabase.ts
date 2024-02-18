import prisma from "../../prisma/prisma";
const createBranch = async () => {
  // let users = await prisma.user.updateMany({
  //   where: {},
  //   data: { branchId: "65cf6a9424697b9fa6a770fe" },
  // });
  // console.log(users);
  let orders = await prisma.orderProducts.findMany({});
  console.log(orders);
};

createBranch();
