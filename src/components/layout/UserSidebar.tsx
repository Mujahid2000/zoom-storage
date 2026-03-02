'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Folder,
    CreditCard,
    History as HistoryIcon,
    Settings,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

interface Usage {
    usage?: {
        storageMB: number;
        storagePercent: number;
        filesCount: number;
    };
}

interface Subscription {
    name: string;
    totalStorageMB: number;
}

interface UserSidebarProps {
    usage?: any;
    subscription?: Subscription;
    fullSubscription?: any;
}

export function UserSidebar({ usage, subscription, fullSubscription }: UserSidebarProps) {
    const { logout } = useAuth();
    const pathname = usePathname();

    const menuItems = [
        { icon: Folder, label: 'My Files', href: '/dashboard', active: pathname === '/dashboard' },
        { icon: CreditCard, label: 'Plans & Billing', href: '/dashboard/plans', active: pathname === '/dashboard/plans' },
        { icon: HistoryIcon, label: 'Billing History', href: '/dashboard/history', active: pathname === '/dashboard/history' },
        // { icon: Settings, label: 'Settings', href: '/dashboard/settings', active: pathname === '/dashboard/settings' },
    ];

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex-col hidden md:flex h-screen sticky top-0">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="bg-zinc-100 text-zinc-900 p-1.5 rounded">
                    <LayoutDashboard size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">SaaS Cloud</h2>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start gap-3 ${item.active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-black'}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto space-y-4">
                <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Current Plan</CardTitle>
                        <CardDescription className="text-sm font-bold text-zinc-100 mt-1">
                            {subscription?.name || 'Free Tier'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="h-1.5 w-full bg-zinc-700 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-zinc-100 transition-all duration-500" style={{ width: `${usage?.usage?.storagePercent || 0}%` }}></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2">
                            Using {usage?.usage?.storageMB || 0} MB of {subscription?.totalStorageMB || 1024} MB
                        </p>
                        {fullSubscription?.expiryDate && (
                            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                                Expires: {new Date(fullSubscription.expiryDate).toLocaleDateString()}
                            </p>
                        )}
                        <Link href="/dashboard/plans">
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-zinc-300 mt-2 hover:text-zinc-100">Upgrade Plan</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Button onClick={logout} variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/20">
                    <LogOut size={18} /> Logout
                </Button>
            </div>
        </aside>
    );
}
