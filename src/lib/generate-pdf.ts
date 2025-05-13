import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Invoice } from "../types/invoice";

// Define proper type for autoTable options
interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: (string | number)[][];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: {
    fillColor?: number[];
    textColor?: number[];
    fontStyle?: string;
    fontSize?: number;
  };
  styles?: {
    fontSize?: number;
    font?: string;
    textColor?: number[];
    cellPadding?: number;
  };
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

// Update module declaration with proper type
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
  }
}

export function generatePDFFile(invoice: Invoice, fileName: string) {
  // Create new PDF document
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text("Invoice", 14, 22);

  // Add invoice details
  doc.setFontSize(12);
  const details: [string, string][] = [
    ["Invoice ID:", invoice.id],
    ["Customer:", invoice.user.email],
    ["Amount:", `${invoice.currency} ${invoice.amount}`],
    ["Payment Method:", invoice.paymentMethod],
    ["Date:", new Date(invoice.createdAt).toLocaleDateString()],
    [
      "Subscription Period:",
      `${new Date(
        invoice.subscriptionPeriodStart
      ).toLocaleDateString()} - ${new Date(
        invoice.subscriptionPeriodEnd
      ).toLocaleDateString()}`,
    ],
    ["Status:", invoice.status],
  ];

  // Add table
  doc.autoTable({
    startY: 30,
    head: [["Item", "Details"]],
    body: details,
    theme: "grid",
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 10 },
  });

  // Save PDF
  doc.save(`${fileName}.pdf`);
}