import React from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function TeacherIndex({ teachers, departments, domainGroups }) {
    // 1. Inertia's useForm hook handles the state, submission, and errors automatically
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        department_id: '',
        degree: '',
        domain_group_id: '',
        specialization_id: '',
        custom_specialization: '',
        experience_years: 0,
        min_hours: 1,
        max_hours: 20,
        availability_days: [], // Arrays for your checkboxes
        shift_preferences: []  // Arrays for your checkboxes
    });

    // 2. Helper function to handle Array Checkboxes (Days & Shifts)
    const handleCheckboxChange = (e, fieldName) => {
        const value = e.target.value;
        const isChecked = e.target.checked;

        let currentArray = [...data[fieldName]];

        if (isChecked) {
            currentArray.push(value);
        } else {
            currentArray = currentArray.filter(item => item !== value);
        }

        setData(fieldName, currentArray);
    };

    // 3. Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        // This instantly posts to the TeacherController@store we built earlier
        post('/teachers', {
            onSuccess: () => reset(), // Clear form on success
        });
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Teacher / Faculty Management</h1>

            {/* --- ADD TEACHER FORM --- */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-lg font-semibold mb-4">Add New Teacher</h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Basic Info */}
                    <div>
                        <label className="block text-sm font-medium">Teacher Code</label>
                        <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} className="mt-1 block w-full border rounded p-2" />
                        {errors.code && <span className="text-red-500 text-sm">{errors.code}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Full Name</label>
                        <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full border rounded p-2" />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                    </div>

                    {/* Competency Dropdowns (Mapped directly from Laravel) */}
                    <div>
                        <label className="block text-sm font-medium">Department</label>
                        <select value={data.department_id} onChange={e => setData('department_id', e.target.value)} className="mt-1 block w-full border rounded p-2">
                            <option value="">Select Department...</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        {errors.department_id && <span className="text-red-500 text-sm">{errors.department_id}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Domain Group</label>
                        <select value={data.domain_group_id} onChange={e => setData('domain_group_id', e.target.value)} className="mt-1 block w-full border rounded p-2">
                            <option value="">Select Domain Group...</option>
                            {domainGroups.map(group => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Workload Limits */}
                    <div>
                        <label className="block text-sm font-medium">Min Hours</label>
                        <input type="number" value={data.min_hours} onChange={e => setData('min_hours', e.target.value)} className="mt-1 block w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Max Hours (Load Limit)</label>
                        <input type="number" value={data.max_hours} onChange={e => setData('max_hours', e.target.value)} className="mt-1 block w-full border rounded p-2" />
                    </div>

                    {/* Shift Preferences (The array checkbox logic) */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Shift Preferences (Select at least 2)</label>
                        <div className="flex space-x-4">
                            {['Morning', 'Afternoon', 'Evening'].map(shift => (
                                <label key={shift} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        value={shift}
                                        onChange={e => handleCheckboxChange(e, 'shift_preferences')}
                                    />
                                    <span>{shift}</span>
                                </label>
                            ))}
                        </div>
                        {errors.shift_preferences && <span className="text-red-500 text-sm">{errors.shift_preferences}</span>}
                    </div>

                    <button type="submit" disabled={processing} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded col-span-2 hover:bg-blue-700">
                        {processing ? 'Saving...' : 'Save Teacher'}
                    </button>
                </form>
            </div>

            {/* --- TEACHERS LIST TABLE --- */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Faculty Roster</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b">
                            <th className="py-2">Name</th>
                            <th className="py-2">Department</th>
                            <th className="py-2">Max Load</th>
                            <th className="py-2">Pref. Shifts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map(teacher => (
                            <tr key={teacher.id} className="border-b hover:bg-gray-50">
                                <td className="py-2">{teacher.name} ({teacher.code})</td>
                                <td className="py-2">{teacher.department?.name}</td>
                                <td className="py-2">{teacher.max_hours} hrs</td>
                                <td className="py-2">{teacher.shift_preferences?.join(', ')}</td>
                            </tr>
                        ))}
                        {teachers.length === 0 && (
                            <tr><td colSpan="4" className="py-4 text-center text-gray-500">No teachers found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}