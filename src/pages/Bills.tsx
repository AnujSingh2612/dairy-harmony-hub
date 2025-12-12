import { useState } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Bill {
  id: string;
  customerId: number;
  customerName: string;
  month: string;
  totalLiters: number;
  regularLiters: number;
  extraLiters: number;
  ratePerLiter: number;
  totalAmount: number;
  status: "paid" | "unpaid" | "partial";
  paidAmount: number;
  paymentMode?: "cash" | "online" | "upi";
  generatedDate: string;
  dueDate: string;
}

const mockBills: Bill[] = [
  { id: "INV-2024-001", customerId: 1, customerName: "Ramesh Kumar", month: "November 2024", totalLiters: 150, regularLiters: 140, extraLiters: 10, ratePerLiter: 60, totalAmount: 9000, status: "paid", paidAmount: 9000, paymentMode: "upi", generatedDate: "2024-12-01", dueDate: "2024-12-10" },
  { id: "INV-2024-002", customerId: 2, customerName: "Suresh Patel", month: "November 2024", totalLiters: 240, regularLiters: 200, extraLiters: 40, ratePerLiter: 80, totalAmount: 19200, status: "unpaid", paidAmount: 0, generatedDate: "2024-12-01", dueDate: "2024-12-10" },
  { id: "INV-2024-003", customerId: 3, customerName: "Priya Sharma", month: "November 2024", totalLiters: 90, regularLiters: 90, extraLiters: 0, ratePerLiter: 60, totalAmount: 5400, status: "paid", paidAmount: 5400, paymentMode: "cash", generatedDate: "2024-12-01", dueDate: "2024-12-10" },
  { id: "INV-2024-004", customerId: 4, customerName: "Amit Singh", month: "November 2024", totalLiters: 180, regularLiters: 160, extraLiters: 20, ratePerLiter: 80, totalAmount: 14400, status: "partial", paidAmount: 7000, paymentMode: "online", generatedDate: "2024-12-01", dueDate: "2024-12-10" },
  { id: "INV-2024-005", customerId: 5, customerName: "Meera Devi", month: "November 2024", totalLiters: 120, regularLiters: 120, extraLiters: 0, ratePerLiter: 60, totalAmount: 7200, status: "paid", paidAmount: 7200, paymentMode: "upi", generatedDate: "2024-12-01", dueDate: "2024-12-10" },
  { id: "INV-2024-006", customerId: 6, customerName: "Vikram Yadav", month: "November 2024", totalLiters: 300, regularLiters: 250, extraLiters: 50, ratePerLiter: 85, totalAmount: 25500, status: "unpaid", paidAmount: 0, generatedDate: "2024-12-01", dueDate: "2024-12-10" },
];

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const paidAmount = bills.reduce((sum, b) => sum + b.paidAmount, 0);
  const unpaidAmount = totalAmount - paidAmount;
  const paidCount = bills.filter(b => b.status === "paid").length;

  const handleMarkAsPaid = (billId: string) => {
    setBills(bills.map(b => 
      b.id === billId 
        ? { ...b, status: "paid" as const, paidAmount: b.totalAmount, paymentMode: "cash" as const }
        : b
    ));
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Monthly Bills</h1>
          <p className="text-muted-foreground">Generate and manage customer invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Select Month
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate All Bills
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{bills.length}</p>
                <p className="text-sm text-muted-foreground">Total Bills</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{paidAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Collected ({paidCount})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-destructive/10">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{unpaidAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-info/10">
                <span className="text-info font-bold text-lg">₹</span>
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Month</th>
                <th>Liters</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td className="font-mono text-sm">{bill.id}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {bill.customerName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{bill.customerName}</span>
                    </div>
                  </td>
                  <td>{bill.month}</td>
                  <td>
                    <div>
                      <span className="font-medium">{bill.totalLiters}L</span>
                      {bill.extraLiters > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{bill.extraLiters} extra)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="font-semibold">₹{bill.totalAmount.toLocaleString()}</td>
                  <td>
                    <Badge 
                      variant="outline"
                      className={
                        bill.status === "paid" ? "status-paid" : 
                        bill.status === "partial" ? "bg-warning/10 text-warning border-warning/20" :
                        "status-unpaid"
                      }
                    >
                      {bill.status}
                      {bill.status === "partial" && ` (₹${bill.paidAmount})`}
                    </Badge>
                  </td>
                  <td>
                    {bill.paymentMode ? (
                      <Badge variant="secondary" className="capitalize">
                        {bill.paymentMode}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleViewBill(bill)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Printer className="w-4 h-4" />
                      </Button>
                      {bill.status !== "paid" && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsPaid(bill.id)}
                          className="text-success hover:text-success"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bill Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">Invoice Preview</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-display font-bold text-primary">DairyFlow</h3>
                  <p className="text-sm text-muted-foreground">Farm Management System</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">{selectedBill.id}</p>
                  <p className="text-sm text-muted-foreground">{selectedBill.month}</p>
                </div>
              </div>

              <div className="border-t border-b border-border py-4">
                <h4 className="font-semibold mb-2">Bill To:</h4>
                <p className="font-medium">{selectedBill.customerName}</p>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Regular Milk</td>
                    <td className="text-right">{selectedBill.regularLiters} L</td>
                    <td className="text-right">₹{selectedBill.ratePerLiter}</td>
                    <td className="text-right">₹{(selectedBill.regularLiters * selectedBill.ratePerLiter).toLocaleString()}</td>
                  </tr>
                  {selectedBill.extraLiters > 0 && (
                    <tr>
                      <td className="py-2">Extra Milk</td>
                      <td className="text-right">{selectedBill.extraLiters} L</td>
                      <td className="text-right">₹{selectedBill.ratePerLiter}</td>
                      <td className="text-right">₹{(selectedBill.extraLiters * selectedBill.ratePerLiter).toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-semibold">
                    <td colSpan={3} className="py-3">Total Amount</td>
                    <td className="text-right text-lg text-primary">₹{selectedBill.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
