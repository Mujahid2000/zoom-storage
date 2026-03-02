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
    const [fullSubscription, setFullSubscription] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [isExpired, setIsExpired] = useState(false);

    const fetchUsage = useCallback(async () => {
        try {
            const response = await api.get('/user/usage');
            const data = response.data.data; // ApiResponse.data

            setUsage(data);
            setSubscription(data.package);
            setFullSubscription(data.subscription);

            if (data.subscription?.expiryDate) {
                const expired = new Date(data.subscription.expiryDate) < new Date();
                setIsExpired(expired);
            }
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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex relative">
            <UserSidebar usage={usage} subscription={subscription} fullSubscription={fullSubscription} />
            <main className="flex-1 flex flex-col min-w-0 overflow-auto relative">
                {isExpired && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-6 text-center">
                        <div className="max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Subscription Expired</h2>
                            <p className="text-zinc-500 mb-6 text-sm">
                                Your subscription ended on {new Date(fullSubscription?.expiryDate).toLocaleDateString()}.
                                Please upgrade or renew your plan to continue managing your files.
                            </p>
                            <a href="/dashboard/plans" className="inline-block w-full">
                                <button className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold py-3 rounded-xl transition-colors">
                                    Upgrade Now
                                </button>
                            </a>
                        </div>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
