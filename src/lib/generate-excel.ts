import * as XLSX from "xlsx";
import { Invoice } from "../types/invoice";

export function generateExcelFile(invoices: Invoice[], fileName: string) {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();

  // Convert invoices to worksheet format
  const worksheetData = invoices.map((invoice) => ({
    "Invoice ID": invoice.id,
    Customer: invoice.user.email,
    Amount: `${invoice.currency} ${invoice.amount}`,
    "Payment Method": invoice.paymentMethod,
    Date: new Date(invoice.createdAt).toLocaleDateString(),
    "Subscription Start": new Date(
      invoice.subscriptionPeriodStart
    ).toLocaleDateString(),
    "Subscription End": new Date(
      invoice.subscriptionPeriodEnd
    ).toLocaleDateString(),
    Status: invoice.status,
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create Blob
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.xlsx`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
