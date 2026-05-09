import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Pagination from '@/components/Pagination';

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
export default function SubjectIndex({ subjects, programs, domains, teachers, rooms, flash }) {

    const [showAdvanced, setShowAdvanced] = useState(false);
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '', code: '', type: 'Major', units: 3, year_level: '',
        program_id: '', prerequisite_subject_id: '', domain_id: '',
        pref_day: '', pref_shift: '', pref_teacher_id: '', pref_room_id: '',
        req_day: '', req_shift: '', req_teacher_id: '', req_room_id: ''
    });

    // Dynamically filter prerequisites: Only show Major subjects that belong to the selected Program
    const validPrerequisites = subjects.data.filter(sub => {

        // MAJOR SUBJECTS
        if (data.type === 'Major') {
            return (
                sub.type === 'Major' &&
                sub.program_id === parseInt(data.program_id)
            );
        }

        // MINOR SUBJECTS
        if (data.type === 'Minor') {
            return sub.type === 'Minor';
        }

        return false;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/subjects', { onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject" />
            <div className="max-w-7xl p-2">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Subject Management</h1>
                {flash?.success && <div className="bg-green-100 text-green-700 p-4 rounded mb-6 font-bold">{flash.success}</div>}

                <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-purple-600">
                    <h2 className="text-lg font-bold mb-4">Add New Subject</h2>
                    <form onSubmit={handleSubmit}>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700">Subject Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required className="mt-1 w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Subject Code</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} required className="mt-1 w-full border rounded p-2" />
                                {errors.code && <span className="text-red-500 text-xs">{errors.code}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Units</label>
                                <input type="number" value={data.units} onChange={e => setData('units', e.target.value)} required min="1" className="mt-1 w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700">
                                    Year Level
                                </label>

                                <select
                                    value={data.year_level}
                                    onChange={e => setData('year_level', e.target.value)}
                                    required
                                    className="mt-1 w-full border rounded p-2"
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>

                        {/* Classification (The Dynamic Section) */}
                        <div className="bg-gray-50 p-4 rounded border mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Subject Classification</label>
                            <div className="flex space-x-4 mb-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" checked={data.type === 'Major'} onChange={() => setData('type', 'Major')} className="form-radio" />
                                    <span className="font-semibold text-purple-700">Major Subject (Program Specific)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" checked={data.type === 'Minor'} onChange={() => setData('type', 'Minor')} className="form-radio" />
                                    <span className="font-semibold text-blue-700">Minor Subject (Domain Shared)</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* IF MAJOR: Show Program & Prereq */}
                                {data.type === 'Major' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">
                                            Target Program
                                        </label>

                                        <select
                                            value={data.program_id}
                                            onChange={e => setData('program_id', e.target.value)}
                                            required
                                            className="mt-1 w-full border rounded p-2"
                                        >
                                            <option value="">Select Program...</option>

                                            {programs.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.code} - {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* IF MINOR: Show Domain */}
                                {data.type === 'Minor' && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700">Target Competency Domain</label>
                                        <select value={data.domain_id} onChange={e => setData('domain_id', e.target.value)} required className="mt-1 w-full border rounded p-2">
                                            <option value="">Select Domain...</option>
                                            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                )}


                                {/* PREREQUISITE (ALWAYS AVAILABLE) */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">
                                        Prerequisite (Optional)
                                    </label>

                                    <select
                                        value={data.prerequisite_subject_id}
                                        onChange={e => setData('prerequisite_subject_id', e.target.value)}
                                        className="mt-1 w-full border rounded p-2"
                                    >
                                        <option value="">None</option>

                                        {validPrerequisites.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.code} - {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Options Toggle */}
                        <div className="mb-4">
                            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-purple-600 font-bold hover:underline">
                                {showAdvanced ? '- Hide Advanced Constraints' : '+ Show Advanced Options (Constraints)'}
                            </button>
                        </div>

                        {/* Advanced Constraints UI */}
                        {showAdvanced && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded mb-4 bg-gray-50">
                                {/* SOFT CONSTRAINTS */}
                                <div>
                                    <h3 className="font-bold text-blue-600 mb-2">Soft Constraints (Preferred)</h3>
                                    <p className="text-xs text-gray-500 mb-3">Algorithm will try to fulfill these, but will ignore them to prevent conflicts.</p>
                                    <div className="space-y-2">
                                        <select value={data.pref_day} onChange={e => setData('pref_day', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Preferred Day...</option>{daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                        <select value={data.pref_shift} onChange={e => setData('pref_shift', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Preferred Shift...</option><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option></select>
                                        <select value={data.pref_teacher_id} onChange={e => setData('pref_teacher_id', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Preferred Teacher...</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                        <select value={data.pref_room_id} onChange={e => setData('pref_room_id', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Preferred Room...</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.generated_name}</option>)}</select>
                                    </div>
                                </div>

                                {/* HARD CONSTRAINTS */}
                                <div>
                                    <h3 className="font-bold text-red-600 mb-2">Hard Constraints (Required)</h3>
                                    <p className="text-xs text-gray-500 mb-3">Algorithm MUST fulfill these. May cause generation failure if impossible.</p>
                                    <div className="space-y-2">
                                        <select value={data.req_day} onChange={e => setData('req_day', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Required Day...</option>{daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}</select>
                                        <select value={data.req_shift} onChange={e => setData('req_shift', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Required Shift...</option><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option></select>
                                        <select value={data.req_teacher_id} onChange={e => setData('req_teacher_id', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Required Teacher...</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                                        <select value={data.req_room_id} onChange={e => setData('req_room_id', e.target.value)} className="w-full border p-2 text-sm rounded"><option value="">Required Room...</option>{rooms.map(r => <option key={r.id} value={r.id}>{r.generated_name}</option>)}</select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={processing} className="bg-purple-600 text-white px-6 py-2 rounded font-bold hover:bg-purple-700 w-full md:w-auto">
                            Save Subject
                        </button>
                    </form>
                </div>

                {/* Existing Subjects Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold mb-4">Subject Library</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2">Code</th>
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Type</th>
                                    <th className="p-2">Classification</th>
                                    <th className="p-2 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.data.map(s => (
                                    <tr key={s.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-bold">{s.code}</td>
                                        <td className="p-2">
                                            {s.name} <br />
                                            <span className="text-xs text-gray-500">{s.units} Units</span>
                                        </td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${s.type === 'Major' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {s.type}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            {s.type === 'Major' ? `Program: ${s.program?.code}` : `Domain: ${s.domain?.name}`}
                                            {s.prerequisite && <div className="text-xs text-red-500 mt-1">Req: {s.prerequisite.code}</div>}
                                        </td>
                                        <td className="p-2 text-right">
                                            <button onClick={() => { if (confirm('Delete subject?')) router.delete(`/subjects/${s.id}`) }} className="text-red-500 hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>


                        </table>
                        <Pagination links={subjects.links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}