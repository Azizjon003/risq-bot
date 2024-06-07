const ExcelJS = require("exceljs");
const fs = require("fs");

// Ma'lumotlar
export const addAllDataToExcel = async (filename: any, data: any) => {
  // Excel fayl yaratish
  const workbook = new ExcelJS.Workbook();

  // Products sahifasini yaratish
  const productsSheet = workbook.addWorksheet("Products");

  // Products sahifasi uchun sarlavhalar
  productsSheet.columns = [
    { header: "Product", key: "product", width: 30 },
    { header: "Count", key: "count", width: 10 },
    { header: "Branch", key: "branch", width: 20 },
    { header: "Created At", key: "created_at", width: 20 },
  ];

  // Products ma'lumotlarini sahifaga yozish
  productsSheet.addRows(data.products);

  // Trash sahifasini yaratish
  const trashSheet = workbook.addWorksheet("Trash");

  // Trash sahifasi uchun sarlavhalar
  trashSheet.columns = [
    { header: "Product", key: "product", width: 30 },
    { header: "Count", key: "count", width: 10 },
    { header: "Branch", key: "branch", width: 20 },
    { header: "Created At", key: "created_at", width: 20 },
  ];

  // Trash ma'lumotlarini sahifaga yozish
  trashSheet.addRows(data.trash);

  // Faylga yozish

  try {
    let datas = await workbook.xlsx.writeFile(filename);
    return true;
  } catch (error) {
    console.error("Xato yuz berdi: ", error);
    return false;
  }
};
