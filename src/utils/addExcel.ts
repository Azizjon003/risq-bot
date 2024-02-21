const ExcelJS = require("exceljs");

// Excel faylini yaratish uchun funktsiya
export async function createExcelFile(filename: any, data: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  // Ma'lumotlar qo'shish
  worksheet.addRow(["Nomi", "Soni", "Qachon buyurtma qilingangan"]);

  data.forEach((item: any) => {
    worksheet.addRow([item.name, item.count, item.created_at]);
  });

  // Faylni saqlash
  try {
    let data = await workbook.xlsx.writeFile(filename);
    return true;
  } catch (error) {
    console.error("Xato yuz berdi: ", error);
    return false;
  }
}
