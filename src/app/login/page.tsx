'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import Link from 'next/link';
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
import axios from 'axios';

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { user, login } = useAuth();
    const router = useRouter();
    const [needsVerification, setNeedsVerification] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        }
    }, [user, router]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const handleResendVerification = async () => {
        const email = form.getValues('email');
        if (!email) {
            toast.error('Please enter your email first');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/resend-verification', { email });
            toast.success(data.message);
            if (data.verificationToken) {
                console.log(`New Verification Link: http://localhost:3000/verify?token=${data.verificationToken}`);
                toast.info('Dev Mode: New link logged to console');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.error || 'Failed to resend verification');
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            setNeedsVerification(false);
            const { data } = await api.post('/auth/login', values);
            login(data.token, data.user);
            toast.success('Login successful');
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } } };
            const errorMsg = axiosError.response?.data?.error || (err instanceof Error ? err.message : 'Login failed');
            toast.error(errorMsg);
            if (errorMsg.toLowerCase().includes('verify your email')) {
                setNeedsVerification(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-zinc-400 text-center">
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            <div className="space-y-1">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Password</FormLabel>
                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm text-zinc-400 hover:text-zinc-100 hover:underline"
                                                >
                                                    Forgot Password?
                                                </Link>
                                            </div>
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
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold">
                                {loading ? 'Processing...' : 'Login'}
                            </Button>
                            {needsVerification && (
                                <div className="mt-4 p-4 bg-orange-950/20 border border-orange-900/50 rounded-lg text-sm">
                                    <p className="text-orange-200 font-medium mb-2">Account not verified</p>
                                    <p className="text-zinc-400 mb-4 text-xs">Please verify your email to continue. If you didn&apos;t receive the link, you can request a new one.</p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-orange-900/50 text-orange-200 hover:bg-orange-950/30 font-semibold"
                                            onClick={handleResendVerification}
                                            disabled={loading}
                                        >
                                            Resend Link
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-zinc-400 hover:text-zinc-100"
                                            onClick={() => router.push('/verify')}
                                        >
                                            Enter Token
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <p className="text-center text-sm text-zinc-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-zinc-100 hover:underline font-medium">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
