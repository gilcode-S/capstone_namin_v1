import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Generator',
        href: '/schedules/generator',
    },
];

export default function GeneratorDashboard({
    readiness,
    warnings,
    academicYears,
}) {
    const { data, setData, post, processing } = useForm({
        academic_year: '2026-2027',
        semester: '1st Semester',
    });
    const hasErrors = warnings && warnings.length > 0;
    const { props } = usePage();
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }

        if (props.errors?.generation) {
            toast.error(props.errors.generation);
        }
    }, [props.flash, props.errors]);

    const handleGenerate = (e) => {
        e.preventDefault();

        if (hasErrors) {
            toast.error('Fix curriculum validation errors first.');
            return;
        }

        const loadingToast = toast.loading('Running optimization algorithm...');

        post('/schedules/generate', {
            onSuccess: () => {
                toast.dismiss(loadingToast);
            },

            onError: () => {
                toast.dismiss(loadingToast);
            },
        });
    };

    const handleReset = () => {
        if (
            !confirm(
                `Are you sure you want to reset schedules for ${data.academic_year} ${data.semester}?`,
            )
        ) {
            return;
        }

        const loadingToast = toast.loading('Resetting schedules...');

        router.delete('/schedules/reset', {
            data: {
                academic_year: data.academic_year,
                semester: data.semester,
            },

            onSuccess: () => {
                toast.dismiss(loadingToast);

                toast.success(
                    `Schedules for ${data.semester} successfully reset.`,
                );
            },

            onError: (errors) => {
                toast.dismiss(loadingToast);

                if (errors?.generation) {
                    toast.error(errors.generation);
                } else {
                    toast.error('Failed to reset schedules.');
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generator" />
            <div className="max-w-7xl p-2 font-sans">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Pre-Flight Schedule Generator
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Review system readiness before executing the
                        optimization algorithm.
                    </p>
                </div>

                {/* Configuration Dropdowns */}
                <div className="mb-6 flex gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                            Academic Year
                        </label>
                        <select
                            value={data.academic_year}
                            onChange={(e) =>
                                setData('academic_year', e.target.value)
                            }
                            className="w-full rounded-lg border p-2 font-medium"
                        >
                            <option value="2026-2027">2026-2027</option>
                            <option value="2027-2028">2027-2028</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-bold text-gray-700">
                            Semester
                        </label>
                        <select
                            value={data.semester}
                            onChange={(e) =>
                                setData('semester', e.target.value)
                            }
                            className="w-full rounded-lg border p-2 font-medium"
                        >
                            <option value="1st Semester">1st Semester</option>
                            <option value="2nd Semester">2nd Semester</option>
                            <option value="Summer">Summer</option>
                        </select>
                    </div>
                </div>

                {/* Readiness Cards */}
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-2 text-sm font-semibold text-gray-500">
                            Faculty Readiness
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {readiness?.faculty || '100%'}
                        </div>
                        <div className="mt-1 text-xs font-bold text-green-600">
                            ✔ Domains Tagged
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="mb-2 text-sm font-semibold text-gray-500">
                            Room Capacity
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                            {readiness?.rooms || '100%'}
                        </div>
                        <div className="mt-1 text-xs font-bold text-green-600">
                            ✔ Adequate Space
                        </div>
                    </div>
                    <div
                        className={`rounded-xl border p-5 shadow-sm ${hasErrors ? 'border-red-200 bg-red-50/20' : 'border-gray-100 bg-white'}`}
                    >
                        <div className="mb-2 text-sm font-semibold text-gray-500">
                            Curriculum Integrity
                        </div>
                        <div
                            className={`text-3xl font-bold ${hasErrors ? 'text-red-600' : 'text-gray-900'}`}
                        >
                            {hasErrors ? 'FAIL' : '100%'}
                        </div>
                        <div
                            className={`mt-1 text-xs font-bold ${hasErrors ? 'text-red-500' : 'text-green-600'}`}
                        >
                            {hasErrors
                                ? '⚠ Critical Errors Detected'
                                : '✔ All Prerequisites Met'}
                        </div>
                    </div>
                </div>

                {/* Validation Alerts */}
                {hasErrors && (
                    <div className="mb-6 rounded border-l-4 border-red-500 bg-red-50 p-4 shadow-sm">
                        <h3 className="mb-2 flex items-center font-bold text-red-800">
                            <span className="mr-2">⚠️</span> Critical Validation
                            Alerts
                        </h3>
                        <ul className="ml-2 list-inside list-disc space-y-1 text-sm text-red-700">
                            {warnings.map((warn, idx) => (
                                <li key={idx}>
                                    <strong>{warn.subject}:</strong>{' '}
                                    {warn.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Area */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Execute Algorithm
                        </h2>
                        <p className="text-sm text-gray-500">
                            Run the Seniority-Weighted Greedy Algorithm to
                            generate schedules.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {/* Reset Button */}
                        <button
                            onClick={handleReset}
                            className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:bg-red-100"
                        >
                            Reset Schedule
                        </button>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={hasErrors || processing}
                            className={`rounded-lg px-6 py-3 font-bold shadow-sm transition ${
                                hasErrors
                                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                                    : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        >
                            {processing
                                ? 'Processing Math...'
                                : 'Run Optimization Algorithm'}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
