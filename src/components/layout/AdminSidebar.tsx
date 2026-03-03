'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ShieldCheck,
    Database,
    Users,
    Settings,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface AdminSidebarContentProps {
    pathname: string;
    logout: () => void;
}

function AdminSidebarContent({ pathname, logout }: AdminSidebarContentProps) {
    const menuItems = [
        { icon: Database, label: 'Packages', href: '/admin/packages', active: pathname === '/admin/packages' },
        { icon: Users, label: 'Users', href: '/admin/users', active: pathname === '/admin/users' },
        { icon: ShieldCheck, label: 'Subscriptions', href: '/admin/subscriptions', active: pathname === '/admin/subscriptions' },
        { icon: Settings, label: 'System Config', href: '/admin/system', active: pathname === '/admin/system' },
    ];

    return (
        <>
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="bg-orange-500 text-white p-1.5 rounded">
                    <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">Admin Portal</h2>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Button
                            variant="ghost"
                            className={`w-full hover:bg-zinc-800 hover:text-zinc-100 justify-start gap-3 ${item.active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto">
                <Button onClick={logout} variant="ghost" className="w-full justify-start gap-3 text-zinc-400 hover:text-red-400">
                    <LogOut size={18} /> Logout
                </Button>
            </div>
        </>
    );
}

export function AdminSidebar() {
    const { logout } = useAuth();
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 hidden md:flex flex-col h-screen sticky top-0">
            <AdminSidebarContent pathname={pathname} logout={logout} />
        </aside>
    );
}

export function AdminMobileSidebar() {
    const { logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full py-4">
            <AdminSidebarContent pathname={pathname} logout={logout} />
        </div>
    );
}
