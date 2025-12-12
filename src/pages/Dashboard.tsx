import { 
  Users, 
  Milk, 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const stats = [
  {
    title: "Total Customers",
    value: "156",
    change: "+12",
    changeType: "positive",
    icon: Users,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Today's Milk",
    value: "485 L",
    subtitle: "Morning: 280L | Evening: 205L",
    icon: Milk,
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    title: "Monthly Revenue",
    value: "₹2,45,680",
    change: "+8.2%",
    changeType: "positive",
    icon: IndianRupee,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    title: "Unpaid Bills",
    value: "23",
    amount: "₹45,200",
    changeType: "warning",
    icon: FileText,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
];

const revenueData = [
  { month: "Jan", revenue: 180000, expenses: 45000 },
  { month: "Feb", revenue: 195000, expenses: 48000 },
  { month: "Mar", revenue: 210000, expenses: 52000 },
  { month: "Apr", revenue: 225000, expenses: 55000 },
  { month: "May", revenue: 238000, expenses: 58000 },
  { month: "Jun", revenue: 245680, expenses: 62000 },
];

const milkDistribution = [
  { name: "Cow Milk", value: 320, color: "hsl(35, 60%, 55%)" },
  { name: "Buffalo Milk", value: 165, color: "hsl(200, 40%, 45%)" },
];

const recentCustomers = [
  { id: 1, name: "Ramesh Kumar", type: "cow", quantity: "5L", status: "active" },
  { id: 2, name: "Suresh Patel", type: "buffalo", quantity: "8L", status: "active" },
  { id: 3, name: "Priya Sharma", type: "cow", quantity: "3L", status: "active" },
  { id: 4, name: "Amit Singh", type: "buffalo", quantity: "6L", status: "inactive" },
];

const recentBills = [
  { id: "INV-001", customer: "Ramesh Kumar", amount: "₹4,500", status: "paid" },
  { id: "INV-002", customer: "Suresh Patel", amount: "₹7,200", status: "unpaid" },
  { id: "INV-003", customer: "Priya Sharma", amount: "₹2,850", status: "paid" },
  { id: "INV-004", customer: "Amit Singh", amount: "₹5,400", status: "unpaid" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your farm overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            December 2024
          </Button>
          <Button size="sm">
            <Milk className="w-4 h-4 mr-2" />
            Add Milk Entry
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  )}
                  {stat.change && (
                    <div className="flex items-center gap-1">
                      {stat.changeType === "positive" ? (
                        <TrendingUp className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                      <span className={`text-xs font-medium ${
                        stat.changeType === "positive" ? "text-success" : "text-destructive"
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  )}
                  {stat.amount && (
                    <p className="text-sm font-medium text-warning">{stat.amount} pending</p>
                  )}
                </div>
                <div className={`stat-card-icon ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 52%, 36%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142, 52%, 36%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
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
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(142, 52%, 36%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Revenue"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="hsl(0, 72%, 51%)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorExpenses)" 
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Milk Distribution */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Milk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
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
                    formatter={(value: number) => [`${value}L`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {milkDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}L</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Customers */}
        <Card className="chart-container">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">Recent Customers</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCustomers.map((customer) => (
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
                      <p className="text-xs text-muted-foreground">{customer.quantity} daily</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      className={customer.type === "cow" ? "milk-type-cow" : "milk-type-buffalo"}
                    >
                      {customer.type}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={customer.status === "active" ? "status-paid" : "status-unpaid"}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bills */}
        <Card className="chart-container">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-display">Recent Bills</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div 
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bill.customer}</p>
                      <p className="text-xs text-muted-foreground">{bill.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{bill.amount}</span>
                    <Badge 
                      variant="outline"
                      className={bill.status === "paid" ? "status-paid" : "status-unpaid"}
                    >
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
