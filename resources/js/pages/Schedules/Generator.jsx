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
    programs,
    deliveryRules,
    summary,
}) {
    const { data, setData, post, processing } = useForm({
        academic_year: '2026-2027',
        semester: '1st Semester',
    });
    const hasErrors = warnings && warnings.length > 0;
    const { props } = usePage();
    const [rules, setRules] = useState(() => {
        const map = {};

        programs.forEach((program) => {
            [1, 2, 3, 4].forEach((year) => {
                const existing = deliveryRules.find(
                    (r) => r.program_id === program.id && r.year_level === year,
                );

                map[`${program.id}-${year}`] = existing?.delivery_mode ?? 'FTF';
            });
        });

        return map;
    });
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

    const saveRules = () => {
        const payload = [];

        Object.entries(rules).forEach(([key, mode]) => {
            const [programId, year] = key.split('-');

            payload.push({
                program_id: Number(programId),
                year_level: Number(year),
                delivery_mode: mode,
            });
        });

        router.post(
            '/delivery-rules/save',
            {
                rules: payload,
            },
            {
                onSuccess: () => {
                    toast.success('Delivery rules saved!');
                },
            },
        );
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

                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-bold">
                            Generation Summary
                        </h2>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                            <div>
                                <div className="text-sm text-gray-500">
                                    Sections
                                </div>

                                <div className="text-2xl font-bold">
                                    {summary.sections}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">
                                    Subjects
                                </div>

                                <div className="text-2xl font-bold">
                                    {summary.subjects}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">
                                    Teachers
                                </div>

                                <div className="text-2xl font-bold">
                                    {summary.teachers}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">
                                    Rooms
                                </div>

                                <div className="text-2xl font-bold">
                                    {summary.rooms}
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">
                                    Curriculum Subjects
                                </div>

                                <div className="text-2xl font-bold">
                                    {summary.curriculum_subjects}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-gray-900">
                            Delivery Mode Configuration
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure how schedules are generated for every
                            program and year level.
                        </p>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-3">
                        <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            FTF = Requires Physical Room
                        </div>

                        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Online = No Room Required
                        </div>

                        <div className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                            Hybrid = Mixed Delivery
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full overflow-hidden rounded-xl border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3 text-left font-bold">
                                        Program
                                    </th>

                                    <th className="p-3 text-center font-bold">
                                        1st Year
                                    </th>

                                    <th className="p-3 text-center font-bold">
                                        2nd Year
                                    </th>

                                    <th className="p-3 text-center font-bold">
                                        3rd Year
                                    </th>

                                    <th className="p-3 text-center font-bold">
                                        4th Year
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {programs.map((program) => (
                                    <tr
                                        key={program.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3 font-semibold">
                                            {program.name}
                                        </td>

                                        {[1, 2, 3, 4].map((year) => {
                                            const value =
                                                rules[`${program.id}-${year}`];

                                            return (
                                                <td
                                                    key={year}
                                                    className="p-3 text-center"
                                                >
                                                    <select
                                                        value={value}
                                                        onChange={(e) =>
                                                            setRules({
                                                                ...rules,
                                                                [`${program.id}-${year}`]:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className={`rounded-lg border px-3 py-2 font-semibold shadow-sm ${
                                                            value === 'FTF'
                                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                                : value ===
                                                                    'Online'
                                                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                                  : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                        } `}
                                                    >
                                                        <option value="FTF">
                                                            FTF
                                                        </option>

                                                        <option value="Online">
                                                            Online
                                                        </option>

                                                        <option value="Hybrid">
                                                            Hybrid
                                                        </option>
                                                    </select>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            onClick={saveRules}
                            className="rounded-lg bg-black px-6 py-3 font-bold text-white shadow-sm transition hover:bg-gray-800"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>

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
