import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  Filter,
  IndianRupee,
  Smartphone,
  Banknote,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Payment {
  id: string;
  bill_id: string;
  customer_id: string;
  amount: number;
  payment_mode: "cash" | "online" | "upi";
  payment_date: string;
  notes: string | null;
  customers: { name: string } | null;
  bills: { bill_number: string } | null;
}

const paymentModeIcons = {
  cash: Banknote,
  online: CreditCard,
  upi: Smartphone,
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("*, customers(name), bills(bill_number)")
      .order("payment_date", { ascending: false });

    if (error) {
      toast.error("Failed to fetch payments");
      console.error(error);
    } else {
      setPayments(data as Payment[] || []);
    }
    setIsLoading(false);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.bills?.bill_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === "all" || payment.payment_mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const cashTotal = payments.filter(p => p.payment_mode === "cash").reduce((sum, p) => sum + Number(p.amount), 0);
  const onlineTotal = payments.filter(p => p.payment_mode === "online").reduce((sum, p) => sum + Number(p.amount), 0);
  const upiTotal = payments.filter(p => p.payment_mode === "upi").reduce((sum, p) => sum + Number(p.amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Track all payment transactions</p>
        </div>
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
      {payments.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
          <p className="text-muted-foreground">Payments will appear here when bills are marked as paid</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const ModeIcon = paymentModeIcons[payment.payment_mode];
                  return (
                    <tr key={payment.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {payment.customers?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <span className="font-medium">{payment.customers?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="font-mono text-sm text-muted-foreground">
                        {payment.bills?.bill_number || "-"}
                      </td>
                      <td className="font-semibold text-success">₹{Number(payment.amount).toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ModeIcon className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="secondary" className="capitalize">
                            {payment.payment_mode}
                          </Badge>
                        </div>
                      </td>
                      <td className="font-medium">{payment.payment_date}</td>
                      <td className="text-muted-foreground">
                        {payment.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}