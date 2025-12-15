import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Milk,
  IndianRupee,
  FileSpreadsheet,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [customerMilkData, setCustomerMilkData] = useState<any[]>([]);
  const [dailyMilkData, setDailyMilkData] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    totalMilk: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const monthsCount = selectedPeriod === "1month" ? 1 : selectedPeriod === "3months" ? 3 : selectedPeriod === "6months" ? 6 : 12;
      const startDate = startOfMonth(subMonths(new Date(), monthsCount - 1));
      const endDate = endOfMonth(new Date());

      // Fetch milk entries for revenue calculation
      const { data: milkEntries, error: milkError } = await supabase
        .from("milk_entries")
        .select("*, customers(name)")
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
        .eq("delivered", true);

      if (milkError) throw milkError;

      // Fetch expenses
      const { data: expenses, error: expenseError } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      if (expenseError) throw expenseError;

      // Calculate monthly data
      const monthlyStats: { [key: string]: { revenue: number; expenses: number; milk: number } } = {};
      
      for (let i = 0; i < monthsCount; i++) {
        const monthDate = subMonths(new Date(), monthsCount - 1 - i);
        const monthKey = format(monthDate, "MMM yyyy");
        monthlyStats[monthKey] = { revenue: 0, expenses: 0, milk: 0 };
      }

      // Process milk entries
      (milkEntries || []).forEach((entry) => {
        const monthKey = format(new Date(entry.date), "MMM yyyy");
        if (monthlyStats[monthKey]) {
          const amount = Number(entry.total_amount) || 0;
          const liters = Number(entry.regular_quantity) + Number(entry.extra_quantity || 0);
          monthlyStats[monthKey].revenue += amount;
          monthlyStats[monthKey].milk += liters;
        }
      });

      // Process expenses
      (expenses || []).forEach((expense) => {
        const monthKey = format(new Date(expense.date), "MMM yyyy");
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].expenses += Number(expense.amount) || 0;
        }
      });

      // Convert to array format for charts
      const monthlyChartData = Object.entries(monthlyStats).map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue),
        expenses: Math.round(data.expenses),
        profit: Math.round(data.revenue - data.expenses),
        milk: Math.round(data.milk * 10) / 10,
      }));

      setMonthlyData(monthlyChartData);

      // Calculate customer-wise milk consumption
      const customerStats: { [key: string]: number } = {};
      (milkEntries || []).forEach((entry) => {
        const customerName = entry.customers?.name || "Unknown";
        const liters = Number(entry.regular_quantity) + Number(entry.extra_quantity || 0);
        customerStats[customerName] = (customerStats[customerName] || 0) + liters;
      });

      const customerChartData = Object.entries(customerStats)
        .map(([name, liters]) => ({ name, liters: Math.round(liters * 10) / 10 }))
        .sort((a, b) => b.liters - a.liters)
        .slice(0, 10);

      setCustomerMilkData(customerChartData);

      // Calculate daily milk data for current month
      const currentMonthStart = startOfMonth(new Date());
      const daysInMonth = eachDayOfInterval({ start: currentMonthStart, end: new Date() });

      const dailyStats: { [key: string]: number } = {};
      daysInMonth.forEach((day) => {
        dailyStats[format(day, "dd")] = 0;
      });

      (milkEntries || []).forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entryDate >= currentMonthStart && entryDate <= new Date()) {
          const dayKey = format(entryDate, "dd");
          const liters = Number(entry.regular_quantity) + Number(entry.extra_quantity || 0);
          dailyStats[dayKey] = (dailyStats[dayKey] || 0) + liters;
        }
      });

      const dailyChartData = Object.entries(dailyStats).map(([day, liters]) => ({
        day,
        liters: Math.round(liters * 10) / 10,
      }));

      setDailyMilkData(dailyChartData);

      // Calculate totals
      const totalRevenue = monthlyChartData.reduce((sum, m) => sum + m.revenue, 0);
      const totalExpenses = monthlyChartData.reduce((sum, m) => sum + m.expenses, 0);
      const totalMilk = monthlyChartData.reduce((sum, m) => sum + m.milk, 0);

      setTotals({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        totalMilk,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-2xl font-display font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analyze your farm's performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-success/10">
                <IndianRupee className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{totals.revenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{totals.expenses.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className={`text-2xl font-display font-bold ${totals.profit >= 0 ? "text-success" : "text-destructive"}`}>
                  ₹{totals.profit.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Net Profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-info/10">
                <Milk className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totals.totalMilk.toLocaleString()} L</p>
                <p className="text-sm text-muted-foreground">Total Milk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="profit" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-4">
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="milk">Milk Reports</TabsTrigger>
          <TabsTrigger value="customer">Customer Reports</TabsTrigger>
          <TabsTrigger value="expense">Expense Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="profit" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="text-lg font-display">Revenue vs Expenses vs Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 52%, 36%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(142, 52%, 36%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(199, 89%, 48%)" fill="hsl(199, 89%, 48%)" fillOpacity={0.2} name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.2} name="Expenses" />
                      <Area type="monotone" dataKey="profit" stroke="hsl(142, 52%, 36%)" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="text-lg font-display">Monthly Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="hsl(142, 52%, 36%)" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(142, 52%, 36%)", strokeWidth: 2 }}
                        name="Profit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milk" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="text-lg font-display">Daily Milk Production (Current Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyMilkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`${value} L`, ""]}
                      />
                      <Bar dataKey="liters" fill="hsl(199, 89%, 48%)" name="Liters" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="chart-container">
              <CardHeader>
                <CardTitle className="text-lg font-display">Monthly Milk Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`${value} L`, ""]}
                      />
                      <Area type="monotone" dataKey="milk" stroke="hsl(199, 89%, 48%)" fillOpacity={1} fill="url(#colorMilk)" name="Milk (L)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customer" className="mt-6">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-lg font-display">Customer-wise Milk Consumption (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {customerMilkData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available for the selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerMilkData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`${value} L`, ""]}
                      />
                      <Bar dataKey="liters" fill="hsl(142, 52%, 36%)" name="Total Liters" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="mt-6">
          <Card className="chart-container">
            <CardHeader>
              <CardTitle className="text-lg font-display">Monthly Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" name="Expenses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
