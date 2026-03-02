/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGetPackagesQuery, useGetCurrentSubscriptionQuery, useUpgradeSubscriptionMutation } from '../../../lib/api/packagesApiSlice';
import { Check, ArrowLeft, Zap, Shield, Crown, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const tierIcons: Record<string, any> = {
    Free: Zap,
    Silver: Shield,
    Gold: Crown,
    Diamond: Gem,
};

export default function PlansPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const { data: packages = [], isLoading: packagesLoading } = useGetPackagesQuery();
    const { data: currentSub, isLoading: subLoading } = useGetCurrentSubscriptionQuery(undefined, {
        skip: !user
    });
    const [upgradeSubscription, { isLoading: isUpgrading }] = useUpgradeSubscriptionMutation();


    const handleUpgrade = async (packageId: string) => {
        try {
            await upgradeSubscription({ packageId }).unwrap();
            toast.success('Subscription updated successfully!');
            router.push('/dashboard');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update subscription');
        }
    };

    if (authLoading || packagesLoading || subLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10">
                    <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-black gap-2 mb-6">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                    <h1 className="text-4xl font-extrabold text-center tracking-tighter sm:text-5xl">
                        Choose Your Plan
                    </h1>
                    <p className="text-zinc-500 text-center mt-4 text-lg">
                        Scale your storage and unlock professional features today.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    {packages.map((pkg) => {
                        const isCurrent = currentSub?.packageId === pkg.id;
                        const Icon = tierIcons[pkg.name] || Zap;

                        return (
                            <Card
                                key={pkg.id}
                                className={`bg-zinc-900 border-zinc-800 transition-all duration-300 relative overflow-hidden flex flex-col h-full ${isCurrent ? 'ring-2 ring-zinc-100 ring-offset-4 ring-offset-zinc-950' : 'hover:border-zinc-700'
                                    }`}
                            >
                                {isCurrent && (
                                    <div className="absolute top-0 right-0 bg-zinc-100 text-zinc-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                        Current
                                    </div>
                                )}
                                <CardHeader className="p-8">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isCurrent ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <CardTitle className="text-2xl text-zinc-100 font-bold">{pkg.name}</CardTitle>
                                    <CardDescription className="text-zinc-500">Professional features for everyone.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 flex-1">
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-extrabold tracking-tight text-zinc-100">${pkg.price ?? 0}</span>
                                        <span className="text-zinc-500">/mo</span>
                                    </div>

                                    <ul className="space-y-4">
                                        {[
                                            `${pkg.maxFolders} Folders`,
                                            `Level ${pkg.maxNestingLevel} Nesting`,
                                            `${pkg.maxFileSizeMB}MB Max File`,
                                            `${pkg.totalFileLimit} Total Files`,
                                            `${pkg.filesPerFolder} Files per folder`
                                        ].map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                                                <Check size={14} className="text-zinc-100 shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="px-8 pb-8">
                                    <Button
                                        onClick={() => handleUpgrade(pkg.id)}
                                        disabled={isCurrent || isUpgrading}
                                        className={`w-full py-6 rounded-xl font-bold transition-all ${isCurrent
                                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                                            : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-lg shadow-zinc-100/10'
                                            }`}
                                    >
                                        {isUpgrading ? 'Upgrading...' : isCurrent ? 'Current Plan' : 'Upgrade Now'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
