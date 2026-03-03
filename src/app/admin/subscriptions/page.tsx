'use client'
import React from 'react';
import { useGetAdminSubscriptionsQuery } from '@/lib/api/adminApiSlice';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Subscription } from '@/lib/api/packagesApiSlice';
import { Toaster } from 'sonner';

export default function SubscriptionsManagement() {
    const { data: subscriptions = [], isLoading: subsLoading } = useGetAdminSubscriptionsQuery();

    return (
        <div>
            <header className="flex flex-col md:flex-row justify-between gap-3 md:items-center mb-10 bg-zinc-900/50 p-6 rounded-md border border-zinc-800">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl md:text-3xl font-extrabold tracking-tight capitalize">
                        Subscriptions Management
                    </h1>
                    <p className="text-zinc-500 mt-1 text-sm md:text-base">
                        Monitor active and past user subscriptions
                    </p>
                </div>
            </header>

            <div className="bg-zinc-900/40 rounded-md border border-zinc-800 overflow-hidden shadow-2xl">
                {subsLoading ? (
                    <div className="h-60 flex items-center justify-center italic text-zinc-500 bg-zinc-900/40 rounded-md border border-zinc-800">Loading data...</div>
                ) : (
                    <Table>
                        <TableHeader className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold tracking-widest">
                            <TableRow className="border-zinc-800">
                                <TableHead className='text-zinc-100'>User</TableHead>
                                <TableHead className='text-zinc-100'>Package</TableHead>
                                <TableHead className='text-zinc-100'>Start Date</TableHead>
                                <TableHead className='text-zinc-100'>End Date</TableHead>
                                <TableHead className="text-right text-zinc-100">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions.map((s: Subscription) => (
                                <TableRow key={s.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell className="py-6">{s.user.email}</TableCell>
                                    <TableCell className="font-bold">{s.package.name}</TableCell>
                                    <TableCell className="text-zinc-400 text-xs text-nowrap">
                                        {new Date(s.startDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-xs text-nowrap">
                                        {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!s.expiryDate ? (
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
                )}
            </div>
            <Toaster/>
        </div>
    );
}
