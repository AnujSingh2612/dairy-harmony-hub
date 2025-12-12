import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  IndianRupee, 
  FileText, 
  Palette,
  Users,
  Database,
  Bell,
  Shield,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Settings() {
  const [milkRates, setMilkRates] = useState({
    cowRate: 60,
    buffaloRate: 80,
  });

  const [billingSettings, setBillingSettings] = useState({
    autoBillGeneration: true,
    includeLateFee: false,
    lateFeeAmount: 50,
    discountEnabled: false,
    discountPercentage: 5,
    invoiceHeader: "DairyFlow Farm",
    invoiceFooter: "Thank you for your business!",
  });

  const [appSettings, setAppSettings] = useState({
    appName: "DairyFlow",
    notifications: true,
    emailAlerts: false,
  });

  const handleSaveRates = () => {
    toast.success("Milk rates updated successfully!");
  };

  const handleSaveBilling = () => {
    toast.success("Billing settings saved!");
  };

  const handleSaveApp = () => {
    toast.success("App settings updated!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your farm management system</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="rates" className="gap-2">
            <IndianRupee className="w-4 h-4" />
            <span className="hidden md:inline">Milk Rates</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="app" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden md:inline">App</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden md:inline">Backup</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Milk Rate Settings
              </CardTitle>
              <CardDescription>
                Configure default rates for different milk types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cowRate">Cow Milk Rate (₹ per liter)</Label>
                  <Input
                    id="cowRate"
                    type="number"
                    value={milkRates.cowRate}
                    onChange={(e) => setMilkRates({ ...milkRates, cowRate: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Default rate for cow milk deliveries</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffaloRate">Buffalo Milk Rate (₹ per liter)</Label>
                  <Input
                    id="buffaloRate"
                    type="number"
                    value={milkRates.buffaloRate}
                    onChange={(e) => setMilkRates({ ...milkRates, buffaloRate: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Default rate for buffalo milk deliveries</p>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Special Customer Rates</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  You can set custom rates for individual customers in their profile settings.
                </p>
                <Button variant="outline" size="sm">Manage Customer Rates</Button>
              </div>

              <Button onClick={handleSaveRates}>
                <Save className="w-4 h-4 mr-2" />
                Save Rates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Configure invoice generation and payment options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label className="text-base">Auto Bill Generation</Label>
                    <p className="text-sm text-muted-foreground">Automatically generate bills at month-end</p>
                  </div>
                  <Switch
                    checked={billingSettings.autoBillGeneration}
                    onCheckedChange={(checked) => setBillingSettings({ ...billingSettings, autoBillGeneration: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label className="text-base">Late Fee</Label>
                    <p className="text-sm text-muted-foreground">Apply late fee for overdue payments</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {billingSettings.includeLateFee && (
                      <Input
                        type="number"
                        value={billingSettings.lateFeeAmount}
                        onChange={(e) => setBillingSettings({ ...billingSettings, lateFeeAmount: parseFloat(e.target.value) || 0 })}
                        className="w-24"
                      />
                    )}
                    <Switch
                      checked={billingSettings.includeLateFee}
                      onCheckedChange={(checked) => setBillingSettings({ ...billingSettings, includeLateFee: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <Label className="text-base">Discount</Label>
                    <p className="text-sm text-muted-foreground">Apply discount on total bill</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {billingSettings.discountEnabled && (
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={billingSettings.discountPercentage}
                          onChange={(e) => setBillingSettings({ ...billingSettings, discountPercentage: parseFloat(e.target.value) || 0 })}
                          className="w-20"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                    )}
                    <Switch
                      checked={billingSettings.discountEnabled}
                      onCheckedChange={(checked) => setBillingSettings({ ...billingSettings, discountEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoiceHeader">Invoice Header</Label>
                  <Input
                    id="invoiceHeader"
                    value={billingSettings.invoiceHeader}
                    onChange={(e) => setBillingSettings({ ...billingSettings, invoiceHeader: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFooter">Invoice Footer</Label>
                  <Input
                    id="invoiceFooter"
                    value={billingSettings.invoiceFooter}
                    onChange={(e) => setBillingSettings({ ...billingSettings, invoiceFooter: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveBilling}>
                <Save className="w-4 h-4 mr-2" />
                Save Billing Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                App Settings
              </CardTitle>
              <CardDescription>
                Customize your application appearance and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">App Name</Label>
                <Input
                  id="appName"
                  value={appSettings.appName}
                  onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.notifications}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-base">Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get important updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={appSettings.emailAlerts}
                    onCheckedChange={(checked) => setAppSettings({ ...appSettings, emailAlerts: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveApp}>
                <Save className="w-4 h-4 mr-2" />
                Save App Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage admin users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Backend Required</h3>
                <p className="text-muted-foreground mb-4">
                  Enable Lovable Cloud to manage users, roles, and permissions
                </p>
                <Button>Enable Lovable Cloud</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Backup & Restore
              </CardTitle>
              <CardDescription>
                Manage your data backups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Backend Required</h3>
                <p className="text-muted-foreground mb-4">
                  Enable Lovable Cloud for automatic backups and data restoration
                </p>
                <Button>Enable Lovable Cloud</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
