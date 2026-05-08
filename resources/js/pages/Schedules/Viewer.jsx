import React, { useState } from 'react';

export default function ScheduleViewer({ activeVersion, schedules = [], rooms = [], teachers = [], sections = [] }) {
    const [activeTab, setActiveTab] = useState('grid');
    
    // Filters for Grid View
    const [filters, setFilters] = useState({
        set: 'Set A',
        department: 'All Department',
        day: 'Monday',
        building: 'All Building',
        floor: 'All Floor',
        shift: 'All Shift'
    });

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Fixed Time blocks for the template rows
    const SHIFTS = {
        Morning: ['07:00 am - 08:00 am', '08:00 am - 09:00 am', '09:00 am - 10:00 am', '10:00 am - 11:00 am', '11:00 am - 12:00 pm'],
        Afternoon: ['12:00 pm - 01:00 pm', '01:00 pm - 02:00 pm', '02:00 pm - 03:00 pm', '03:00 pm - 04:00 pm', '04:00 pm - 05:00 pm'],
        Evening: ['05:00 pm - 06:00 pm', '06:00 pm - 07:00 pm', '07:00 pm - 08:00 pm', '08:00 pm - 09:00 pm', '09:00 pm - 10:00 pm']
    };

    // --- THE FIX: DUMMY TEMPLATE DATA ---
    // If your database has no rooms yet, use these to force the grid shape to appear.
    const displayRooms = rooms.length > 0 ? rooms : [
        { id: 't1', name: 'ROOM 101' },
        { id: 't2', name: 'ROOM 102' },
        { id: 't3', name: 'ROOM 103' },
        { id: 't4', name: 'ROOM 104' }
    ];

    const getSchedule = (time, room_id, day) => {
        if (!schedules.length) return null;
        return schedules.find(s => 
            s.timeslot.time === time && 
            s.room_id === room_id && 
            s.day === day
        );
    };

    // --- RENDER: MASTER GRID TAB ---
    const renderMasterGrid = () => {
        return (
            <div className="bg-white mt-6 overflow-hidden">
                <div className="w-full overflow-x-auto overflow-y-auto pb-8" style={{ maxHeight: '75vh' }}>
                    
                    {Object.entries(SHIFTS).map(([shiftName, times]) => {
                        if (filters.shift !== 'All Shift' && filters.shift !== shiftName) return null;

                        return (
                            <div key={shiftName} className="mb-10 min-w-max px-2">
                                {/* Table styling matches your mockup: Thick black borders, white background */}
                                <table className="w-full text-center border-collapse border-2 border-black text-sm">
                                    <thead>
                                        <tr>
                                            <th className="border-2 border-black p-2 font-bold uppercase w-48 bg-white tracking-widest text-sm">
                                                {shiftName}
                                            </th>
                                            {displayRooms.map(room => (
                                                <th key={room.id} className="border-2 border-black p-2 min-w-[200px] font-bold uppercase tracking-wide bg-white">
                                                    {room.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {times.map(time => (
                                            <tr key={time}>
                                                {/* Left Column: Time */}
                                                <td className="border-2 border-black p-2 font-bold bg-white whitespace-nowrap">
                                                    {time.split(' - ')[0]} {/* Formats to just '7:00 am' like your mockup */}
                                                </td>
                                                
                                                {/* Intersecting Cells */}
                                                {displayRooms.map(room => {
                                                    const sched = getSchedule(time, room.id, filters.day);
                                                    
                                                    return (
                                                        <td key={`${time}-${room.id}`} className="border-2 border-black p-2 h-14 bg-white align-middle">
                                                            {sched ? (
                                                                <div className="flex flex-col items-center justify-center text-xs">
                                                                    <span className="font-bold text-gray-900">{sched.teacher.code || sched.teacher.name}</span>
                                                                    <span className="text-gray-700">{sched.section.name}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-transparent select-none">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Schedule Viewer</h1>
                <p className="text-sm text-gray-500">View and analyze the optimized class schedules</p>
            </div>

            {/* Top Navigation Pill */}
            <div className="bg-gray-200 p-1 flex mb-6 shadow-inner w-full md:w-3/4 rounded-full">
                <button onClick={() => setActiveTab('grid')} className={`flex-1 py-2 font-bold text-sm rounded-full transition ${activeTab === 'grid' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>GRID</button>
                <button onClick={() => setActiveTab('section')} className={`flex-1 py-2 font-bold text-sm rounded-full transition ${activeTab === 'section' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>By Section</button>
                <button onClick={() => setActiveTab('teacher')} className={`flex-1 py-2 font-bold text-sm rounded-full transition ${activeTab === 'teacher' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>By Teacher</button>
            </div>

            {/* TAB 1: GRID VIEW */}
            {activeTab === 'grid' && (
                <div className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                    <div className="mb-2 text-sm font-bold text-gray-700">Filters</div>
                    <div className="flex flex-wrap gap-4">
                        <select className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 w-40" value={filters.set} onChange={e => setFilters({...filters, set: e.target.value})}>
                            <option>Set A</option><option>Set B</option>
                        </select>
                        <select className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 w-48" value={filters.department} onChange={e => setFilters({...filters, department: e.target.value})}>
                            <option>All Department</option><option>Computer Science</option>
                        </select>
                        <select className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 w-40" value={filters.day} onChange={e => setFilters({...filters, day: e.target.value})}>
                            {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                        <select className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 w-40">
                            <option>Building A</option><option>Building B</option>
                        </select>
                        <select className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 w-40">
                            <option>Floor 1</option><option>Floor 2</option>
                        </select>
                        <select className="border border-gray-300 rounded-lg p-2 text-sm bg-gray-50 w-40" value={filters.shift} onChange={e => setFilters({...filters, shift: e.target.value})}>
                            <option>All Shift</option><option>Morning</option><option>Afternoon</option><option>Evening</option>
                        </select>
                    </div>

                    {renderMasterGrid()}
                </div>
            )}
            
            {/* Note: Section and Teacher tabs omitted for brevity, keep the ones from the previous block! */}
        </div>
    );
}
