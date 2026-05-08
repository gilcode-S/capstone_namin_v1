import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Schedule Viewer',
        href: '/schedules',
    },
];

export default function GenerateSchedule({
    sections,
    selectedSection,
    previewData,
    flash,
}) {
    // Form handling for the final Generate button
    const { data, setData, post, processing } = useForm({
        section_id: selectedSection ? selectedSection.id : '',
    });

    // Fetch the preview data instantly when a section is selected
    const handleSectionChange = (e) => {
        const sectionId = e.target.value;
        setData('section_id', sectionId);

        // This reloads the page with the preview data without losing state
        router.get(
            '/schedules/generate',
            { section_id: sectionId },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // The final trigger
    const handleGenerate = () => {
        post('/schedules/generate');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schedule Viewer Dashboard" />
            <div className="mx-auto max-w-7xl p-6">
                <h1 className="mb-2 text-2xl font-bold">
                    Schedule Generation Engine
                </h1>
                <p className="mb-8 text-gray-600">
                    Select a section to run a competency preview before
                    generating the final schedule.
                </p>

                {/* Error/Success Messages */}
                {flash?.error && (
                    <div className="mb-4 rounded bg-red-100 p-4 font-bold text-red-700">
                        {flash.error}
                    </div>
                )}
                {flash?.success && (
                    <div className="mb-4 rounded bg-green-100 p-4 font-bold text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Step 1: Selection */}
                <div className="mb-8 rounded-lg bg-white p-6 shadow">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        1. Select Target Section
                    </label>
                    <select
                        value={data.section_id}
                        onChange={handleSectionChange}
                        className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:w-1/2"
                    >
                        <option value="" disabled>
                            -- Choose a Section --
                        </option>
                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.name} ({section.program.code} - Year{' '}
                                {section.year_level})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Step 2: The Pre-Flight Dashboard */}
                {previewData && (
                    <div className="rounded-lg border-t-4 border-blue-600 bg-white p-6 shadow">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">
                                    2. Pre-Processing Review
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Curriculum mapped and teachers ranked via
                                    Domain Competency.
                                </p>
                            </div>

                            {/* THE BIG GENERATE BUTTON */}
                            <button
                                onClick={handleGenerate}
                                disabled={
                                    processing ||
                                    previewData.some((p) =>
                                        p.status.includes('Error'),
                                    )
                                }
                                className={`rounded-lg px-6 py-3 font-bold text-white shadow-lg transition-all ${processing ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:scale-105 hover:bg-blue-700'} disabled:opacity-50`}
                            >
                                {processing
                                    ? '⚙️ Processing Math...'
                                    : '🚀 Confirm & Generate Schedule'}
                            </button>
                        </div>

                        {/* Preview Cards */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {previewData.map((preview, index) => (
                                <div
                                    key={index}
                                    className={`rounded-lg border p-4 ${preview.status.includes('Error') ? 'border-red-200 bg-red-50' : 'bg-gray-50'}`}
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {preview.subject.name}
                                            </h3>
                                            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                {preview.subject.code} •{' '}
                                                {preview.subject.units} Units
                                            </span>
                                        </div>
                                        <span
                                            className={`rounded px-2 py-1 text-xs font-bold ${preview.status.includes('Error') ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                                        >
                                            {preview.status}
                                        </span>
                                    </div>

                                    <div className="mt-4">
                                        <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                                            Top Ranked Faculty:
                                        </p>
                                        {preview.top_teachers.length > 0 ? (
                                            <ul className="space-y-1">
                                                {preview.top_teachers.map(
                                                    (teacher, tIndex) => (
                                                        <li
                                                            key={teacher.id}
                                                            className="flex items-center space-x-2 text-sm"
                                                        >
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700">
                                                                #{tIndex + 1}
                                                            </span>
                                                            <span>
                                                                {teacher.name}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="mt-2 text-sm font-semibold text-red-600">
                                                ⚠️ No teacher matches this
                                                domain/department constraint.
                                                Please update faculty
                                                competencies before generating.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
