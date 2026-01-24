"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { toast } from "sonner";
import { RefreshCcw, Save } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
    const settings = useQuery(api.settings.getAllSettings);
    const updateSetting = useMutation(api.settings.updateSetting);
    const seedDefaults = useMutation(api.settings.seedDefaults);

    const [localSettings, setLocalSettings] = useState<Record<string, any>>({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (settings) {
            const mapped: Record<string, any> = {};
            settings.forEach(s => {
                mapped[s.key] = s.value;
            });
            setLocalSettings(mapped);
        }
    }, [settings]);

    const handleChange = (key: string, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async (key: string) => {
        try {
            await updateSetting({
                key,
                value: localSettings[key]
            });
            toast.success("Setting updated");
            setHasChanges(false);
        } catch (error) {
            toast.error("Failed to update setting");
        }
    };

    const handleSeed = async () => {
        try {
            await seedDefaults();
            toast.success("Default settings initialized");
        } catch (error) {
            toast.error("Failed to seed defaults");
        }
    };

    if (settings === undefined) return <LoadingAnimation message="Loading configuration..." />;

    // Helper to find description for a key
    const getDescription = (key: string) => settings.find(s => s.key === key)?.description;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">System Configuration</h1>
                    <p className="text-zinc-500">Manage global site settings and toggles</p>
                </div>
                <Button variant="outline" onClick={handleSeed} className="text-zinc-600">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset / Initialize Defaults
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Basic platform information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Site Name</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={localSettings["site_name"] || ""}
                                    onChange={(e) => handleChange("site_name", e.target.value)}
                                />
                                <Button size="icon" variant="ghost" onClick={() => handleSave("site_name")}>
                                    <Save className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">{getDescription("site_name")}</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Current Term</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={localSettings["current_term"] || ""}
                                    onChange={(e) => handleChange("current_term", e.target.value)}
                                />
                                <Button size="icon" variant="ghost" onClick={() => handleSave("current_term")}>
                                    <Save className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">{getDescription("current_term")}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Feature Toggles</CardTitle>
                        <CardDescription>Enable or disable system features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Maintenance Mode</Label>
                                <p className="text-xs text-zinc-500">{getDescription("maintenance_mode") || "Disable site access for users"}</p>
                            </div>
                            <Switch
                                checked={localSettings["maintenance_mode"] || false}
                                onCheckedChange={(checked) => {
                                    handleChange("maintenance_mode", checked);
                                    updateSetting({ key: "maintenance_mode", value: checked }).then(() => toast.success("Updated"));
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Registration Open</Label>
                                <p className="text-xs text-zinc-500">{getDescription("registration_open") || "Allow new users to sign up"}</p>
                            </div>
                            <Switch
                                checked={localSettings["registration_open"] || false}
                                onCheckedChange={(checked) => {
                                    handleChange("registration_open", checked);
                                    updateSetting({ key: "registration_open", value: checked }).then(() => toast.success("Updated"));
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
