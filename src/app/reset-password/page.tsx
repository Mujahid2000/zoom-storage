'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResetPasswordMutation } from '../../lib/api/authApiSlice';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';

const resetPasswordSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'idle' | 'success'>('idle');
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: ResetPasswordValues) => {
        if (!token) return toast.error('Invalid reset link');

        try {
            await resetPassword({
                token,
                newPassword: values.password,
            }).unwrap();
            setStatus('success');
            toast.success('Password reset successfully');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Failed to reset password');
        }
    };

    if (status === 'success') {
        return (
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardContent className="flex flex-col items-center py-10 text-center space-y-4">
                    <ShieldCheck className="w-16 h-16 text-green-500" />
                    <CardTitle className="text-2xl font-bold">Success!</CardTitle>
                    <p className="text-zinc-400">Your password has been reset. Redirecting you to login...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">New Password</CardTitle>
                <CardDescription className="text-zinc-400">
                    Set a secure password for your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!token ? (
                    <p className="text-red-400 text-center">Invalid or missing reset token.</p>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                                className="bg-zinc-800 border-zinc-700 focus-visible:ring-zinc-600"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                {...field}
                                                className="bg-zinc-800 border-zinc-700 focus-visible:ring-zinc-600"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold"
                            >
                                {isLoading ? 'Updating...' : 'Reset Password'}
                            </Button>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Suspense fallback={<Loader2 className="w-16 h-16 text-zinc-400 animate-spin" />}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
