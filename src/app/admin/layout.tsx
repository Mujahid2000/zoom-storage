'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar, AdminMobileSidebar } from '@/components/layout/AdminSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ShieldCheck } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;
    if (user?.role !== 'ADMIN') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 font-bold text-2xl px-10">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
            <AdminSidebar />

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-500 text-white p-1 rounded">
                        <ShieldCheck size={16} />
                    </div>
                    <span className="font-bold">Admin Portal</span>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400">
                            <Menu size={24} />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 bg-zinc-900 border-r border-zinc-800">
                        <AdminMobileSidebar />
                    </SheetContent>
                </Sheet>
            </header>

            <main className="flex-1 p-2 overflow-auto">
                {children}
            </main>
        </div>
    );
}
