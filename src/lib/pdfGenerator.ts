import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BillData {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  month: number;
  year: number;
  entries: {
    date: string;
    session: string;
    regularQuantity: number;
    extraQuantity: number;
    ratePerLiter: number;
    totalAmount: number;
  }[];
  totalLiters: number;
  totalAmount: number;
  discount: number;
  lateFee: number;
  finalAmount: number;
  invoiceHeader: string;
  invoiceFooter: string;
}

export function generateBillPDF(bill: BillData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(34, 84, 61);
  doc.text(bill.invoiceHeader, pageWidth / 2, 25, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Farm Management System", pageWidth / 2, 32, { align: "center" });
  
  // Invoice details
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Invoice: ${bill.id}`, 15, 50);
  
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  doc.text(`Period: ${monthNames[bill.month - 1]} ${bill.year}`, 15, 58);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 15, 50, { align: "right" });
  
  // Customer details
  doc.setFillColor(245, 245, 245);
  doc.rect(15, 65, pageWidth - 30, 25, "F");
  
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("Bill To:", 20, 75);
  doc.setFontSize(12);
  doc.text(bill.customerName, 20, 82);
  if (bill.customerPhone) {
    doc.setFontSize(10);
    doc.text(bill.customerPhone, 20, 88);
  }
  
  // Table of entries
  const tableData = bill.entries.map(entry => [
    entry.date,
    entry.session.charAt(0).toUpperCase() + entry.session.slice(1),
    `${entry.regularQuantity.toFixed(2)} L`,
    `${entry.extraQuantity.toFixed(2)} L`,
    `${(entry.regularQuantity + entry.extraQuantity).toFixed(2)} L`,
    `₹${entry.ratePerLiter}`,
    `₹${entry.totalAmount.toFixed(2)}`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [["Date", "Session", "Regular", "Extra", "Total", "Rate", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [34, 84, 61],
      textColor: 255,
      fontStyle: "bold"
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      6: { halign: "right" }
    }
  });
  
  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(pageWidth - 85, finalY, 70, 45, "F");
  
  doc.setFontSize(10);
  doc.text("Total Liters:", pageWidth - 80, finalY + 10);
  doc.text(`${bill.totalLiters.toFixed(2)} L`, pageWidth - 20, finalY + 10, { align: "right" });
  
  doc.text("Subtotal:", pageWidth - 80, finalY + 18);
  doc.text(`₹${bill.totalAmount.toFixed(2)}`, pageWidth - 20, finalY + 18, { align: "right" });
  
  if (bill.discount > 0) {
    doc.text("Discount:", pageWidth - 80, finalY + 26);
    doc.text(`-₹${bill.discount.toFixed(2)}`, pageWidth - 20, finalY + 26, { align: "right" });
  }
  
  if (bill.lateFee > 0) {
    doc.text("Late Fee:", pageWidth - 80, finalY + 34);
    doc.text(`+₹${bill.lateFee.toFixed(2)}`, pageWidth - 20, finalY + 34, { align: "right" });
  }
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 84, 61);
  doc.text("Total Amount:", pageWidth - 80, finalY + 42);
  doc.text(`₹${bill.finalAmount.toFixed(2)}`, pageWidth - 20, finalY + 42, { align: "right" });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text(bill.invoiceFooter, pageWidth / 2, 280, { align: "center" });
  
  // Save
  doc.save(`Invoice_${bill.id}_${bill.customerName.replace(/\s+/g, "_")}.pdf`);
}
