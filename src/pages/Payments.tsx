import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Search, 
  Filter,
  IndianRupee,
  Smartphone,
  Banknote,
  Loader2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface Bill {
  id: string;
  bill_number: string;
  customer_id: string;
  final_amount: number;
  status: string;
  customers: { name: string } | null;
}

const paymentModeIcons = {
  cash: Banknote,
  online: CreditCard,
  upi: Smartphone,
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [selectedBill, setSelectedBill] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online" | "upi">("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchUnpaidBills();
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

  const fetchUnpaidBills = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*, customers(name)")
      .eq("status", "unpaid")
      .order("bill_number", { ascending: false });

    if (error) {
      console.error("Failed to fetch unpaid bills:", error);
    } else {
      setUnpaidBills(data as Bill[] || []);
    }
  };

  const handleAddPayment = async () => {
    if (!selectedBill || !paymentAmount) {
      toast.error("Please select a bill and enter amount");
      return;
    }

    const bill = unpaidBills.find((b) => b.id === selectedBill);
    if (!bill) return;

    setSubmitting(true);
    try {
      // Create payment
      const { error: paymentError } = await supabase.from("payments").insert({
        bill_id: selectedBill,
        customer_id: bill.customer_id,
        amount: parseFloat(paymentAmount),
        payment_mode: paymentMode,
        notes: paymentNotes || null,
      });

      if (paymentError) throw paymentError;

      // Update bill status to paid
      const { error: billError } = await supabase
        .from("bills")
        .update({ 
          status: "paid", 
          payment_mode: paymentMode,
          payment_date: format(new Date(), "yyyy-MM-dd")
        })
        .eq("id", selectedBill);

      if (billError) throw billError;

      toast.success("Payment recorded successfully");
      setDialogOpen(false);
      resetForm();
      fetchPayments();
      fetchUnpaidBills();
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedBill("");
    setPaymentAmount("");
    setPaymentMode("cash");
    setPaymentNotes("");
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>
                Select an unpaid bill and record the payment details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Bill</Label>
                <Select value={selectedBill} onValueChange={(value) => {
                  setSelectedBill(value);
                  const bill = unpaidBills.find(b => b.id === value);
                  if (bill) {
                    setPaymentAmount(bill.final_amount.toString());
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unpaid bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {unpaidBills.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No unpaid bills
                      </SelectItem>
                    ) : (
                      unpaidBills.map((bill) => (
                        <SelectItem key={bill.id} value={bill.id}>
                          {bill.bill_number} - {bill.customers?.name} - ₹{bill.final_amount}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(value: "cash" | "online" | "upi") =>
                    setPaymentMode(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPayment} disabled={submitting || !selectedBill}>
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          <p className="text-muted-foreground mb-4">Click "Add Payment" to record your first payment</p>
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
