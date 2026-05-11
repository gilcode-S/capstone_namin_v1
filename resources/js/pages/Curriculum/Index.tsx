import React, { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
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

export default function CurriculumIndex({ programs, selectedProgram, curriculum = [], availableSubjects = [], flash, errors }) {

    // UI State for the "Add Subject" form placement
    const [activeSlot, setActiveSlot] = useState(null); // e.g., { year: 1, sem: 1 }

    const { auth } = usePage().props
    const isReadOnly = auth.user.role === 'staff'
    const { data, setData, post, processing, reset } = useForm({
        program_id: selectedProgram ? selectedProgram.id : '',
        subject_id: '',
        year_level: '',
        semester: ''
    });

    // Handle changing the main Program Dropdown
    const handleProgramChange = (e) => {
        const progId = e.target.value;
        setData('program_id', progId);
        // Instantly reload the page with the new program's data
        router.get('/curriculum', { program_id: progId }, { preserveState: true });
        setActiveSlot(null);
    };

    // --- CORE LOGIC: THE PREREQUISITE FILTER ---
    // This checks if a subject is mathematically allowed to be placed in the target Year/Semester
    const getValidSubjectsForSlot = (targetYear, targetSem) => {
        // Time Index: Year 1 Sem 1 = 1. Year 1 Sem 2 = 2. Year 2 Sem 1 = 3...
        const targetTimeIndex = (targetYear * 2) - 2 + targetSem;

        return availableSubjects.filter(subject => {
            // 1. Hide subjects already placed in the curriculum
            if (curriculum.some(c => c.subject_id === subject.id)) return false;

            // 2. Prerequisite Check
            if (subject.prerequisite_subject_id) {
                const prereqInCurriculum = curriculum.find(c => c.subject_id === subject.prerequisite_subject_id);

                // If prereq isn't scheduled at all yet, block it
                if (!prereqInCurriculum) return false;

                // Calculate the prereq's Time Index
                const prereqTimeIndex = (prereqInCurriculum.year_level * 2) - 2 + prereqInCurriculum.semester;

                // If prereq is placed at the SAME time or LATER, block it
                if (prereqTimeIndex >= targetTimeIndex) return false;
            }

            return true;
        });
    };

    // Handle adding a subject
    const submitSubject = (e) => {
        e.preventDefault();
        post('/curriculum', {
            preserveScroll: true,

            onSuccess: () => {
                setActiveSlot(null);
                reset('subject_id', 'year_level', 'semester');
            }
        });
    };

    // Setup the grid structure
    const years = [1, 2, 3, 4];
    const semesters = [1, 2];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Curriculum" />
            <div className="max-w-7xl p-2">
                <h1 className="text-2xl font-bold mb-2 text-gray-800">Curriculum Guide Mapper</h1>
                <p className="text-gray-600 mb-6">Map subjects to specific semesters to build the master academic path.</p>

                {flash?.success && <div className="bg-green-100 text-green-700 p-4 rounded mb-4 font-bold">{flash.success}</div>}
                {errors?.subject_id && <div className="bg-red-100 text-red-700 p-4 rounded mb-4 font-bold">{errors.subject_id}</div>}

                {/* 1. Program Selection */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Program to Map</label>
                    <select
                        value={data.program_id}
                        onChange={handleProgramChange}
                        className="w-full md:w-1/2 border rounded p-3 font-semibold shadow-sm"
                    >
                        <option value="" disabled>-- Select a Program --</option>
                        {programs.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                    </select>
                </div>

                {/* 2. The 4x2 Interactive Grid */}
                {selectedProgram && (
                    <div className="space-y-8">
                        {years.map(year => (
                            <div key={year} className="bg-white rounded-lg shadow-md border-t-8 border-blue-600 overflow-hidden">
                                <h2 className="bg-blue-50 p-3 text-lg font-bold text-blue-900 border-b">
                                    Year {year}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                                    {semesters.map(sem => {
                                        // Get subjects already mapped to this specific slot
                                        const mappedSubjects = curriculum.filter(c => c.year_level === year && c.semester === sem);
                                        const validAvailableSubjects = getValidSubjectsForSlot(year, sem);

                                        const isAdding = activeSlot?.year === year && activeSlot?.sem === sem;

                                        return (
                                            <div key={sem} className="p-4">
                                                <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                                                    <span>Semester {sem}</span>
                                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                                        {mappedSubjects.reduce((total, c) => total + c.subject.units, 0)} Units Total
                                                    </span>
                                                </h3>

                                                {/* List mapped subjects */}
                                                <ul className="space-y-2 mb-4">
                                                    {mappedSubjects.map(c => (
                                                        <li key={c.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                                                            <div>
                                                                <span className="font-bold text-blue-700">{c.subject.code}</span>
                                                                <span className="text-sm text-gray-600 ml-2">{c.subject.name}</span>
                                                                {c.subject.prerequisite_subject_id && (
                                                                    <span className="block text-xs text-red-500 mt-1">
                                                                        Requires: {c.subject.prerequisite.code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-sm font-semibold">
                                                                    {c.subject.units} unit{c.subject.units > 1 ? 's' : ''}
                                                                </span>

                                                                {!isReadOnly && (
                                                                    <button
                                                                        onClick={() =>
                                                                            router.delete(`/curriculum/${c.id}`, {
                                                                                preserveScroll: true
                                                                            })
                                                                        }
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        ✖
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                    {mappedSubjects.length === 0 && <li className="text-sm text-gray-400 italic">No subjects scheduled.</li>}
                                                </ul>

                                                {/* The Add Subject Inline Form */}
                                                {/* The Add Subject Inline Form */}
                                                {isAdding ? (
                                                    <form
                                                        onSubmit={submitSubject}
                                                        className="bg-blue-50 p-3 rounded border border-blue-200"
                                                    >
                                                        <select
                                                            value={data.subject_id}
                                                            onChange={e => setData('subject_id', e.target.value)}
                                                            required
                                                            className="w-full border rounded p-2 mb-2 text-sm"
                                                        >
                                                            <option value="">Select Subject...</option>

                                                            {validAvailableSubjects.map(s => (
                                                                <option key={s.id} value={s.id}>
                                                                    {s.code} - {s.name} ({s.type})
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {validAvailableSubjects.length === 0 && (
                                                            <p className="text-xs text-red-500 mb-2">
                                                                No subjects available. Check prerequisites.
                                                            </p>
                                                        )}

                                                        <div className="flex space-x-2">
                                                            <button
                                                                type="submit"
                                                                disabled={processing}
                                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold flex-1"
                                                            >
                                                                Save
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveSlot(null)}
                                                                className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-bold"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : !isReadOnly ? (
                                                    <button
                                                        onClick={() => {
                                                            setActiveSlot({ year, sem });

                                                            setData({
                                                                ...data,
                                                                year_level: year,
                                                                semester: sem,
                                                                subject_id: '',
                                                            });
                                                        }}
                                                        className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-2 rounded hover:border-blue-400 hover:text-blue-600 font-semibold transition-colors"
                                                    >
                                                        + Map Subject Here
                                                    </button>
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}