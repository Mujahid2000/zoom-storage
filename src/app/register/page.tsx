'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useRegisterMutation } from '../../lib/api/authApiSlice';
import { useRouter } from 'next/navigation';
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
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';

const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterResponse {
    message?: string;
    verificationToken?: string;
}

export default function RegisterPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isRegistered, setIsRegistered] = useState(false);
    const [verificationLink, setVerificationLink] = useState('');

    const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();

    React.useEffect(() => {
        if (user) {
            router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        }
    }, [user, router]);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            const data = await registerMutation({
                email: values.email,
                password: values.password,
            }).unwrap() as RegisterResponse;
            toast.success(data.message || 'Account created successfully');
            if (data.verificationToken) {
                const link = `https://zoom-storage.vercel.app/verify?token=${data.verificationToken}`;
                setVerificationLink(link);
            }
            setIsRegistered(true);
        } catch (err: unknown) {
            const error = err as { data?: { message?: string } };
            toast.error(error.data?.message || 'Registration failed');
        }
    };

    if (isRegistered) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                        <CardDescription className="text-zinc-400">
                            We&apos;ve sent a verification link to your email address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {verificationLink && (
                            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-2">
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Development Mode</p>
                                <p className="text-sm text-zinc-300 break-all">{verificationLink}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full gap-2 border-zinc-700 hover:bg-zinc-800"
                                    onClick={() => {
                                        navigator.clipboard.writeText(verificationLink);
                                        toast.success('Link copied to clipboard');
                                    }}
                                >
                                    <Copy size={14} /> Copy Verification Link
                                </Button>
                            </div>
                        )}
                        <p className="text-sm text-zinc-400 text-center italic">
                            Once verified, you can sign in to your account.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold" onClick={() => router.push('/login')}>
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                    <CardDescription className="text-zinc-400 text-center">
                        Enter your details to register for an account
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
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
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
                            <Button type="submit" disabled={registerLoading} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold">
                                {registerLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Register
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <p className="text-center text-sm text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-zinc-100 hover:underline font-medium">
                            Login
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
