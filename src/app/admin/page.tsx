'use client';

import axios from 'axios';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Plus, Pencil, Trash2, ShieldCheck, Database, Users, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const packageSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    maxFolders: z.coerce.number().min(1),
    maxNestingLevel: z.coerce.number().min(0),
    maxFileSizeMB: z.coerce.number().min(1),
    totalFileLimit: z.coerce.number().min(1),
    totalStorageMB: z.coerce.number().min(1).default(1024),
    filesPerFolder: z.coerce.number().min(1).default(100),
    allowedFileTypes: z.array(z.string()).default(["IMAGE", "VIDEO", "PDF", "AUDIO"]),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface Package {
    id: string;
    name: string;
    maxFolders: number;
    maxNestingLevel: number;
    maxFileSizeMB: number;
    totalFileLimit: number;
    totalStorageMB: number;
    filesPerFolder: number;
    allowedFileTypes: string[];
}

interface AdminUser {
    id: string;
    email: string;
    isVerified: boolean;
    role: string;
    subscriptions?: {
        package: {
            name: string;
        };
    }[];
    createdAt: string;
}

interface AdminSubscription {
    id: string;
    user: {
        email: string;
    };
    package: {
        name: string;
    };
    startDate: string;
    endDate?: string;
    status: string;
}

export default function AdminDashboard() {
    const [activeView, setActiveView] = useState<'packages' | 'users' | 'subscriptions' | 'system'>('packages');
    const [packages, setPackages] = useState<Package[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
    const [systemConfig, setSystemConfig] = useState<{
        maintenanceMode: boolean;
        maxUploadSizeMB: number;
        updatedAt: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, logout, loading: authLoading } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageSchema) as unknown as Resolver<PackageFormValues>,
        defaultValues: {
            name: '',
            maxFolders: 10,
            maxNestingLevel: 3,
            maxFileSizeMB: 5,
            totalFileLimit: 50,
            totalStorageMB: 1024,
            filesPerFolder: 20,
            allowedFileTypes: ["IMAGE", "VIDEO", "PDF", "AUDIO"],
        } as PackageFormValues,
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pkgRes, userRes, subRes, configRes] = await Promise.all([
                api.get('/packages'),
                api.get('/admin/users'),
                api.get('/admin/subscriptions'),
                api.get('/admin/system-config')
            ]);
            setPackages(pkgRes.data);
            setUsers(userRes.data);
            setSubscriptions(subRes.data);
            setSystemConfig(configRes.data);
        } catch (err: unknown) {
            console.error(err);
            toast.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchData();
        }
    }, [user, fetchData]);

    const onSubmit: SubmitHandler<PackageFormValues> = async (values) => {
        try {
            const data = packageSchema.parse(values);
            await api.post('/packages', data);
            toast.success('Package created successfully');
            setIsDialogOpen(false);
            form.reset();
            fetchData();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || 'Failed to create package');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    const handleVerifyUser = async (userId: string) => {
        try {
            await api.post(`/admin/users/${userId}/verify`);
            toast.success('User verified');
            fetchData();
        } catch (err: unknown) {
            console.error(err);
            toast.error('Failed to verify user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure? This will delete all user data (files, folders, etc.)')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted');
            fetchData();
        } catch (err: unknown) {
            console.error(err);
            toast.error('Failed to delete user');
        }
    };

    if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;
    if (user?.role !== 'ADMIN') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 font-bold text-2xl px-10">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 hidden md:flex flex-col">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="bg-orange-500 text-white p-1.5 rounded">
                        <ShieldCheck size={20} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
                </div>

                <nav className="flex-1 space-y-1">
                    <Button
                        onClick={() => setActiveView('packages')}
                        variant="ghost"
                        className={`w-full justify-start gap-3 ${activeView === 'packages' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
                    >
                        <Database size={18} /> Packages
                    </Button>
                    <Button
                        onClick={() => setActiveView('users')}
                        variant="ghost"
                        className={`w-full justify-start gap-3 ${activeView === 'users' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
                    >
                        <Users size={18} /> Users
                    </Button>
                    <Button
                        onClick={() => setActiveView('subscriptions')}
                        variant="ghost"
                        className={`w-full justify-start gap-3 ${activeView === 'subscriptions' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
                    >
                        <ShieldCheck size={18} /> Subscriptions
                    </Button>
                    <Button
                        variant="ghost"
                        className={`w-full justify-start gap-3 ${activeView === 'system' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
                        onClick={() => setActiveView('system')}
                    >
                        <Settings size={18} /> System Config
                    </Button>
                </nav>

                <div className="mt-auto">
                    <Button onClick={logout} variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400">
                        <LogOut size={18} /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                <header className="flex justify-between items-center mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight capitalize">
                            {activeView} Management
                        </h1>
                        <p className="text-zinc-500 mt-1">
                            {activeView === 'packages' && "Configure and manage your service packages"}
                            {activeView === 'users' && "Manage system users and their verification status"}
                            {activeView === 'subscriptions' && "Monitor active and past user subscriptions"}
                            {activeView === 'system' && "Configure global system settings and monitor status"}
                        </p>
                    </div>

                    {activeView === 'packages' && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold gap-2">
                                    <Plus size={18} /> Create Package
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-lg overflow-y-auto max-h-[90vh]">
                                <DialogHeader>
                                    <DialogTitle>New Package</DialogTitle>
                                    <DialogDescription className="text-zinc-400">Define limits and name for the new tier.</DialogDescription>
                                </DialogHeader>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Gold" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="maxFolders"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Folders</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="maxNestingLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max Nesting</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="maxFileSizeMB"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Max File Size (MB)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="totalStorageMB"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Storage (MB)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="totalFileLimit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total File Limit</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="filesPerFolder"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Files Per Folder</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="bg-zinc-800 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <DialogFooter className="col-span-2 pt-4">
                                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Save Package</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="h-60 flex items-center justify-center italic text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">Loading data...</div>
                    ) : (
                        <>
                            {activeView === 'packages' && (
                                <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                                    <Table>
                                        <TableHeader className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold tracking-widest">
                                            <TableRow className="border-zinc-800">
                                                <TableHead>Tier Name</TableHead>
                                                <TableHead>Folders/Nesting</TableHead>
                                                <TableHead>Storage/File</TableHead>
                                                <TableHead>File Limits</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {packages.map((pkg) => (
                                                <TableRow key={pkg.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                                    <TableCell className="font-bold text-lg py-6">{pkg.name}</TableCell>
                                                    <TableCell className="text-zinc-400">
                                                        <div className="flex flex-col">
                                                            <span>Max: {pkg.maxFolders}</span>
                                                            <span className="text-[10px] text-zinc-500 uppercase">Nesting: {pkg.maxNestingLevel}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-zinc-400">
                                                        <div className="flex flex-col">
                                                            <span>Total: {pkg.totalStorageMB} MB</span>
                                                            <span className="text-[10px] text-zinc-500 uppercase">Per File: {pkg.maxFileSizeMB} MB</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-zinc-400">
                                                        <div className="flex flex-col">
                                                            <span>Limit: {pkg.totalFileLimit}</span>
                                                            <span className="text-[10px] text-zinc-500 uppercase">Per Folder: {pkg.filesPerFolder}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                                                                <Pencil size={16} />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {packages.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-500 italic">No packages defined</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {activeView === 'users' && (
                                <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                                    <Table>
                                        <TableHeader className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold tracking-widest">
                                            <TableRow className="border-zinc-800">
                                                <TableHead>User Email</TableHead>
                                                <TableHead>Verification</TableHead>
                                                <TableHead>Current Plan</TableHead>
                                                <TableHead>Joined At</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((u) => (
                                                <TableRow key={u.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                                    <TableCell className="font-bold py-6">{u.email}</TableCell>
                                                    <TableCell>
                                                        {u.isVerified ? (
                                                            <span className="text-green-500 text-xs font-bold px-2 py-1 bg-green-950/30 rounded border border-green-900/50">Verified</span>
                                                        ) : (
                                                            <span className="text-red-400 text-xs font-bold px-2 py-1 bg-red-950/30 rounded border border-red-900/50">Unverified</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-400">
                                                        {u.subscriptions?.[0]?.package?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-500 text-xs text-nowrap">
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {!u.isVerified && (
                                                                <Button size="icon" onClick={() => handleVerifyUser(u.id)} variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300">
                                                                    <ShieldCheck size={16} />
                                                                </Button>
                                                            )}
                                                            <Button size="icon" onClick={() => handleDeleteUser(u.id)} variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400">
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {users.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-500 italic">No users found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {activeView === 'subscriptions' && (
                                <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                                    <Table>
                                        <TableHeader className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold tracking-widest">
                                            <TableRow className="border-zinc-800">
                                                <TableHead>User</TableHead>
                                                <TableHead>Package</TableHead>
                                                <TableHead>Start Date</TableHead>
                                                <TableHead>End Date</TableHead>
                                                <TableHead className="text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subscriptions.map((s) => (
                                                <TableRow key={s.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                                    <TableCell className="py-6">{s.user.email}</TableCell>
                                                    <TableCell className="font-bold">{s.package.name}</TableCell>
                                                    <TableCell className="text-zinc-400 text-xs text-nowrap">
                                                        {new Date(s.startDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-zinc-500 text-xs text-nowrap">
                                                        {s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {!s.endDate ? (
                                                            <span className="text-green-500 text-[10px] font-bold uppercase px-2 py-0.5 bg-green-950/30 rounded border border-green-900/50">Active</span>
                                                        ) : (
                                                            <span className="text-zinc-500 text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700">Past</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {subscriptions.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-40 text-center text-zinc-500 italic">No subscriptions found</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {activeView === 'system' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-zinc-900/60 border-zinc-800 p-6 shadow-2xl">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <ShieldCheck className="text-blue-400" size={20} /> Security & Maintenance
                                        </h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                                                <div>
                                                    <p className="font-medium">Maintenance Mode</p>
                                                    <p className="text-xs text-zinc-500">Block non-admin access</p>
                                                </div>
                                                <Button
                                                    variant={systemConfig?.maintenanceMode ? "destructive" : "outline"}
                                                    onClick={async () => {
                                                        try {
                                                            await api.put('/admin/system-config', { maintenanceMode: !systemConfig?.maintenanceMode });
                                                            toast.success(`Maintenance mode ${!systemConfig?.maintenanceMode ? 'enabled' : 'disabled'}`);
                                                            fetchData();
                                                        } catch (err: unknown) {
                                                            toast.error('Failed to update config');
                                                        }
                                                    }}
                                                >
                                                    {systemConfig?.maintenanceMode ? 'Disable' : 'Enable'}
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="font-medium text-sm">Global Max Upload Size (MB)</p>
                                                <div className="flex gap-3">
                                                    <Input
                                                        type="number"
                                                        defaultValue={systemConfig?.maxUploadSizeMB}
                                                        id="maxUploadSize"
                                                        className="bg-zinc-800 border-zinc-700"
                                                    />
                                                    <Button onClick={async () => {
                                                        const val = (document.getElementById('maxUploadSize') as HTMLInputElement).value;
                                                        try {
                                                            await api.put('/admin/system-config', { maxUploadSizeMB: parseInt(val) });
                                                            toast.success('Upload limit updated');
                                                            fetchData();
                                                        } catch (err: unknown) {
                                                            toast.error('Failed to update config');
                                                        }
                                                    }}>Save</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="bg-zinc-900/60 border-zinc-800 p-6 shadow-2xl">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
