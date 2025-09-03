"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";

interface InitializationStep {
    name: string;
    status: 'pending' | 'loading' | 'success' | 'error';
    message?: string;
}

export default function InitializeWorkspace() {
    const [steps, setSteps] = useState<InitializationStep[]>([
        { name: 'Initializing Neural Handshake', status: 'loading' },
        { name: 'Calibrating Quantum Matrix', status: 'pending' },
        { name: 'Synchronizing Holographic Data Core', status: 'pending' },
        { name: 'Preparing Launch Sequence', status: 'pending' },
    ]);

    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Simple timer to simulate progress
    useEffect(() => {
        const timer = setInterval(() => {
            if (currentStep < steps.length) {
                setSteps(prev => prev.map((step, index) => 
                    index === currentStep 
                        ? { ...step, status: 'loading', message: 'Processing...' }
                        : step
                ));
                
                setTimeout(() => {
                    setSteps(prev => prev.map((step, index) => 
                        index === currentStep 
                            ? { ...step, status: 'success', message: 'Completed' }
                            : step
                    ));
                    setCurrentStep(prev => prev + 1);
                }, 1000);
            }
        }, 2000);

        return () => clearInterval(timer);
    }, [currentStep, steps.length]);

    // Mark as complete after all steps
    useEffect(() => {
        if (currentStep === steps.length) {
            setIsComplete(true);
            //force a refresh of the auth session in convex + workos thats why we dont use the router
            window.location.href = '/subscription';
        }
    }, [currentStep, steps.length]);

    return (
        <div className="flex justify-center items-center p-4 min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-bold text-xl">Initializing Workspace</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Setting up your new organization...
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                            {step.status === 'pending' && <div className="border-2 border-gray-300 rounded-full w-5 h-5" />}
                            {step.status === 'loading' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                            {step.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                            <span className={step.status === 'loading' ? 'text-blue-600' : ''}>
                                {step.name}
                            </span>
                            {step.message && (
                                <span className="ml-2 text-muted-foreground text-sm">
                                    ({step.message})
                                </span>
                            )}
                        </div>
                    ))}

                    {isComplete && (
                        <>
                            <div className="bg-green-50 mt-6 p-4 border border-green-200 rounded-md">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium text-sm">Workspace ready! Redirecting to subscription...</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}