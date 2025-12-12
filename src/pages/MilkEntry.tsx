import { useState } from "react";
import { 
  Calendar,
  Sun,
  Moon,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Milk
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addDays, subDays } from "date-fns";

interface MilkEntry {
  customerId: number;
  customerName: string;
  milkType: "cow" | "buffalo";
  regularQuantity: number;
  extraQuantity: number;
  ratePerLiter: number;
  morningDelivered: boolean;
  eveningDelivered: boolean;
}

const mockEntries: MilkEntry[] = [
  { customerId: 1, customerName: "Ramesh Kumar", milkType: "cow", regularQuantity: 5, extraQuantity: 0, ratePerLiter: 60, morningDelivered: true, eveningDelivered: false },
  { customerId: 2, customerName: "Suresh Patel", milkType: "buffalo", regularQuantity: 8, extraQuantity: 2, ratePerLiter: 80, morningDelivered: true, eveningDelivered: true },
  { customerId: 3, customerName: "Priya Sharma", milkType: "cow", regularQuantity: 3, extraQuantity: 0, ratePerLiter: 60, morningDelivered: true, eveningDelivered: false },
  { customerId: 4, customerName: "Amit Singh", milkType: "buffalo", regularQuantity: 6, extraQuantity: 1, ratePerLiter: 80, morningDelivered: false, eveningDelivered: false },
  { customerId: 5, customerName: "Meera Devi", milkType: "cow", regularQuantity: 4, extraQuantity: 0, ratePerLiter: 60, morningDelivered: true, eveningDelivered: true },
  { customerId: 6, customerName: "Vikram Yadav", milkType: "buffalo", regularQuantity: 10, extraQuantity: 3, ratePerLiter: 85, morningDelivered: true, eveningDelivered: false },
];

export default function MilkEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<MilkEntry[]>(mockEntries);
  const [searchQuery, setSearchQuery] = useState("");
  const [session, setSession] = useState<"morning" | "evening">("morning");

  const filteredEntries = entries.filter((entry) =>
    entry.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleExtraQuantityChange = (customerId: number, value: number) => {
    setEntries(entries.map(entry =>
      entry.customerId === customerId
        ? { ...entry, extraQuantity: Math.max(0, value) }
        : entry
    ));
  };

  const handleToggleDelivery = (customerId: number, sessionType: "morning" | "evening") => {
    setEntries(entries.map(entry =>
      entry.customerId === customerId
        ? {
            ...entry,
            [sessionType === "morning" ? "morningDelivered" : "eveningDelivered"]: 
              !entry[sessionType === "morning" ? "morningDelivered" : "eveningDelivered"]
          }
        : entry
    ));
  };

  const totalMorning = entries.reduce((sum, e) => 
    sum + (e.morningDelivered ? (e.regularQuantity / 2 + e.extraQuantity / 2) : 0), 0
  );
  const totalEvening = entries.reduce((sum, e) => 
    sum + (e.eveningDelivered ? (e.regularQuantity / 2 + e.extraQuantity / 2) : 0), 0
  );
  const totalLiters = totalMorning + totalEvening;
  const totalAmount = entries.reduce((sum, e) => {
    const delivered = (e.morningDelivered ? 0.5 : 0) + (e.eveningDelivered ? 0.5 : 0);
    return sum + ((e.regularQuantity + e.extraQuantity) * e.ratePerLiter * delivered);
  }, 0);

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
                <p className="text-sm text-muted-foreground">Morning</p>
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
                <p className="text-sm text-muted-foreground">Evening</p>
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
              Morning
            </TabsTrigger>
            <TabsTrigger value="evening" className="gap-2">
              <Moon className="w-4 h-4" />
              Evening
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
            entries={filteredEntries}
            session="morning"
            onExtraChange={handleExtraQuantityChange}
            onToggleDelivery={handleToggleDelivery}
          />
        </TabsContent>
        <TabsContent value="evening" className="mt-0">
          <MilkEntryTable 
            entries={filteredEntries}
            session="evening"
            onExtraChange={handleExtraQuantityChange}
            onToggleDelivery={handleToggleDelivery}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface MilkEntryTableProps {
  entries: MilkEntry[];
  session: "morning" | "evening";
  onExtraChange: (customerId: number, value: number) => void;
  onToggleDelivery: (customerId: number, session: "morning" | "evening") => void;
}

function MilkEntryTable({ entries, session, onExtraChange, onToggleDelivery }: MilkEntryTableProps) {
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
              const isDelivered = session === "morning" ? entry.morningDelivered : entry.eveningDelivered;
              const sessionQty = (entry.regularQuantity + entry.extraQuantity) / 2;
              const sessionAmount = sessionQty * entry.ratePerLiter;
              
              return (
                <tr key={entry.customerId}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {entry.customerName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{entry.customerName}</span>
                    </div>
                  </td>
                  <td>
                    <Badge 
                      variant="secondary"
                      className={entry.milkType === "cow" ? "milk-type-cow" : "milk-type-buffalo"}
                    >
                      {entry.milkType}
                    </Badge>
                  </td>
                  <td className="font-medium">{(entry.regularQuantity / 2).toFixed(1)}</td>
                  <td>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={entry.extraQuantity / 2}
                      onChange={(e) => onExtraChange(entry.customerId, parseFloat(e.target.value) * 2 || 0)}
                      className="w-20 h-8"
                    />
                  </td>
                  <td className="font-semibold">{sessionQty.toFixed(1)}</td>
                  <td>₹{entry.ratePerLiter}/L</td>
                  <td className="font-semibold text-primary">₹{sessionAmount.toFixed(0)}</td>
                  <td>
                    <Button
                      variant={isDelivered ? "default" : "outline"}
                      size="sm"
                      onClick={() => onToggleDelivery(entry.customerId, session)}
                      className={isDelivered ? "bg-success hover:bg-success/90" : ""}
                    >
                      <Check className={`w-4 h-4 ${isDelivered ? "" : "mr-2"}`} />
                      {!isDelivered && "Mark"}
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
