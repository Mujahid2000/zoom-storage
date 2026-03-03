'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useGetSubscriptionHistoryQuery } from '../../../lib/api/packagesApiSlice';
import { History, ArrowLeft, Calendar, Shield, Crown, Gem, Zap, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Toaster } from 'sonner';

const tierIcons: Record<string, LucideIcon> = {
    Free: Zap,
    Silver: Shield,
    Gold: Crown,
    Diamond: Gem,
};

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const { data: history = [], isLoading: historyLoading } = useGetSubscriptionHistoryQuery(undefined, {
        skip: !user
    });


    if (authLoading || historyLoading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">Loading...</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 flex flex-col items-center">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-zinc-400 hover:text-zinc-100 gap-2 mb-6 self-start">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Button>
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl mb-4">
                        <History size={40} className="text-zinc-400" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tighter">
                        Subscription History
                    </h1>
                    <p className="text-zinc-500 mt-2">Track your plan evolution over time</p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">Plan Changes</CardTitle>
                        <CardDescription className='text-zinc-100'>A record of all packages active on your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-zinc-950/50">
                                <TableRow className="border-zinc-800">
                                    <TableHead className='text-zinc-100'>Package</TableHead>
                                    <TableHead className='text-zinc-100'>Start Date</TableHead>
                                    <TableHead className='text-zinc-100'>Status</TableHead>
                                    <TableHead className="text-right text-zinc-100">Terminated On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((h) => {
                                    const Icon = tierIcons[h.package.name] || Zap;
                                    const isActive = !h.endDate;

                                    return (
                                        <TableRow key={h.id} className="border-zinc-800">
                                            <TableCell className="font-bold py-5 text-zinc-100 flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                                                    <Icon size={16} />
                                                </div>
                                                {h.package.name}
                                            </TableCell>
                                            <TableCell className="text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {format(new Date(h.startDate), 'PPP')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isActive ? (
                                                    <span className="px-2 py-0.5 bg-green-900/40 text-green-400 text-[10px] font-bold uppercase rounded border border-green-900">Active</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded border border-zinc-700">Past</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-zinc-100 text-sm italic">
                                                {h.expiryDate ? format(new Date(h.expiryDate), 'PPP') : '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {history.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center text-zinc-400 italic">No history available</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <Toaster/>
        </div>
    );
}
