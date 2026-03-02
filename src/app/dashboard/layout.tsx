'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { UserSidebar } from '@/components/layout/UserSidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const [subscription, setSubscription] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);

    const fetchUsage = useCallback(async () => {
        try {
            const { data } = await api.get('/user/usage');
            setUsage(data);
            setSubscription(data.package);
        } catch (err) {
            console.error("Fetch usage error:", err);
        }
    }, []);

    useEffect(() => {
        if (user) {
            queueMicrotask(() => {
                fetchUsage();
            });
        }
    }, [user, fetchUsage]);

    if (authLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
            <UserSidebar usage={usage} subscription={subscription} />
            <main className="flex-1 flex flex-col min-w-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
