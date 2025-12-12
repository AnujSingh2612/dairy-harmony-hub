import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone,
  MapPin,
  Milk
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  milkType: "cow" | "buffalo";
  dailyQuantity: number;
  ratePerLiter: number;
  isActive: boolean;
  joinedDate: string;
}

const initialCustomers: Customer[] = [
  { id: 1, name: "Ramesh Kumar", phone: "+91 98765 43210", address: "Village Road, Sector 5", milkType: "cow", dailyQuantity: 5, ratePerLiter: 60, isActive: true, joinedDate: "2024-01-15" },
  { id: 2, name: "Suresh Patel", phone: "+91 98765 43211", address: "Main Street, Block A", milkType: "buffalo", dailyQuantity: 8, ratePerLiter: 80, isActive: true, joinedDate: "2024-02-20" },
  { id: 3, name: "Priya Sharma", phone: "+91 98765 43212", address: "Green Avenue, Plot 12", milkType: "cow", dailyQuantity: 3, ratePerLiter: 60, isActive: true, joinedDate: "2024-03-10" },
  { id: 4, name: "Amit Singh", phone: "+91 98765 43213", address: "Lake View Colony", milkType: "buffalo", dailyQuantity: 6, ratePerLiter: 80, isActive: false, joinedDate: "2024-01-05" },
  { id: 5, name: "Meera Devi", phone: "+91 98765 43214", address: "Temple Road, Near School", milkType: "cow", dailyQuantity: 4, ratePerLiter: 60, isActive: true, joinedDate: "2024-04-01" },
  { id: 6, name: "Vikram Yadav", phone: "+91 98765 43215", address: "Market Street, Shop 5", milkType: "buffalo", dailyQuantity: 10, ratePerLiter: 85, isActive: true, joinedDate: "2024-02-15" },
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    milkType: "cow" as "cow" | "buffalo",
    dailyQuantity: 0,
    ratePerLiter: 60,
    isActive: true,
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesType = filterType === "all" || customer.milkType === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        milkType: customer.milkType,
        dailyQuantity: customer.dailyQuantity,
        ratePerLiter: customer.ratePerLiter,
        isActive: customer.isActive,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        address: "",
        milkType: "cow",
        dailyQuantity: 0,
        ratePerLiter: 60,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingCustomer) {
      setCustomers(customers.map(c => 
        c.id === editingCustomer.id 
          ? { ...c, ...formData }
          : c
      ));
    } else {
      const newCustomer: Customer = {
        id: Math.max(...customers.map(c => c.id)) + 1,
        ...formData,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setCustomers([...customers, newCustomer]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const totalActive = customers.filter(c => c.isActive).length;
  const totalCow = customers.filter(c => c.milkType === "cow").length;
  const totalBuffalo = customers.filter(c => c.milkType === "buffalo").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage your milk delivery customers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Update customer details" : "Add a new customer to your delivery list"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Milk Type</Label>
                  <Select
                    value={formData.milkType}
                    onValueChange={(value: "cow" | "buffalo") => 
                      setFormData({ ...formData, milkType: value, ratePerLiter: value === "cow" ? 60 : 80 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cow">Cow Milk</SelectItem>
                      <SelectItem value="buffalo">Buffalo Milk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Daily Quantity (L)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.dailyQuantity}
                    onChange={(e) => setFormData({ ...formData, dailyQuantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rate">Rate per Liter (₹)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={formData.ratePerLiter}
                    onChange={(e) => setFormData({ ...formData, ratePerLiter: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <span className="text-sm">{formData.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingCustomer ? "Update" : "Add"} Customer
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
              <div className="stat-card-icon bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalActive}</p>
                <p className="text-sm text-muted-foreground">Active Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-cow/10">
                <Milk className="w-5 h-5 text-cow" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalCow}</p>
                <p className="text-sm text-muted-foreground">Cow Milk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-buffalo/10">
                <Milk className="w-5 h-5 text-buffalo" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalBuffalo}</p>
                <p className="text-sm text-muted-foreground">Buffalo Milk</p>
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
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="cow">Cow Milk</SelectItem>
            <SelectItem value="buffalo">Buffalo Milk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="stat-card group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary"
                        className={customer.milkType === "cow" ? "milk-type-cow" : "milk-type-buffalo"}
                      >
                        {customer.milkType}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={customer.isActive ? "status-paid" : "status-unpaid"}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleStatus(customer.id)}>
                      <Switch className="w-4 h-4 mr-2" />
                      {customer.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(customer.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Quantity</p>
                  <p className="font-semibold">{customer.dailyQuantity} Liters</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rate</p>
                  <p className="font-semibold">₹{customer.ratePerLiter}/L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
