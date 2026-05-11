import React, { useState } from 'react';

import { Head, router } from '@inertiajs/react';
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
    unresolved = [],
    resolved = [],
    stats,
}) {
    const [activeTab, setActiveTab] = useState('Unresolved');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedConflict, setSelectedConflict] = useState(null);

    const handleActionClick = (conflict) => {
        setSelectedConflict(conflict);
        setShowResolveModal(true);
    };

    const handleScan = () => {
        router.reload({
            only: ['unresolved', 'stats'],
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Conflicts Dashboard" />
            <div className="max-w-7xl p-2 font-sans">
                {/* Header & Scan Button */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Conflict Detection
                        </h1>
                        <p className="text-sm text-gray-500">
                            Identify and resolve scheduling conflicts using
                            automation analysis
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleScan}
                            className="flex items-center rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm"
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Scan for Conflicts
                        </button>
                        <button className="flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            Auto-Resolve
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-start justify-between">
                            <span className="text-sm font-semibold text-gray-500">
                                Total Conflicts
                            </span>
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {stats.total}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-2 text-sm font-semibold text-gray-500">
                            Total Unresolved
                        </div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold text-red-600">
                                {stats.unresolvedCount}
                            </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            Unresolved conflict
                        </div>
                    </div>
                    <div className="rounded-xl border bg-white p-5 shadow-sm">
                        <div className="mb-2 flex items-start justify-between">
                            <span className="text-sm font-semibold text-gray-500">
                                Total Resolved
                            </span>
                            <svg
                                className="h-5 w-5 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                            {stats.resolvedCount}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            Successfully handled
                        </div>
                    </div>
                </div>

                {/* Critical Alert Banner (Only show if unresolved exist) */}
                {stats.unresolvedCount > 0 && (
                    <div className="mb-6 flex items-start rounded-xl border border-red-200 bg-red-50 p-4">
                        <svg
                            className="mt-0.5 mr-3 h-5 w-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div>
                            <h4 className="text-sm font-bold text-red-800">
                                Critical conflicts detected!
                            </h4>
                            <p className="mt-1 text-sm text-red-600">
                                {stats.unresolvedCount} critical issues require
                                immediate resolution to prevent scheduling
                                disruptions.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 flex rounded-full bg-gray-200 p-1">
                    {['Unresolved', 'Resolved', 'Analysis'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-all ${
                                activeTab === tab
                                    ? 'bg-white text-gray-900 shadow'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}{' '}
                            {tab === 'Unresolved'
                                ? `(${stats.unresolvedCount})`
                                : tab === 'Resolved'
                                  ? `(${stats.resolvedCount})`
                                  : ''}
                        </button>
                    ))}
                </div>

                {/* TAB 1: UNRESOLVED CONTENT */}
                {activeTab === 'Unresolved' && (
                    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                        <div className="border-b p-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Active Conflicts
                            </h2>
                            <p className="text-sm text-gray-500">
                                Conflicts that require resolution for optimal
                                scheduling
                            </p>
                        </div>
                        <div className="overflow-x-auto p-5">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="pb-3 font-semibold">
                                            Type
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Conflict
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Time Slot
                                        </th>
                                        <th className="pb-3 text-right font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {unresolved.length > 0 ? (
                                        unresolved.map((conflict) => (
                                            <tr
                                                key={conflict.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="py-4">
                                                    <div className="flex items-center font-medium text-gray-700">
                                                        <svg
                                                            className="mr-2 h-4 w-4 text-gray-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                            />
                                                        </svg>
                                                        {conflict.type}
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="font-bold text-gray-900">
                                                        {conflict.title}
                                                    </div>
                                                    <div className="mt-1 text-gray-500">
                                                        {conflict.description}
                                                    </div>
                                                    <div className="mt-2 flex space-x-2">
                                                        {conflict.tags.map(
                                                            (tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded border bg-gray-100 px-2 py-1 font-mono text-xs text-gray-600"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-gray-600">
                                                    {conflict.timeslot}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleActionClick(
                                                                conflict,
                                                            )
                                                        }
                                                        className="mx-1 p-1 text-gray-400 hover:text-black"
                                                    >
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button className="mx-1 p-1 text-gray-400 hover:text-red-600">
                                                        <svg
                                                            className="h-5 w-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="py-8 text-center text-gray-500"
                                            >
                                                No unresolved conflicts
                                                detected!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: RESOLVED CONTENT */}
                {activeTab === 'Resolved' && (
                    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                        <div className="border-b p-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Resolved Conflicts
                            </h2>
                            <p className="text-sm text-gray-500">
                                Previously resolved scheduling conflicts
                            </p>
                        </div>
                        <div className="overflow-x-auto p-5">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-gray-500">
                                        <th className="pb-3 font-semibold">
                                            Type
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Conflict
                                        </th>
                                        <th className="pb-3 font-semibold">
                                            Solution Applied
                                        </th>
                                        <th className="pb-3 text-right font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {resolved.map((conflict) => (
                                        <tr
                                            key={conflict.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="py-4 font-medium text-gray-700">
                                                {conflict.type}
                                            </td>
                                            <td className="py-4 whitespace-pre-line text-gray-900">
                                                {conflict.conflict}
                                            </td>
                                            <td className="py-4 text-gray-600">
                                                {conflict.solution}
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    <svg
                                                        className="mr-1 h-3 w-3"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Resolved
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: ANALYSIS CONTENT (From Mockup 3) */}
                {activeTab === 'Analysis' && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
                            <h2 className="mb-1 text-lg font-bold text-gray-900">
                                Conflict Patterns
                            </h2>
                            <p className="mb-6 text-sm text-gray-500">
                                Analysis of common scheduling issues
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        label: 'Teacher Overlaps',
                                        pct: '40%',
                                        color: 'bg-orange-300',
                                    },
                                    {
                                        label: 'Room Conflicts',
                                        pct: '30%',
                                        color: 'bg-red-400',
                                    },
                                    {
                                        label: 'Resource Shortages',
                                        pct: '20%',
                                        color: 'bg-orange-200',
                                    },
                                    {
                                        label: 'Workload Imbalances',
                                        pct: '10%',
                                        color: 'bg-red-300',
                                    },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex justify-between text-sm font-semibold text-gray-700">
                                            <span>{item.label}</span>
                                            <span>{item.pct}</span>
                                        </div>
                                        <div className="h-2.5 w-full rounded-full bg-gray-100">
                                            <div
                                                className={`h-2.5 rounded-full ${item.color}`}
                                                style={{ width: item.pct }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white p-6 shadow-sm">
                            <h2 className="mb-1 text-sm font-bold text-gray-700">
                                Resolution Success Rate
                            </h2>
                            <p className="mb-6 text-xs text-gray-500">
                                Effectiveness of conflict resolution strategies
                            </p>

                            <div className="mb-8 text-center">
                                <div className="mb-2 text-5xl font-bold text-green-500">
                                    20%
                                </div>
                                <div className="text-sm text-gray-600">
                                    of conflicts successfully resolved
                                </div>
                            </div>

                            <div className="space-y-3 border-t pt-4">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Automatic Resolution</span>
                                    <span className="font-semibold text-gray-900">
                                        75%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Manual Intervention</span>
                                    <span className="font-semibold text-gray-900">
                                        25%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resolution Modal Overlay */}
                {showResolveModal && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-4 text-xl font-bold">
                                Resolve Conflict
                            </h2>
                            <p className="mb-6 text-sm text-gray-600">
                                How would you like to resolve the conflict for{' '}
                                <strong>{selectedConflict?.title}</strong>?
                            </p>
                            <div className="space-y-3">
                                <button className="w-full rounded-lg border border-blue-200 bg-blue-50 py-3 font-semibold text-blue-700 transition hover:bg-blue-100">
                                    Let Algorithm Auto-Resolve
                                </button>
                                <button className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 font-semibold text-gray-700 transition hover:bg-gray-100">
                                    Manually Edit Schedule
                                </button>
                            </div>
                            <button
                                onClick={() => setShowResolveModal(false)}
                                className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
