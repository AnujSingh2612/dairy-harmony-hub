import { useState, useEffect } from "react";
import { Settings as SettingsIcon, IndianRupee, FileText, Palette, Database, Save, LogOut, Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function Settings() {
  const { signOut, user } = useAuth();
  const { theme, setTheme, language, setLanguage } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const [milkRates, setMilkRates] = useState({ cow: 60, buffalo: 80 });
  const [billingSettings, setBillingSettings] = useState({
    auto_bill: false,
    discount: 0,
    late_fee: 0,
    invoice_header: "Anoop Dairy",
    invoice_footer: "Thank you for your business!",
  });
  const [appSettings, setAppSettings] = useState({ name: "Anoop Dairy", notifications: true });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("app_settings").select("*");
    if (data) {
      data.forEach((setting) => {
        if (setting.setting_key === "milk_rates" && setting.setting_value) {
          setMilkRates(setting.setting_value as any);
        }
        if (setting.setting_key === "billing" && setting.setting_value) {
          setBillingSettings(setting.setting_value as any);
        }
        if (setting.setting_key === "app" && setting.setting_value) {
          setAppSettings(setting.setting_value as any);
        }
      });
    }
  };

  const saveSetting = async (key: string, value: any) => {
    setIsSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ setting_value: value })
      .eq("setting_key", key);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved!");
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {language === "hi" ? "सेटिंग्स" : "Settings"}
          </h1>
          <p className="text-muted-foreground">
            {language === "hi" ? "अपने डेयरी प्रबंधन सिस्टम को कॉन्फ़िगर करें" : "Configure your farm management system"}
          </p>
        </div>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          {language === "hi" ? "लॉगआउट" : "Logout"}
        </Button>
      </div>

      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="rates"><IndianRupee className="w-4 h-4 mr-2" />{language === "hi" ? "रेट" : "Rates"}</TabsTrigger>
          <TabsTrigger value="billing"><FileText className="w-4 h-4 mr-2" />{language === "hi" ? "बिलिंग" : "Billing"}</TabsTrigger>
          <TabsTrigger value="app"><Palette className="w-4 h-4 mr-2" />{language === "hi" ? "थीम" : "Theme"}</TabsTrigger>
          <TabsTrigger value="account"><Database className="w-4 h-4 mr-2" />{language === "hi" ? "खाता" : "Account"}</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "दूध रेट सेटिंग्स" : "Milk Rate Settings"}</CardTitle>
              <CardDescription>{language === "hi" ? "अलग-अलग दूध प्रकारों के लिए डिफ़ॉल्ट रेट सेट करें" : "Configure default rates for different milk types"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cow Milk Rate (₹ per liter)</Label>
                  <Input type="number" value={milkRates.cow} onChange={(e) => setMilkRates({ ...milkRates, cow: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Buffalo Milk Rate (₹ per liter)</Label>
                  <Input type="number" value={milkRates.buffalo} onChange={(e) => setMilkRates({ ...milkRates, buffalo: Number(e.target.value) })} />
                </div>
              </div>
              <Button onClick={() => saveSetting("milk_rates", milkRates)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />{isSaving ? "Saving..." : "Save Rates"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "बिलिंग सेटिंग्स" : "Billing Settings"}</CardTitle>
              <CardDescription>{language === "hi" ? "इनवॉइस जनरेशन विकल्प कॉन्फ़िगर करें" : "Configure invoice generation options"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>{language === "hi" ? "ऑटो बिल जनरेशन" : "Auto Bill Generation"}</Label>
                  <p className="text-sm text-muted-foreground">{language === "hi" ? "महीने के अंत में स्वतः बिल जनरेट करें" : "Automatically generate bills at month-end"}</p>
                </div>
                <Switch checked={billingSettings.auto_bill} onCheckedChange={(v) => setBillingSettings({ ...billingSettings, auto_bill: v })} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "डिस्काउंट (%)" : "Discount (%)"}</Label>
                  <Input type="number" value={billingSettings.discount} onChange={(e) => setBillingSettings({ ...billingSettings, discount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "लेट फीस (₹)" : "Late Fee (₹)"}</Label>
                  <Input type="number" value={billingSettings.late_fee} onChange={(e) => setBillingSettings({ ...billingSettings, late_fee: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "hi" ? "इनवॉइस हेडर" : "Invoice Header"}</Label>
                  <Input value={billingSettings.invoice_header} onChange={(e) => setBillingSettings({ ...billingSettings, invoice_header: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{language === "hi" ? "इनवॉइस फुटर" : "Invoice Footer"}</Label>
                  <Input value={billingSettings.invoice_footer} onChange={(e) => setBillingSettings({ ...billingSettings, invoice_footer: e.target.value })} />
                </div>
              </div>
              <Button onClick={() => saveSetting("billing", billingSettings)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />{isSaving ? (language === "hi" ? "सेव हो रहा है..." : "Saving...") : (language === "hi" ? "बिलिंग सेव करें" : "Save Billing Settings")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "थीम और भाषा" : "Theme & Language"}</CardTitle>
              <CardDescription>{language === "hi" ? "एप की दिखावट और भाषा बदलें" : "Customize app appearance"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{language === "hi" ? "थीम" : "Theme"}</Label>
                <div className="flex gap-4">
                  <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                    <Sun className="w-4 h-4 mr-2" />{language === "hi" ? "हल्का" : "Light"}
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                    <Moon className="w-4 h-4 mr-2" />{language === "hi" ? "गहरा" : "Dark"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{language === "hi" ? "भाषा" : "Language"}</Label>
                <Select value={language} onValueChange={(v: "en" | "hi") => setLanguage(v)}>
                  <SelectTrigger className="w-[200px]">
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === "hi" ? "खाता जानकारी" : "Account Information"}</CardTitle>
              <CardDescription>{language === "hi" ? "आपके खाते का विवरण" : "Your account details"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{language === "hi" ? "ईमेल" : "Email"}</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{language === "hi" ? "खाता आईडी" : "Account ID"}</p>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
