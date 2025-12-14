import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter,
  TrendingDown,
  Calendar,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Expense {
  id: string;
  date: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  receipt_url: string | null;
  expense_categories: { id: string; name: string; icon: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

const categoryColors: Record<string, string> = {
  "Cow Food": "hsl(35, 60%, 55%)",
  "Medicine": "hsl(0, 72%, 51%)",
  "Labor": "hsl(200, 40%, 45%)",
  "Maintenance": "hsl(142, 52%, 36%)",
  "Transport": "hsl(38, 92%, 50%)",
  "Utilities": "hsl(280, 50%, 50%)",
  "Other": "hsl(220, 10%, 50%)",
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category_id: "",
    amount: 0,
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Fetch categories
    const { data: categoriesData } = await supabase
      .from("expense_categories")
      .select("*")
      .order("name");
    
    setCategories(categoriesData || []);

    // Fetch expenses
    const { data: expensesData, error } = await supabase
      .from("expenses")
      .select("*, expense_categories(id, name, icon)")
      .order("date", { ascending: false });

    if (error) {
      toast.error("Failed to fetch expenses");
      console.error(error);
    } else {
      setExpenses(expensesData as Expense[] || []);
    }
    setIsLoading(false);
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesCategory = filterCategory === "all" || expense.expense_categories?.name === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const categoryTotals = categories.map(cat => ({
    ...cat,
    color: categoryColors[cat.name] || categoryColors["Other"],
    total: expenses.filter(e => e.category_id === cat.id).reduce((sum, e) => sum + Number(e.amount), 0),
  }));

  const handleSave = async () => {
    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }
    if (formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from("expenses")
      .insert([{
        date: formData.date,
        category_id: formData.category_id,
        amount: formData.amount,
        description: formData.description || null,
      }]);

    if (error) {
      toast.error("Failed to add expense");
      console.error(error);
    } else {
      toast.success("Expense added successfully");
      setIsDialogOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category_id: "",
        amount: 0,
        description: "",
      });
      fetchData();
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete expense");
      console.error(error);
    } else {
      toast.success("Expense deleted");
      fetchData();
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
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Adding..." : "Add Expense"}
              </Button>
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
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-destructive">
              ₹{totalExpenses.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="stat-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-display">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTotals.some(c => c.total > 0) ? (
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
            ) : (
              <p className="text-muted-foreground text-center py-8">No expenses recorded yet</p>
            )}
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
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
          <p className="text-muted-foreground mb-4">Start tracking your farm expenses</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Expense
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const categoryName = expense.expense_categories?.name || "Uncategorized";
                  const color = categoryColors[categoryName] || categoryColors["Other"];
                  return (
                    <tr key={expense.id}>
                      <td className="font-medium">{expense.date}</td>
                      <td>
                        <Badge 
                          variant="secondary"
                          style={{ 
                            backgroundColor: `${color}20`,
                            color: color,
                            borderColor: `${color}40`,
                          }}
                          className="border"
                        >
                          {categoryName}
                        </Badge>
                      </td>
                      <td className="max-w-xs truncate">{expense.description || "-"}</td>
                      <td className="font-semibold text-destructive">₹{Number(expense.amount).toLocaleString()}</td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
      )}
    </div>
  );
}