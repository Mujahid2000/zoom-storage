'use client'
import React from 'react';
import { useGetAdminUsersQuery, useVerifyUserMutation, useDeleteUserMutation, AdminUser } from '@/lib/api/adminApiSlice';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export default function UsersManagement() {
    const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery();
    const [verifyUser] = useVerifyUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    const handleVerifyUser = async (userId: string) => {
        try {
            await verifyUser(userId).unwrap();
            toast.success('User verified');
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Failed to verify user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure? This will delete all user data (files, folders, etc.)')) return;
        try {
            await deleteUser(userId).unwrap();
            toast.success('User deleted');
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight capitalize">
                        Users Management
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        Manage system users and their verification status
                    </p>
                </div>
            </header>

            <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                {usersLoading ? (
                    <div className="h-60 flex items-center justify-center italic text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-800">Loading data...</div>
                ) : (
                    <Table>
                        <TableHeader className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold tracking-widest">
                            <TableRow className="border-zinc-800">
                                <TableHead className='text-zinc-100'>User Email</TableHead>
                                <TableHead className='text-zinc-100'>Verification</TableHead>
                                <TableHead className='text-zinc-100'>Current Plan</TableHead>
                                <TableHead className='text-zinc-100'>Joined At</TableHead>
                                <TableHead className="text-right text-zinc-100">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u: AdminUser) => (
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
                )}
            </div>
        </div>
    );
}
