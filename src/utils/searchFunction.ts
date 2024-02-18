import prisma from "../../prisma/prisma";

async function findProductByName(name: string) {
  const product = await prisma.product.findMany({
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
    },
    take: 50,
  });
  return product;
}

export default findProductByName;
