import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Users,
  Milk,
  IndianRupee,
  FileSpreadsheet
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

const monthlyData = [
  { month: "Jul", revenue: 185000, expenses: 42000, profit: 143000, milk: 4200 },
  { month: "Aug", revenue: 195000, expenses: 45000, profit: 150000, milk: 4400 },
  { month: "Sep", revenue: 210000, expenses: 48000, profit: 162000, milk: 4650 },
  { month: "Oct", revenue: 225000, expenses: 52000, profit: 173000, milk: 4900 },
  { month: "Nov", revenue: 238000, expenses: 55000, profit: 183000, milk: 5100 },
  { month: "Dec", revenue: 245680, expenses: 69500, profit: 176180, milk: 5350 },
];

const customerMilkData = [
  { name: "Ramesh Kumar", regular: 150, extra: 10 },
  { name: "Suresh Patel", regular: 240, extra: 40 },
  { name: "Priya Sharma", regular: 90, extra: 0 },
  { name: "Vikram Yadav", regular: 300, extra: 50 },
  { name: "Meera Devi", regular: 120, extra: 0 },
];

const dailyMilkData = [
  { day: "Mon", morning: 280, evening: 205 },
  { day: "Tue", morning: 290, evening: 210 },
  { day: "Wed", morning: 275, evening: 195 },
  { day: "Thu", morning: 300, evening: 220 },
  { day: "Fri", morning: 285, evening: 200 },
  { day: "Sat", morning: 310, evening: 230 },
  { day: "Sun", morning: 295, evening: 215 },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);
  const totalMilk = monthlyData.reduce((sum, m) => sum + m.milk, 0);

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
                <p className="text-2xl font-display font-bold">₹{(totalRevenue/100000).toFixed(1)}L</p>
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
                <p className="text-2xl font-display font-bold">₹{(totalExpenses/100000).toFixed(1)}L</p>
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
                <p className="text-2xl font-display font-bold">₹{(totalProfit/100000).toFixed(1)}L</p>
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
                <p className="text-2xl font-display font-bold">{(totalMilk/1000).toFixed(1)}K L</p>
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
                <CardTitle className="text-lg font-display">Daily Milk Production</CardTitle>
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
                      <Legend />
                      <Bar dataKey="morning" fill="hsl(38, 92%, 50%)" name="Morning" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="evening" fill="hsl(200, 40%, 45%)" name="Evening" radius={[4, 4, 0, 0]} />
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
              <CardTitle className="text-lg font-display">Customer-wise Milk Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
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
                    <Legend />
                    <Bar dataKey="regular" fill="hsl(142, 52%, 36%)" name="Regular" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="extra" fill="hsl(38, 92%, 50%)" name="Extra" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
