import { useState, useEffect } from "react";
import { 
  Calendar,
  Sun,
  Moon,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Milk,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  milk_type: "cow" | "buffalo";
  daily_quantity: number;
  rate_per_liter: number;
  is_active: boolean;
}

interface MilkEntry {
  id?: string;
  customer_id: string;
  customer_name: string;
  milk_type: "cow" | "buffalo";
  regular_quantity: number;
  extra_quantity: number;
  rate_per_liter: number;
  delivered: boolean;
}

export default function MilkEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [morningEntries, setMorningEntries] = useState<MilkEntry[]>([]);
  const [eveningEntries, setEveningEntries] = useState<MilkEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<"morning" | "evening">("morning");

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setIsLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Fetch active customers
    const { data: customersData, error: customersError } = await supabase
      .from("customers")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (customersError) {
      console.error("Failed to fetch customers:", customersError);
      toast.error("Failed to fetch customers");
      setIsLoading(false);
      return;
    }

    // Fetch existing entries for the date
    const { data: entriesData } = await supabase
      .from("milk_entries")
      .select("*")
      .eq("date", dateStr);

    const activeCustomers: Customer[] = (customersData || []).map(c => ({
      id: c.id,
      name: c.name,
      milk_type: c.milk_type,
      daily_quantity: c.daily_quantity,
      rate_per_liter: c.rate_per_liter,
      is_active: c.is_active ?? true
    }));
    
    setCustomers(activeCustomers);

    // All active customers appear in both sessions (morning and evening)
    // Each session gets half of daily quantity by default
    
    // Create morning entries
    const morning: MilkEntry[] = activeCustomers.map(c => {
      const existing = entriesData?.find(e => e.customer_id === c.id && e.session === "morning");
      return {
        id: existing?.id,
        customer_id: c.id,
        customer_name: c.name,
        milk_type: c.milk_type,
        regular_quantity: existing ? Number(existing.regular_quantity) : c.daily_quantity / 2,
        extra_quantity: existing ? Number(existing.extra_quantity || 0) : 0,
        rate_per_liter: existing ? Number(existing.rate_per_liter) : c.rate_per_liter,
        delivered: existing ? existing.delivered : false,
      };
    });

    // Create evening entries
    const evening: MilkEntry[] = activeCustomers.map(c => {
      const existing = entriesData?.find(e => e.customer_id === c.id && e.session === "evening");
      return {
        id: existing?.id,
        customer_id: c.id,
        customer_name: c.name,
        milk_type: c.milk_type,
        regular_quantity: existing ? Number(existing.regular_quantity) : c.daily_quantity / 2,
        extra_quantity: existing ? Number(existing.extra_quantity || 0) : 0,
        rate_per_liter: existing ? Number(existing.rate_per_liter) : c.rate_per_liter,
        delivered: existing ? existing.delivered : false,
      };
    });

    setMorningEntries(morning);
    setEveningEntries(evening);
    setIsLoading(false);
  };

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleExtraQuantityChange = async (customerId: string, sessionType: "morning" | "evening", value: number) => {
    const entries = sessionType === "morning" ? morningEntries : eveningEntries;
    const setEntries = sessionType === "morning" ? setMorningEntries : setEveningEntries;
    
    setEntries(entries.map(entry =>
      entry.customer_id === customerId
        ? { ...entry, extra_quantity: Math.max(0, value) }
        : entry
    ));
  };

  const handleToggleDelivery = async (customerId: string, sessionType: "morning" | "evening") => {
    const entries = sessionType === "morning" ? morningEntries : eveningEntries;
    const setEntries = sessionType === "morning" ? setMorningEntries : setEveningEntries;
    const entry = entries.find(e => e.customer_id === customerId);
    
    if (!entry) return;

    const newDelivered = !entry.delivered;
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      if (entry.id) {
        // Update existing entry
        await supabase
          .from("milk_entries")
          .update({ 
            delivered: newDelivered,
            extra_quantity: entry.extra_quantity 
          })
          .eq("id", entry.id);
      } else {
        // Create new entry
        const { data } = await supabase
          .from("milk_entries")
          .insert([{
            customer_id: customerId,
            date: dateStr,
            session: sessionType,
            regular_quantity: entry.regular_quantity,
            extra_quantity: entry.extra_quantity,
            rate_per_liter: entry.rate_per_liter,
            delivered: newDelivered,
          }])
          .select()
          .single();

        if (data) {
          setEntries(entries.map(e =>
            e.customer_id === customerId
              ? { ...e, id: data.id, delivered: newDelivered }
              : e
          ));
          return;
        }
      }

      setEntries(entries.map(e =>
        e.customer_id === customerId
          ? { ...e, delivered: newDelivered }
          : e
      ));
    } catch (error) {
      console.error("Error saving entry:", error);
      toast.error("Failed to save entry");
    }
  };

  const filteredMorningEntries = morningEntries.filter(e =>
    e.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEveningEntries = eveningEntries.filter(e =>
    e.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMorning = morningEntries.reduce((sum, e) => 
    sum + (e.delivered ? (e.regular_quantity + e.extra_quantity) : 0), 0
  );
  const totalEvening = eveningEntries.reduce((sum, e) => 
    sum + (e.delivered ? (e.regular_quantity + e.extra_quantity) : 0), 0
  );
  const totalLiters = totalMorning + totalEvening;
  
  const totalAmount = [
    ...morningEntries.filter(e => e.delivered),
    ...eveningEntries.filter(e => e.delivered)
  ].reduce((sum, e) => sum + ((e.regular_quantity + e.extra_quantity) * e.rate_per_liter), 0);

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
          <h1 className="text-2xl font-display font-bold text-foreground">Daily Milk Entry</h1>
          <p className="text-muted-foreground">Record morning and evening milk deliveries</p>
        </div>
      </div>

      {/* Date Selector */}
      <Card className="stat-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-lg font-display font-semibold">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              {format(selectedDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd") && (
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
              )}
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-warning/10">
                <Sun className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalMorning.toFixed(1)} L</p>
                <p className="text-sm text-muted-foreground">Morning ({morningEntries.length})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-info/10">
                <Moon className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalEvening.toFixed(1)} L</p>
                <p className="text-sm text-muted-foreground">Evening ({eveningEntries.length})</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-primary/10">
                <Milk className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{totalLiters.toFixed(1)} L</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="stat-card-icon bg-success/10">
                <span className="text-success font-bold">₹</span>
              </div>
              <div>
                <p className="text-2xl font-display font-bold">₹{totalAmount.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Day's Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Tabs */}
      <Tabs value={session} onValueChange={(v) => setSession(v as "morning" | "evening")} className="w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="morning" className="gap-2">
              <Sun className="w-4 h-4" />
              Morning ({morningEntries.filter(e => e.delivered).length}/{morningEntries.length})
            </TabsTrigger>
            <TabsTrigger value="evening" className="gap-2">
              <Moon className="w-4 h-4" />
              Evening ({eveningEntries.filter(e => e.delivered).length}/{eveningEntries.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="morning" className="mt-0">
          <MilkEntryTable 
            entries={filteredMorningEntries}
            session="morning"
            onExtraChange={(id, val) => handleExtraQuantityChange(id, "morning", val)}
            onToggleDelivery={(id) => handleToggleDelivery(id, "morning")}
          />
        </TabsContent>
        <TabsContent value="evening" className="mt-0">
          <MilkEntryTable 
            entries={filteredEveningEntries}
            session="evening"
            onExtraChange={(id, val) => handleExtraQuantityChange(id, "evening", val)}
            onToggleDelivery={(id) => handleToggleDelivery(id, "evening")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MilkEntryTableProps {
  entries: MilkEntry[];
  session: "morning" | "evening";
  onExtraChange: (customerId: string, value: number) => void;
  onToggleDelivery: (customerId: string) => void;
}

function MilkEntryTable({ entries, session, onExtraChange, onToggleDelivery }: MilkEntryTableProps) {
  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No active customers found. Add customers in the Customers page first.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Type</th>
              <th>Regular (L)</th>
              <th>Extra (L)</th>
              <th>Total (L)</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const totalQty = entry.regular_quantity + entry.extra_quantity;
              const amount = totalQty * entry.rate_per_liter;
              
              return (
                <tr key={entry.customer_id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {entry.customer_name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{entry.customer_name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge 
                      variant="secondary"
                      className={entry.milk_type === "cow" ? "milk-type-cow" : "milk-type-buffalo"}
                    >
                      {entry.milk_type}
                    </Badge>
                  </td>
                  <td className="font-medium">{entry.regular_quantity.toFixed(1)}</td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={entry.extra_quantity}
                      onChange={(e) => onExtraChange(entry.customer_id, parseFloat(e.target.value) || 0)}
                      className="w-20 h-8"
                    />
                  </td>
                  <td className="font-semibold">{totalQty.toFixed(1)}</td>
                  <td>₹{entry.rate_per_liter}/L</td>
                  <td className="font-semibold text-primary">₹{amount.toFixed(0)}</td>
                  <td>
                    <Button
                      variant={entry.delivered ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleDelivery(entry.customer_id)}
                      className={entry.delivered ? "bg-success hover:bg-success/90" : ""}
                    >
                      <Check className={`w-4 h-4 ${entry.delivered ? "" : "mr-2"}`} />
                      {!entry.delivered && "Mark"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}