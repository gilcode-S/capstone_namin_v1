import React, { useState, useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export default function ScheduleViewer({ schedules }) {
    // UI State
    const [activeTab, setActiveTab] = useState('Section'); // 'Section' or 'Teacher'
    const [setMode, setMode] = useState('Set A'); // 'Set A' or 'Set B'
    const [selectedFilterId, setSelectedFilterId] = useState('');

    // Extract unique Sections and Teachers for the Dropdowns
    const sections = [...new Map(schedules.map(s => [s.section.id, s.section])).values()];
    const teachers = [...new Map(schedules.map(s => [s.teacher.id, s.teacher])).values()];

    // Automatically select the first option when switching tabs
    useMemo(() => {
        if (activeTab === 'Section' && sections.length > 0 && !selectedFilterId) {
            setSelectedFilterId(sections[0].id.toString());
        } else if (activeTab === 'Teacher' && teachers.length > 0 && !selectedFilterId) {
            setSelectedFilterId(teachers[0].id.toString());
        }
    }, [activeTab, sections, teachers]);

    // --- CORE LOGIC: Set A vs Set B Delivery Mode ---
    const getDeliveryMode = (schedule) => {
        const year = schedule.section.year_level;
        if (setMode === 'Set A') {
            // Set A: 1st Year Face-to-Face, Others Online
            return year === 1 ? schedule.room.generated_name : 'Online';
        } else {
            // Set B: 1st Year Online, Others Face-to-Face
            return year === 1 ? 'Online' : schedule.room.generated_name;
        }
    };

    // Filter the schedules based on the active tab and selected ID
    const filteredSchedules = schedules.filter(schedule => {
        if (activeTab === 'Section') return schedule.section_id.toString() === selectedFilterId;
        if (activeTab === 'Teacher') return schedule.teacher_id.toString() === selectedFilterId;
        return true;
    });

    // Standard days for the Grid
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="max-w-7xl mx-auto p-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-lg shadow">
                <h1 className="text-2xl font-bold text-gray-800">Master Schedule Viewer</h1>
                
                {/* Set A / Set B Toggle */}
                <div className="flex bg-gray-200 rounded-lg p-1 mt-4 md:mt-0">
                    <button 
                        onClick={() => setMode('Set A')}
                        className={`px-4 py-2 rounded-md font-semibold ${setMode === 'Set A' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
                    >
                        Set A
                    </button>
                    <button 
                        onClick={() => setMode('Set B')}
                        className={`px-4 py-2 rounded-md font-semibold ${setMode === 'Set B' ? 'bg-blue-600 text-white shadow' : 'text-gray-600'}`}
                    >
                        Set B
                    </button>
                </div>
            </div>

            {/* Navigation Tabs & Filters */}
            <div className="bg-white p-4 rounded-t-lg shadow border-b flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex space-x-4">
                    <button 
                        onClick={() => { setActiveTab('Section'); setSelectedFilterId(''); }}
                        className={`pb-2 px-2 font-semibold ${activeTab === 'Section' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        Section View
                    </button>
                    <button 
                        onClick={() => { setActiveTab('Teacher'); setSelectedFilterId(''); }}
                        className={`pb-2 px-2 font-semibold ${activeTab === 'Teacher' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    >
                        Teacher View
                    </button>
                </div>

                <select 
                    value={selectedFilterId} 
                    onChange={(e) => setSelectedFilterId(e.target.value)}
                    className="border rounded p-2 w-full md:w-64"
                >
                    <option value="" disabled>Select a {activeTab}...</option>
                    {activeTab === 'Section' && sections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                    {activeTab === 'Teacher' && teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            {/* The Schedule Grid */}
            <div className="bg-white p-6 rounded-b-lg shadow overflow-x-auto">
                <div className="min-w-[800px] grid grid-cols-6 gap-4">
                    
                    {/* Day Headers */}
                    {days.map(day => (
                        <div key={day} className="bg-gray-100 text-center py-2 font-bold rounded">
                            {day}
                        </div>
                    ))}

                    {/* Schedule Cards */}
                    {days.map(day => {
                        // Get schedules for this specific column (day)
                        const daySchedules = filteredSchedules
                            .filter(s => s.timeslot.day === day)
                            .sort((a, b) => a.timeslot.start_time.localeCompare(b.timeslot.start_time));

                        return (
                            <div key={`col-${day}`} className="flex flex-col space-y-3 min-h-[400px] border-r pr-2 last:border-0">
                                {daySchedules.length === 0 ? (
                                    <div className="text-gray-400 text-sm text-center mt-4">Empty</div>
                                ) : (
                                    daySchedules.map(schedule => {
                                        const delivery = getDeliveryMode(schedule);
                                        const isOnline = delivery === 'Online';

                                        return (
                                            <div key={schedule.id} className={`p-3 rounded-lg border-l-4 shadow-sm text-sm ${isOnline ? 'border-yellow-400 bg-yellow-50' : 'border-blue-500 bg-blue-50'}`}>
                                                <div className="font-bold text-gray-800">
                                                    {schedule.timeslot.start_time.substring(0,5)} - {schedule.timeslot.end_time.substring(0,5)}
                                                </div>
                                                <div className="font-semibold text-blue-700 mt-1">
                                                    {schedule.subject.code}
                                                </div>
                                                
                                                {/* Contextual Data depending on Tab */}
                                                {activeTab === 'Section' ? (
                                                    <div className="text-gray-600 mt-1">{schedule.teacher.name}</div>
                                                ) : (
                                                    <div className="text-gray-600 mt-1">Sec: {schedule.section.name}</div>
                                                )}

                                                <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-bold ${isOnline ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}>
                                                    {isOnline ? '🌐 Online' : `🚪 ${delivery}`}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}