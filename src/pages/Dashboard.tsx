import { useState, useEffect } from "react";
import { 
  Users, 
  Milk, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  todayMorningMilk: number;
  todayEveningMilk: number;
  monthlyRevenue: number;
  unpaidBillsCount: number;
  unpaidBillsAmount: number;
  cowMilkToday: number;
  buffaloMilkToday: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    todayMorningMilk: 0,
    todayEveningMilk: 0,
    monthlyRevenue: 0,
    unpaidBillsCount: 0,
    unpaidBillsAmount: 0,
    cowMilkToday: 0,
    buffaloMilkToday: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [recentBills, setRecentBills] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Fetch customers
      const { data: customers } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      // Fetch today's milk entries
      const { data: todayEntries } = await supabase
        .from("milk_entries")
        .select("*, customers(milk_type)")
        .eq("date", today);

      // Fetch unpaid bills
      const { data: unpaidBills } = await supabase
        .from("bills")
        .select("*")
        .eq("status", "unpaid");

      // Fetch this month's bills for revenue
      const { data: monthBills } = await supabase
        .from("bills")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      // Fetch recent bills with customer info
      const { data: bills } = await supabase
        .from("bills")
        .select("*, customers(name)")
        .order("created_at", { ascending: false })
        .limit(4);

      // Calculate stats
      const totalCustomers = customers?.length || 0;
      const activeCustomers = customers?.filter(c => c.is_active).length || 0;
      
      const morningMilk = todayEntries
        ?.filter(e => e.session === "morning" && e.delivered)
        .reduce((sum, e) => sum + Number(e.regular_quantity) + Number(e.extra_quantity || 0), 0) || 0;
      
      const eveningMilk = todayEntries
        ?.filter(e => e.session === "evening" && e.delivered)
        .reduce((sum, e) => sum + Number(e.regular_quantity) + Number(e.extra_quantity || 0), 0) || 0;

      const cowMilk = todayEntries
        ?.filter(e => e.customers?.milk_type === "cow" && e.delivered)
        .reduce((sum, e) => sum + Number(e.regular_quantity) + Number(e.extra_quantity || 0), 0) || 0;

      const buffaloMilk = todayEntries
        ?.filter(e => e.customers?.milk_type === "buffalo" && e.delivered)
        .reduce((sum, e) => sum + Number(e.regular_quantity) + Number(e.extra_quantity || 0), 0) || 0;

      const monthlyRevenue = monthBills?.reduce((sum, b) => sum + Number(b.final_amount), 0) || 0;
      const unpaidCount = unpaidBills?.length || 0;
      const unpaidAmount = unpaidBills?.reduce((sum, b) => sum + Number(b.final_amount), 0) || 0;

      setStats({
        totalCustomers,
        activeCustomers,
        todayMorningMilk: morningMilk,
        todayEveningMilk: eveningMilk,
        monthlyRevenue,
        unpaidBillsCount: unpaidCount,
        unpaidBillsAmount: unpaidAmount,
        cowMilkToday: cowMilk,
        buffaloMilkToday: buffaloMilk,
      });

      setRecentCustomers(customers?.slice(0, 4) || []);
      setRecentBills(bills || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const milkDistribution = [
    { name: "Cow Milk", value: stats.cowMilkToday, color: "hsl(35, 60%, 55%)" },
    { name: "Buffalo Milk", value: stats.buffaloMilkToday, color: "hsl(200, 40%, 45%)" },
  ];

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
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's Anoop's farm overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(), "MMMM yyyy")}
          </Button>
          <Button size="sm" onClick={() => navigate("/milk-entry")}>
            <Milk className="w-4 h-4 mr-2" />
            Add Milk Entry
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-display font-bold">{stats.totalCustomers}</p>
                <p className="text-xs text-muted-foreground">{stats.activeCustomers} active</p>
              </div>
              <div className="stat-card-icon bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Milk</p>
                <p className="text-2xl font-display font-bold">
                  {(stats.todayMorningMilk + stats.todayEveningMilk).toFixed(1)} L
                </p>
                <p className="text-xs text-muted-foreground">
                  Morning: {stats.todayMorningMilk.toFixed(1)}L | Evening: {stats.todayEveningMilk.toFixed(1)}L
                </p>
              </div>
              <div className="stat-card-icon bg-info/10">
                <Milk className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-display font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">This month</span>
                </div>
              </div>
              <div className="stat-card-icon bg-success/10">
                <IndianRupee className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Unpaid Bills</p>
                <p className="text-2xl font-display font-bold">{stats.unpaidBillsCount}</p>
                <p className="text-sm font-medium text-warning">₹{stats.unpaidBillsAmount.toLocaleString()} pending</p>
              </div>
              <div className="stat-card-icon bg-warning/10">
                <FileText className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Milk Distribution */}
        <Card className="chart-container lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Today's Milk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {stats.cowMilkToday + stats.buffaloMilkToday > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={milkDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {milkDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)}L`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No milk entries today
                </div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {milkDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium">{item.value.toFixed(1)}L</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card className="chart-container">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">Recent Customers</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/customers")}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCustomers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No customers yet</p>
              ) : (
                recentCustomers.map((customer) => (
                  <div 
                    key={customer.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.daily_quantity}L daily</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={customer.milk_type === "cow" ? "milk-type-cow" : "milk-type-buffalo"}
                      >
                        {customer.milk_type}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={customer.is_active ? "status-paid" : "status-unpaid"}
                      >
                        {customer.is_active ? "active" : "inactive"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bills */}
        <Card className="chart-container">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">Recent Bills</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/bills")}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBills.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No bills yet</p>
              ) : (
                recentBills.map((bill) => (
                  <div 
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{bill.customers?.name}</p>
                        <p className="text-xs text-muted-foreground">{bill.bill_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">₹{Number(bill.final_amount).toLocaleString()}</span>
                      <Badge 
                        variant="outline"
                        className={bill.status === "paid" ? "status-paid" : "status-unpaid"}
                      >
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
