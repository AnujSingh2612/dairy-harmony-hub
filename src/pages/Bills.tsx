import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Plus,
  Calendar,
  User
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateBillPDF } from "@/lib/pdfGenerator";

interface Bill {
  id: string;
  customer_id: string;
  bill_number: string;
  month: number;
  year: number;
  total_liters: number;
  total_amount: number;
  discount: number;
  late_fee: number;
  final_amount: number;
  status: "paid" | "unpaid";
  payment_mode: "cash" | "online" | "upi" | null;
  customers: { name: string; phone: string | null; address: string | null };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

interface MilkEntry {
  id: string;
  customer_id: string;
  date: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // New states for bill generation
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [billPreview, setBillPreview] = useState<{
    entries: MilkEntry[];
    totalLiters: number;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    fetchBills();
    fetchCustomers();
  }, []);

  const fetchBills = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("bills")
      .select("*, customers(name, phone, address)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch bills");
    } else {
      setBills(data as Bill[] || []);
    }
    setIsLoading(false);
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to fetch customers");
    } else {
      setCustomers(data || []);
    }
  };

  const generateBillPreview = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    setIsGenerating(true);

    // Fetch milk entries for the selected month and customer
    const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

    const { data: entries, error } = await supabase
      .from("milk_entries")
      .select("*")
      .eq("customer_id", selectedCustomerId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date");

    if (error) {
      toast.error("Failed to fetch milk entries");
      setIsGenerating(false);
      return;
    }

    if (!entries || entries.length === 0) {
      toast.error("No milk entries found for this period");
      setIsGenerating(false);
      return;
    }

    const totalLiters = entries.reduce((sum, entry) => sum + Number(entry.quantity), 0);
    const totalAmount = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);

    setBillPreview({
      entries: entries as MilkEntry[],
      totalLiters,
      totalAmount
    });

    setIsGenerating(false);
  };

  const handleGenerateBill = async () => {
    if (!billPreview || !selectedCustomerId) {
      toast.error("Please generate preview first");
      return;
    }

    setIsGenerating(true);

    // Check if bill already exists
    const { data: existingBill } = await supabase
      .from("bills")
      .select("id")
      .eq("customer_id", selectedCustomerId)
      .eq("month", selectedMonth)
      .eq("year", selectedYear)
      .single();

    if (existingBill) {
      toast.error("Bill already exists for this period");
      setIsGenerating(false);
      return;
    }

    // Generate bill number
    const billNumber = `BILL-${selectedYear}${String(selectedMonth).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    // Insert bill
    const { error } = await supabase
      .from("bills")
      .insert({
        customer_id: selectedCustomerId,
        bill_number: billNumber,
        month: selectedMonth,
        year: selectedYear,
        total_liters: billPreview.totalLiters,
        total_amount: billPreview.totalAmount,
        discount: 0,
        late_fee: 0,
        final_amount: billPreview.totalAmount,
        status: "unpaid"
      });

    if (error) {
      toast.error("Failed to generate bill");
    } else {
      toast.success("Bill generated successfully");
      setIsGenerateModalOpen(false);
      setBillPreview(null);
      setSelectedCustomerId("");
      fetchBills();
    }

    setIsGenerating(false);
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bill.bill_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || bill.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = bills.reduce((sum, b) => sum + Number(b.final_amount), 0);
  const paidAmount = bills.filter(b => b.status === "paid").reduce((sum, b) => sum + Number(b.final_amount), 0);
  const unpaidAmount = totalAmount - paidAmount;

  const handleMarkAsPaid = async (billId: string, mode: "cash" | "online" | "upi") => {
    const { error } = await supabase
      .from("bills")
      .update({ status: "paid", payment_mode: mode, payment_date: new Date().toISOString().split('T')[0] })
      .eq("id", billId);

    if (error) {
      toast.error("Failed to update bill");
    } else {
      toast.success("Bill marked as paid");
      fetchBills();
    }
  };

  const handleDownloadPDF = async (bill: Bill) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    
    generateBillPDF({
      id: bill.bill_number,
      customerName: bill.customers?.name || "Customer",
      customerPhone: bill.customers?.phone || undefined,
      month: bill.month,
      year: bill.year,
      entries: [],
      totalLiters: Number(bill.total_liters),
      totalAmount: Number(bill.total_amount),
      discount: Number(bill.discount),
      lateFee: Number(bill.late_fee),
      finalAmount: Number(bill.final_amount),
      invoiceHeader: "Anoop Dairy",
      invoiceFooter: "Thank you for your business!",
    });
    toast.success("PDF downloaded");
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Monthly Bills</h1>
          <p className="text-muted-foreground">Generate and manage customer invoices</p>
        </div>
        <Button onClick={() => setIsGenerateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Bill
        </Button>
      </div>

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
                <p className="text-sm text-muted-foreground">Collected</p>
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
          </SelectContent>
        </Select>
      </div>

      {bills.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bills yet</h3>
          <p className="text-muted-foreground mb-4">Bills will appear here once generated</p>
          <Button onClick={() => setIsGenerateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Generate Your First Bill
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Period</th>
                  <th>Liters</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="font-mono text-sm">{bill.bill_number}</td>
                    <td className="font-medium">{bill.customers?.name}</td>
                    <td>{`${monthNames[bill.month - 1]} ${bill.year}`}</td>
                    <td>{Number(bill.total_liters).toFixed(1)}L</td>
                    <td className="font-semibold">₹{Number(bill.final_amount).toLocaleString()}</td>
                    <td>
                      <Badge variant="outline" className={bill.status === "paid" ? "status-paid" : "status-unpaid"}>
                        {bill.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(bill)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {bill.status !== "paid" && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(bill.id, "cash")} className="text-success">
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
      )}

      {/* Generate Bill Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Monthly Bill</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer and Period Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold mb-2">Customer</label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Month</label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateBillPreview} disabled={isGenerating || !selectedCustomerId} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Preview
                </>
              )}
            </Button>

            {/* Bill Preview */}
            {billPreview && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-semibold">
                        {customers.find(c => c.id === selectedCustomerId)?.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {monthNames[selectedMonth - 1]} {selectedYear}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Entries:</span>
                      <span className="font-semibold">{billPreview.entries.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Liters:</span>
                      <span className="font-semibold">{billPreview.totalLiters.toFixed(2)}L</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg text-primary">₹{billPreview.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button onClick={handleGenerateBill} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Confirm & Generate Bill
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
