import React from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Schedule Version',
        href: '/version-history',
    },
];

export default function VersionHistory({ versions, filters }) {
    // Handle Dropdown filtering
    const handleFilterChange = (key, value) => {
        router.get(
            '/version-history',
            { ...filters, [key]: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Helper to format dates cleanly
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Version History Dashboard" />
            <div className="max-w-7xl p-3 font-sans">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Schedule Version History
                    </h1>
                    <p className="text-sm text-gray-500">
                        Access and review archived class schedules from past
                        semesters.
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <span className="mb-4 block text-sm font-semibold text-gray-700">
                        Filters
                    </span>
                    <div className="flex flex-col gap-4 md:flex-row">
                        <div className="w-full md:w-64">
                            <select
                                value={filters.academic_year || ''}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'academic_year',
                                        e.target.value,
                                    )
                                }
                                className="w-full cursor-pointer rounded-lg border-none bg-gray-50 p-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="">Academic Year</option>
                                <option value="2026-2027">2026 - 2027</option>
                                <option value="2025-2026">2025 - 2026</option>
                            </select>
                        </div>

                        <div className="w-full md:w-64">
                            <select
                                value={filters.semester || ''}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'semester',
                                        e.target.value,
                                    )
                                }
                                className="w-full cursor-pointer rounded-lg border-none bg-gray-50 p-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-gray-200"
                            >
                                <option value="">Semester</option>
                                <option value="1st Semester">
                                    1st Semester
                                </option>
                                <option value="2nd Semester">
                                    2nd Semester
                                </option>
                                {/* <option value="Summer">Summer</option> */}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Versions List */}
                <div className="space-y-4">
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className="flex flex-col items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md md:flex-row"
                        >
                            {/* Left Side: Info */}
                            <div className="mb-4 w-full md:mb-0 md:w-auto">
                                <div className="mb-2 flex items-center space-x-3">
                                    <h2 className="text-xl font-black tracking-tight text-gray-900 uppercase">
                                        {version.name}
                                    </h2>
                                    {version.status === 'Active' && (
                                        <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-bold tracking-wider text-green-800 uppercase">
                                            Current Active
                                        </span>
                                    )}
                                    {version.status === 'Draft' && (
                                        <span className="rounded bg-yellow-100 px-2.5 py-0.5 text-xs font-bold tracking-wider text-yellow-800 uppercase">
                                            Draft
                                        </span>
                                    )}
                                    {version.status === 'Archived' && (
                                        <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-bold tracking-wider text-gray-800 uppercase">
                                            Archived
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-y-2 text-sm text-gray-600">
                                    <div className="mr-6 flex items-center">
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
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="font-medium">
                                            Date Created:
                                        </span>{' '}
                                        <span className="ml-1">
                                            {formatDate(version.created_at)}
                                        </span>
                                    </div>

                                    <div className="mr-6 flex items-center">
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
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="font-medium">
                                            Date Effective:
                                        </span>{' '}
                                        <span className="ml-1">
                                            {formatDate(version.effective_date)}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className="font-medium">
                                            Version:
                                        </span>{' '}
                                        <span className="ml-1">
                                            {version.version_number}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Action Buttons */}
                            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
                                {/* Uses router.get to navigate to the Schedule Viewer (Page 8), passing the version ID */}
                                {version.status == 'Active' && (
                                    <button
                                        onClick={() =>
                                            router.get('/schedules/viewer', {
                                                version: version.id,
                                            })
                                        }
                                        className="rounded-lg bg-black px-6 py-2.5 text-sm font-bold whitespace-nowrap text-white transition hover:bg-gray-800"
                                    >
                                        View Schedule
                                    </button>
                                )}
                                {version.status === 'Draft' && (
                                    <button
                                        onClick={() =>
                                            router.get('/schedules/viewer', {
                                                version: version.id,
                                            })
                                        }
                                        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                                    >
                                        Continue Editing
                                    </button>
                                )}{' '}
                                {version.status === 'Archived' && (
                                    <button
                                        onClick={() =>
                                            router.get('/schedules/viewer', {
                                                version: version.id,
                                            })
                                        }
                                        className="rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
                                    >
                                        Restore Schedule
                                    </button>
                                )}
                                {/* Uses router.get to navigate to the Audit Logs (Page 12), filtering by this specific version/timeframe */}
                                <button
                                    onClick={() => router.get('/audit-logs')}
                                    className="rounded-lg bg-black px-6 py-2.5 text-sm font-bold whitespace-nowrap text-white transition hover:bg-gray-800"
                                >
                                    View Logs
                                </button>
                                {version.status == 'Draft' && (
                                    <button
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    'Set this version as the active schedule?',
                                                )
                                            ) {
                                                router.post(
                                                    `/version-history/${version.id}/activate`,
                                                );
                                            }
                                        }}
                                        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                                    >
                                        Set Active
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {versions.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
                            <p className="text-gray-500">
                                No schedule versions found. Generate your first
                                schedule to create a version.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
