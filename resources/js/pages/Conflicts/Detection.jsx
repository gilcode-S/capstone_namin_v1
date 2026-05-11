import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Conflicts',
        href: '/conflicts',
    },
];
export default function ConflictDetection({
    stats,
    unresolvedList,
    resolvedList,
    analysis,
}) {
    const { message } = usePage().props;
    const [activeTab, setActiveTab] = useState('unresolved');
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);

        router.post(
            '/conflicts/scan',
            {},
            {
                onFinish: () => {
                    setIsScanning(false);
                    router.reload();
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conflict Detection" />
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-black italic">CONFLICT RADAR</h1>
                <div className="flex gap-3">
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="rounded-xl bg-black px-6 py-2 text-xs font-bold text-white uppercase"
                    >
                        {isScanning ? 'Scanning...' : 'Scan Conflicts'}
                    </button>
                    <button
                        onClick={() => router.post('/conflicts/auto-resolve')}
                        className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white uppercase"
                    >
                        Auto Resolve All
                    </button>
                </div>
            </div>
           
            {message && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-100 px-4 py-3 text-sm font-bold text-green-700">
                    {message}
                </div>
            )}
            {/* 1. STAT CARDS */}
            <div className="mb-8 grid grid-cols-3 gap-6">
                <StatCard
                    title="Total Found"
                    value={stats.total}
                    color="text-gray-900"
                />
                <StatCard
                    title="Unresolved"
                    value={stats.unresolved}
                    color="text-red-600"
                />
                <StatCard
                    title="Resolved"
                    value={stats.resolved}
                    color="text-green-600"
                />
            </div>
            {/* 2. TABS */}
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
                <div className="flex border-b">
                    {['unresolved', 'resolved', 'analysis'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 text-xs font-black tracking-widest uppercase ${activeTab === tab ? 'border-b-4 border-black text-black' : 'text-gray-400'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'unresolved' && (
                        <div className="space-y-4">
                            {unresolvedList.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-2xl border-2 border-red-50 bg-red-50/30 p-4"
                                >
                                    <div>
                                        <span className="mr-3 rounded-full bg-red-600 px-2 py-1 text-[10px] font-black text-white uppercase">
                                            {c.conflict_type}
                                        </span>
                                        <span className="text-sm font-bold">
                                            {c.scheduleA.teacher.name} vs{' '}
                                            {c.scheduleB.teacher.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            (window.location.href =
                                                '/schedules')
                                        }
                                        className="border-b-2 border-black text-xs font-black uppercase"
                                    >
                                        Manual Resolution
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'resolved' && (
                        <div className="space-y-4">
                            {resolvedList.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-2xl border border-green-100 p-4"
                                >
                                    <span className="text-sm font-bold text-gray-600 italic">
                                        Resolved: {c.scheduleA.teacher.name}{' '}
                                        overlap fixed via {c.resolution_method}
                                    </span>
                                    <span className="text-[10px] font-bold text-green-500 uppercase">
                                        Success
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="grid grid-cols-2 gap-12">
                            <div>
                                <h3 className="mb-4 text-sm font-black text-gray-400 uppercase">
                                    Resolution Efficiency
                                </h3>
                                <div className="text-6xl font-black">
                                    {analysis.success_rate}%
                                </div>
                                <p className="mt-2 text-xs font-bold text-gray-500">
                                    Overall conflict clearance rate
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase">
                                    Method Breakdown
                                </h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            style={{
                                                width: `${analysis.auto_vs_manual.auto}%`,
                                            }}
                                            className="h-full bg-blue-500"
                                        ></div>
                                        <div
                                            style={{
                                                width: `${analysis.auto_vs_manual.manual}%`,
                                            }}
                                            className="h-full bg-black"
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase">
                                    <span className="text-blue-500">
                                        Auto: {analysis.auto_vs_manual.auto}%
                                    </span>
                                    <span>
                                        Manual: {analysis.auto_vs_manual.manual}
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </AppLayout>
    );
}

function StatCard({ title, value, color }) {
    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-1 text-xs font-black tracking-widest text-gray-400 uppercase">
                {title}
            </div>
            <div className={`text-4xl font-black ${color}`}>{value}</div>
        </div>
    );
}
