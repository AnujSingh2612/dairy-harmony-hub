import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter,
  Receipt,
  TrendingDown,
  Calendar,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PieChart as RechartsPC,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  budget: number;
}

const categories: Category[] = [
  { id: "cow-food", name: "Cow Food", color: "hsl(35, 60%, 55%)", budget: 50000 },
  { id: "medicine", name: "Medicine", color: "hsl(0, 72%, 51%)", budget: 15000 },
  { id: "labor", name: "Labor", color: "hsl(200, 40%, 45%)", budget: 40000 },
  { id: "maintenance", name: "Maintenance", color: "hsl(142, 52%, 36%)", budget: 20000 },
  { id: "transport", name: "Transport", color: "hsl(38, 92%, 50%)", budget: 25000 },
  { id: "utilities", name: "Utilities", color: "hsl(280, 50%, 50%)", budget: 10000 },
];

const mockExpenses: Expense[] = [
  { id: 1, date: "2024-12-10", category: "Cow Food", amount: 12500, description: "Monthly cattle feed purchase" },
  { id: 2, date: "2024-12-09", category: "Medicine", amount: 3500, description: "Veterinary checkup and vaccines" },
  { id: 3, date: "2024-12-08", category: "Labor", amount: 25000, description: "Staff salaries" },
  { id: 4, date: "2024-12-07", category: "Maintenance", amount: 8000, description: "Milking machine repair" },
  { id: 5, date: "2024-12-06", category: "Transport", amount: 5500, description: "Fuel for delivery vehicles" },
  { id: 6, date: "2024-12-05", category: "Utilities", amount: 4200, description: "Electricity bill" },
  { id: 7, date: "2024-12-04", category: "Cow Food", amount: 8000, description: "Hay and fodder" },
  { id: 8, date: "2024-12-03", category: "Medicine", amount: 2800, description: "Antibiotics and supplements" },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: "",
    amount: 0,
    description: "",
  });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0),
  }));

  const handleSave = () => {
    const newExpense: Expense = {
      id: Math.max(...expenses.map(e => e.id)) + 1,
      ...formData,
    };
    setExpenses([newExpense, ...expenses]);
    setIsDialogOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: "",
      amount: 0,
      description: "",
    });
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Track and manage farm expenditures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Expense</DialogTitle>
              <DialogDescription>Record a new expense entry</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the expense"
                />
              </div>
              <div className="grid gap-2">
                <Label>Receipt (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Add Expense</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats and Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="stat-card lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              Monthly Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-destructive">
              ₹{totalExpenses.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">December 2024</p>
          </CardContent>
        </Card>

        <Card className="stat-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPC>
                    <Pie
                      data={categoryTotals.filter(c => c.total > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="total"
                    >
                      {categoryTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                    />
                  </RechartsPC>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                {categoryTotals.filter(c => c.total > 0).map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">₹{cat.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
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
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Date Range
        </Button>
      </div>

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => {
                const category = categories.find(c => c.name === expense.category);
                return (
                  <tr key={expense.id}>
                    <td className="font-medium">{expense.date}</td>
                    <td>
                      <Badge 
                        variant="secondary"
                        style={{ 
                          backgroundColor: `${category?.color}20`,
                          color: category?.color,
                          borderColor: `${category?.color}40`,
                        }}
                        className="border"
                      >
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="max-w-xs truncate">{expense.description}</td>
                    <td className="font-semibold text-destructive">₹{expense.amount.toLocaleString()}</td>
                    <td>
                      {expense.receiptUrl ? (
                        <Button variant="ghost" size="sm">
                          <Receipt className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(expense.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
