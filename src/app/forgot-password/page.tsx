'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../utils/api';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, MailCheck } from 'lucide-react';
import axios from 'axios';

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (values: ForgotPasswordValues) => {
        try {
            await api.post('/auth/forgot-password', values);
            setSubmitted(true);
            toast.success('Reset link sent to your email');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || 'Failed to send reset link');
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-zinc-400 text-center">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="m@example.com"
                                                    {...field}
                                                    className="bg-zinc-800 border-zinc-700 focus-visible:ring-zinc-600"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold">
                                    Send Reset Link
                                </Button>
                            </form>
                        </Form>
                    ) : (
                        <div className="flex flex-col items-center py-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-blue-400">
                                <MailCheck size={32} />
                            </div>
                            <p className="text-lg font-medium">Reset link sent!</p>
                            <p className="text-zinc-400 text-sm">Please check your email for instructions to reset your password.</p>
                            <Button variant="ghost" className="mt-4 text-zinc-400" asChild>
                                <Link href="/login" className="flex items-center gap-2">
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col">
                    {!submitted && (
                        <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 flex items-center gap-2">
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
