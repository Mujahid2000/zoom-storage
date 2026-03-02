'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;
    if (user?.role !== 'ADMIN') return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 font-bold text-2xl px-10">Access Denied</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">
                {children}
            </main>
        </div>
    );
}
