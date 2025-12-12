import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Filter,
  IndianRupee,
  Wallet,
  Smartphone,
  Banknote,
  TrendingUp
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

interface Payment {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  paymentMode: "cash" | "online" | "upi";
  date: string;
  time: string;
  status: "success" | "pending" | "failed";
  reference?: string;
}

const mockPayments: Payment[] = [
  { id: "PAY-001", invoiceId: "INV-2024-001", customerName: "Ramesh Kumar", amount: 9000, paymentMode: "upi", date: "2024-12-05", time: "10:30 AM", status: "success", reference: "UPI123456" },
  { id: "PAY-002", invoiceId: "INV-2024-003", customerName: "Priya Sharma", amount: 5400, paymentMode: "cash", date: "2024-12-04", time: "09:15 AM", status: "success" },
  { id: "PAY-003", invoiceId: "INV-2024-004", customerName: "Amit Singh", amount: 7000, paymentMode: "online", date: "2024-12-03", time: "02:45 PM", status: "success", reference: "NEFT789012" },
  { id: "PAY-004", invoiceId: "INV-2024-005", customerName: "Meera Devi", amount: 7200, paymentMode: "upi", date: "2024-12-02", time: "11:00 AM", status: "success", reference: "UPI654321" },
  { id: "PAY-005", invoiceId: "INV-2024-007", customerName: "Raj Malhotra", amount: 4500, paymentMode: "online", date: "2024-12-01", time: "04:30 PM", status: "pending", reference: "NEFT456789" },
];

const paymentModeIcons = {
  cash: Banknote,
  online: CreditCard,
  upi: Smartphone,
};

export default function Payments() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === "all" || payment.paymentMode === filterMode;
    return matchesSearch && matchesMode;
  });

  const totalCollected = payments.filter(p => p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const cashTotal = payments.filter(p => p.paymentMode === "cash" && p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const onlineTotal = payments.filter(p => p.paymentMode === "online" && p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const upiTotal = payments.filter(p => p.paymentMode === "upi" && p.status === "success").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track all payment transactions</p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-success/10">
                <IndianRupee className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{totalCollected.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Collected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-warning/10">
                <Banknote className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{cashTotal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Cash</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-info/10">
                <CreditCard className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{onlineTotal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-primary/10">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{upiTotal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">UPI</p>
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
        <Select value={filterMode} onValueChange={setFilterMode}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Payment Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date & Time</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const ModeIcon = paymentModeIcons[payment.paymentMode];
                return (
                  <tr key={payment.id}>
                    <td className="font-mono text-sm">{payment.id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {payment.customerName.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{payment.customerName}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm text-muted-foreground">{payment.invoiceId}</td>
                    <td className="font-semibold text-success">₹{payment.amount.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ModeIcon className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="secondary" className="capitalize">
                          {payment.paymentMode}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{payment.date}</p>
                        <p className="text-xs text-muted-foreground">{payment.time}</p>
                      </div>
                    </td>
                    <td className="font-mono text-sm">
                      {payment.reference || "-"}
                    </td>
                    <td>
                      <Badge 
                        variant="outline"
                        className={
                          payment.status === "success" ? "status-paid" : 
                          payment.status === "pending" ? "bg-warning/10 text-warning border-warning/20" :
                          "status-unpaid"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
