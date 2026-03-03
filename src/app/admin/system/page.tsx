'use client'
import React from 'react';
import { useGetSystemConfigQuery, useUpdateSystemConfigMutation } from '@/lib/api/adminApiSlice';
import { ShieldCheck, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';

export default function SystemConfigManagement() {
    const { data: systemConfig, isLoading: configLoading } = useGetSystemConfigQuery();
    const [updateSystemConfig] = useUpdateSystemConfigMutation();

    if (configLoading) return <div className="h-60 flex items-center justify-center italic text-zinc-500 bg-zinc-900/40 rounded-md border border-zinc-800">Loading data...</div>;

    return (
        <div>
            <header className="flex flex-col md:flex-row justify-between gap-3 md:items-center mb-10 bg-zinc-900/50 p-6 rounded-md border border-zinc-800">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-tight capitalize">
                        System Config Management
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm md:text-base">
                        Configure global system settings and monitor status
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900/60 border-zinc-800 p-6 shadow-2xl">
                    <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-blue-400" size={20} /> Security & Maintenance
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                            <div>
                                <p className="font-medium text-zinc-100">Maintenance Mode</p>
                                <p className="text-xs text-zinc-500">Block non-admin access</p>
                            </div>
                            <Button
                                variant={systemConfig?.maintenanceMode ? "destructive" : "outline"}
                                onClick={async () => {
                                    try {
                                        await updateSystemConfig({ maintenanceMode: !systemConfig?.maintenanceMode }).unwrap();
                                        toast.success(`Maintenance mode ${!systemConfig?.maintenanceMode ? 'enabled' : 'disabled'}`);
                                    } catch (err: unknown) {
                                        const error = err as { data?: { message?: string } };
                                        toast.error(error.data?.message || 'Failed to update config');
                                    }
                                }}
                            >
                                {systemConfig?.maintenanceMode ? 'Disable' : 'Enable'}
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <p className="font-medium text-zinc-100 text-sm">Global Max Upload Size (MB)</p>
                            <div className="flex gap-3">
                                <Input
                                    type="number"
                                    defaultValue={systemConfig?.maxUploadSizeMB}
                                    id="maxUploadSize"
                                    className="bg-zinc-800 text-zinc-100 border-zinc-700"
                                />
                                <Button onClick={async () => {
                                    const val = (document.getElementById('maxUploadSize') as HTMLInputElement).value;
                                    try {
                                        await updateSystemConfig({ maxUploadSizeMB: parseInt(val) }).unwrap();
                                        toast.success('Upload limit updated');
                                    } catch (err: unknown) {
                                        const error = err as { data?: { message?: string } };
                                        toast.error(error.data?.message || 'Failed to update config');
                                    }
                                }}>Save</Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="bg-zinc-900/60 border-zinc-800 p-6 shadow-2xl">
                    <h3 className="text-lg text-zinc-100 font-bold mb-4 flex items-center gap-2">
                        <Database className="text-green-400" size={20} /> System Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Database Connection</span>
                            <span className="text-green-400 font-bold uppercase tracking-wider text-[10px] bg-green-950/30 px-2 py-0.5 rounded border border-green-900/50">Healthy</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Cloudinary API</span>
                            <span className="text-green-400 font-bold uppercase tracking-wider text-[10px] bg-green-950/30 px-2 py-0.5 rounded border border-green-900/50">Connected</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Last Updated</span>
                            <span className="text-zinc-300">{systemConfig?.updatedAt ? new Date(systemConfig.updatedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                    </div>
                </Card>
            </div>
            <Toaster/>
        </div>
    );
}
