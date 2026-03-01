'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');
    const [manualToken, setManualToken] = useState('');
    const [emailForResend, setEmailForResend] = useState('');
    const [showResend, setShowResend] = useState(false);
    const [resending, setResending] = useState(false);
    const [isVerifyingManual, setIsVerifyingManual] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No verification token found in the URL. Please enter it manually or check your link.');
            return;
        }

        const verify = async () => {
            setStatus('loading');
            try {
                const { data } = await api.post('/auth/verify-email', { token });
                setStatus('success');
                setMessage(data.message);
            } catch (err: unknown) {
                setStatus('error');
                const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Verification failed. The token might be expired or invalid.';
                setMessage(errorMsg);
            }
        };

        verify();
    }, [searchParams]);

    const handleManualVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualToken) return;

        setIsVerifyingManual(true);
        // We don't set status to 'loading' here to avoid hiding the manual input form prematurely
        try {
            const { data } = await api.post('/auth/verify-email', { token: manualToken });
            setStatus('success');
            setMessage(data.message);
        } catch (err: unknown) {
            setStatus('error');
            const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Verification failed.';
            setMessage(errorMsg);
        } finally {
            setIsVerifyingManual(false);
        }
    };

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailForResend) {
            toast.error('Please enter your email');
            return;
        }
        setResending(true);
        try {
            const { data } = await api.post('/auth/resend-verification', { email: emailForResend });
            toast.success(data.message);
            if (data.verificationToken) {
                console.log(`New Verification Link: http://localhost:3000/verify?token=${data.verificationToken}`);
                toast.info('Dev Mode: New link logged to console');
            }
            setShowResend(false);
        } catch (err: unknown) {
            const errorMsg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to resend verification';
            toast.error(errorMsg);
        } finally {
            setResending(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                <CardDescription className="text-zinc-400">
                    SaaS File Management System
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6 gap-6">
                <div className="flex flex-col items-center gap-4">
                    {status === 'loading' && (
                        <Loader2 className="w-16 h-16 text-zinc-400 animate-spin" />
                    )}
                    {status === 'success' && (
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    )}
                    {status === 'error' && (
                        <XCircle className="w-16 h-16 text-red-500" />
                    )}
                    <p className="text-center text-zinc-200">{message}</p>
                </div>

                {status === 'error' && !showResend && (
                    <div className="w-full space-y-6">
                        <form onSubmit={handleManualVerify} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Paste your verification token:</label>
                                <Input
                                    value={manualToken}
                                    onChange={(e) => setManualToken(e.target.value)}
                                    placeholder="Enter token..."
                                    className="bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                                />
                            </div>
                            <Button type="submit" disabled={isVerifyingManual} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold">
                                {isVerifyingManual ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Verify Manually
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => setShowResend(true)}
                                className="text-sm text-zinc-400 hover:text-zinc-100 underline underline-offset-4"
                            >
                                Didn&apos;t receive a link? Resend email
                            </button>
                        </div>
                    </div>
                )}

                {showResend && (
                    <form onSubmit={handleResend} className="w-full space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Enter your email address:</label>
                            <Input
                                type="email"
                                value={emailForResend}
                                onChange={(e) => setEmailForResend(e.target.value)}
                                placeholder="m@example.com"
                                className="bg-zinc-800 border-zinc-700 focus:ring-zinc-600"
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 text-zinc-400"
                                onClick={() => setShowResend(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={resending}
                                className="flex-1 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold"
                            >
                                {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend Email'}
                            </Button>
                        </div>
                    </form>
                )}

                {(status === 'success' || (status === 'error' && !showResend)) && (
                    <Button
                        onClick={() => router.push('/login')}
                        variant="ghost"
                        className="w-full text-zinc-400 hover:text-zinc-100"
                    >
                        {status === 'success' ? 'Continue to Login' : 'Back to Login'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
            <Suspense fallback={<Loader2 className="w-16 h-16 text-zinc-400 animate-spin" />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
