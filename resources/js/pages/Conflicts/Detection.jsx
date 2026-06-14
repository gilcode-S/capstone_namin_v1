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
    activeVersion,
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
                    <h1 className="text-3xl font-black italic">
                        CONFLICT DETECTION
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-gray-500 uppercase">
                                Active Schedule Version
                            </p>

                            <div className="mt-1 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                                {activeVersion?.name ?? 'No Active Version'}
                            </div>
                        </div>
                    </h1>

                    <div className="flex gap-3">
                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className="rounded-xl bg-black px-6 py-2 text-xs font-bold text-white uppercase"
                        >
                            {isScanning ? 'Scanning...' : 'Scan Conflicts'}
                        </button>
                        <button
                            onClick={() =>
                                router.post('/conflicts/auto-resolve')
                            }
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
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b text-left">
                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Conflict Type
                                            </th>

                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Notes
                                            </th>

                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-right text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {unresolvedList.length > 0 ? (
                                            unresolvedList.map((c) => (
                                                <tr
                                                    key={c.id}
                                                    className="border-b transition hover:bg-gray-50"
                                                >
                                                    {/* TYPE */}
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black text-red-600 uppercase">
                                                            {c.conflict_type}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="max-w-lg">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {c.notes ||
                                                                    'No additional details'}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-black text-yellow-700 uppercase">
                                                            Unresolved
                                                        </span>
                                                    </td>

                                                    {/* ACTION */}
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() =>
                                                                (window.location.href =
                                                                    '/schedules/viewer')
                                                            }
                                                            className="rounded-xl bg-black px-4 py-2 text-[11px] font-black text-white uppercase transition hover:opacity-90"
                                                        >
                                                            Resolve
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-10 text-center"
                                                >
                                                    <div className="text-lg font-black text-green-600">
                                                        ✓ No Conflicts Detected
                                                    </div>

                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Active schedule version
                                                        passed validation.
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'resolved' && (
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b text-left">
                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Conflict Type
                                            </th>

                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Teacher
                                            </th>

                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Resolution Method
                                            </th>

                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Resolved At
                                            </th>

                                            <th className="px-6 py-4 text-[11px] font-black tracking-wider text-gray-500 uppercase">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {resolvedList.length > 0 ? (
                                            resolvedList.map((c) => (
                                                <tr
                                                    key={c.id}
                                                    className="border-b transition hover:bg-gray-50"
                                                >
                                                    {/* TYPE */}
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700 uppercase">
                                                            {c.conflict_type}
                                                        </span>
                                                    </td>

                                                    {/* TEACHER */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold">
                                                            {c.scheduleA
                                                                ?.teacher
                                                                ?.name || 'N/A'}
                                                        </div>

                                                        <div className="text-xs text-gray-500">
                                                            vs{' '}
                                                            {c.scheduleB
                                                                ?.teacher
                                                                ?.name || 'N/A'}
                                                        </div>
                                                    </td>

                                                    {/* METHOD */}
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                                                                c.resolution_method ===
                                                                'Auto'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-black text-white'
                                                            }`}
                                                        >
                                                            {c.resolution_method ||
                                                                'Manual'}
                                                        </span>
                                                    </td>

                                                    {/* RESOLVED DATE */}
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {c.resolved_at
                                                            ? new Date(
                                                                  c.resolved_at,
                                                              ).toLocaleString()
                                                            : '—'}
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700 uppercase">
                                                            Resolved
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-6 py-10 text-center"
                                                >
                                                    <div className="text-lg font-black text-green-600">
                                                        ✓ No Conflicts Detected
                                                    </div>

                                                    <div className="mt-2 text-sm text-gray-500">
                                                        Active schedule version
                                                        passed validation.
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'analysis' && (
                            <div className="space-y-8">
                                {/* TOP ANALYTICS */}
                                <div className="grid grid-cols-3 gap-6">
                                    {/* SUCCESS RATE */}
                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                        <p className="mb-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                                            Resolution Efficiency
                                        </p>

                                        <div className="text-5xl font-black text-green-600">
                                            {analysis.success_rate}%
                                        </div>

                                        <p className="mt-2 text-xs font-bold text-gray-500">
                                            Overall conflict clearance rate
                                        </p>
                                    </div>

                                    {/* AUTO RESOLUTION */}
                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                        <p className="mb-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                                            Auto Resolution
                                        </p>

                                        <div className="text-5xl font-black text-blue-600">
                                            {analysis.auto_vs_manual.auto}%
                                        </div>

                                        <p className="mt-2 text-xs font-bold text-gray-500">
                                            Resolved automatically by system
                                        </p>
                                    </div>

                                    {/* MANUAL */}
                                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                        <p className="mb-2 text-xs font-black tracking-widest text-gray-400 uppercase">
                                            Manual Resolution
                                        </p>

                                        <div className="text-5xl font-black text-gray-900">
                                            {analysis.auto_vs_manual.manual}%
                                        </div>

                                        <p className="mt-2 text-xs font-bold text-gray-500">
                                            Required administrator intervention
                                        </p>
                                    </div>
                                </div>

                                {/* BREAKDOWN + INSIGHTS */}
                                <div className="grid grid-cols-2 gap-8">
                                    {/* CONFLICT PATTERNS */}
                                    {/* <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-sm font-black tracking-widest text-gray-400 uppercase">
                                                Conflict Patterns
                                            </h3>

                                            <span className="rounded-full bg-black px-3 py-1 text-[10px] font-black text-white uppercase">
                                                Analytics
                                            </span>
                                        </div>

                                        <div className="space-y-5">
                                            {analysis.patterns.map((p) => {
                                                const percent =
                                                    stats.total > 0
                                                        ? (
                                                              (p.count /
                                                                  stats.total) *
                                                              100
                                                          ).toFixed(0)
                                                        : 0;

                                                let color = 'bg-red-500';

                                                if (
                                                    p.conflict_type ===
                                                    'Teacher Overlap'
                                                ) {
                                                    color = 'bg-yellow-500';
                                                }

                                                if (
                                                    p.conflict_type ===
                                                    'Section Double-Book'
                                                ) {
                                                    color = 'bg-blue-500';
                                                }

                                                return (
                                                    <div key={p.conflict_type}>
                                                        <div className="mb-2 flex justify-between text-sm">
                                                            <span className="font-bold">
                                                                {
                                                                    p.conflict_type
                                                                }
                                                            </span>

                                                            <span className="font-black">
                                                                {p.count}
                                                            </span>
                                                        </div>

                                                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                                                            <div
                                                                className={`${color} h-full rounded-full`}
                                                                style={{
                                                                    width: `${percent}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mt-1 text-right text-[10px] font-black text-gray-400 uppercase">
                                                            {percent}% of all
                                                            conflicts
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div> */}

                                    {/* SMART INSIGHTS */}
                                    {/* <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-sm font-black tracking-widest text-gray-400 uppercase">
                                                AI Insights
                                            </h3>

                                            <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700 uppercase">
                                                Live Analysis
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                                <p className="text-xs font-black text-blue-600 uppercase">
                                                    Observation
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                                    Most conflicts originate
                                                    from overlapping faculty
                                                    schedules.
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
                                                <p className="text-xs font-black text-yellow-700 uppercase">
                                                    Recommendation
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                                    Increase room allocation
                                                    balancing during peak hours.
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                                                <p className="text-xs font-black text-green-700 uppercase">
                                                    System Performance
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-gray-700">
                                                    Automated resolution is
                                                    reducing manual
                                                    interventions efficiently.
                                                </p>
                                            </div>
                                        </div>
                                    </div> */}
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
