import path from "path";
import excelJs from "exceljs";
import prisma from "../../prisma/prisma";
import XLSX from "xlsx";
const insertProduct = async () => {
  try {
    const url = path.join(__dirname, "../../data/products.xlsx");
    const workbook = new excelJs.Workbook();
    await workbook.xlsx.readFile(url);

    const worksheet = await workbook.getWorksheet(1);
    let row = worksheet?.getRow(1);
    let data: any = [];

    worksheet?.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        // 1 - header satrni o'qimaymiz
        let rowData: any = [];
        row.eachCell((cell) => {
          rowData.push(cell.value);
        });
        data.push(rowData);
      }
      // console.log(data);
    });

    for (let i = 0; i < data.length; i++) {
      let product = data[i][0];
      const produtcs = await prisma.product.create({
        data: {
          name: product,
          description: data[i][0],
          price: 0,
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// insertProduct();

const updateproduct = async () => {
  let data = await prisma.product.updateMany({
    where: {},
    data: {
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  console.log(data);
};

// updateproduct();

const insertNewProduct = async () => {
  // const filePath = path.resolve(__dirname, "../data/test3.xlsx");
  const filePath = path.join(__dirname, "../../data/products.xlsx");

  // Faylni ochamiz
  const workbook = XLSX.readFile(filePath);

  // Birinchi ish varag'ini o'qiyapmiz
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Ma'lumotlarni JSON formatiga o'tkazamiz
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Telefonlar haqidagi ma'lumotlarni saqlash uchun yangi massiv
  const phones: any = data
    .map((row: any) => {
      if (row[0]) {
        return {
          name: row[0],
          memory: "",
          color: "",
          price: 0,
        };
      }
    })
    .filter((phone: any) => phone);

  // Ma'lumotlarni ko'rsatamiz
  console.log(phones);

  await prisma.product.deleteMany({});

  let count = 0;
  for (const phone of phones) {
    const product = await prisma.product.create({
      data: {
        name:
          String(phone.name) +
          " " +
          String(phone.memory || "").trim() +
          " " +
          String(phone.color || "").trim(),

        price: phone.price * 12750,
      },
    });
    count++;

    console.log(product, count);
  }

  console.log(`${count} products added`);
};

insertNewProduct();
