import * as XLSX from "xlsx";

export const readExcel = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        const fileData = event.target.result;
        const wb = XLSX.read(fileData, {
          type: "binary",
        });
        let s0 = wb.SheetNames[0];
        let blockArr = XLSX.utils.sheet_to_json(wb.Sheets[s0]);
        resolve(blockArr);
      };
      fileReader.readAsBinaryString(file);
    } catch (e) {
      reject(e);
    }
  });
};
