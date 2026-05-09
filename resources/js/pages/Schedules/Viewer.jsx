import React, { useState, useMemo } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Viewer',
        href: '/schedules/viewer',
    },
];

export default function ScheduleViewer({
    activeVersion,
    schedules = [],
    rooms = [],
    teachers = [],
    sections = [],
}) {
    console.log(schedules);
    const [activeTab, setActiveTab] = useState('grid');

    // View States for clicking cards
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [sectionSet, setSectionSet] = useState('Set A');

    // Filters for Grid View
    const [filters, setFilters] = useState({
        set: 'Set A',
        department: 'All Department',
        day: 'Monday',
        building: 'All Building',
        floor: 'All Floor',
        shift: 'All Shift',
    });

    const DAYS = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];

    // Fixed Time blocks for the template rows
    const SHIFTS = {
        Morning: [
            '07:00 am - 08:00 am',
            '08:00 am - 09:00 am',
            '09:00 am - 10:00 am',
            '10:00 am - 11:00 am',
            '11:00 am - 12:00 pm',
        ],
        Afternoon: [
            '12:00 pm - 01:00 pm',
            '01:00 pm - 02:00 pm',
            '02:00 pm - 03:00 pm',
            '03:00 pm - 04:00 pm',
            '04:00 pm - 05:00 pm',
        ],
        Evening: [
            '05:00 pm - 06:00 pm',
            '06:00 pm - 07:00 pm',
            '07:00 pm - 08:00 pm',
            '08:00 pm - 09:00 pm',
            '09:00 pm - 10:00 pm',
        ],
    };

    // If database has no rooms yet, use these to force the grid shape to appear.
    const displayRooms =
        rooms && rooms.length > 0
            ? rooms
            : [
                  { id: 't1', name: 'ROOM 101' },
                  { id: 't2', name: 'ROOM 102' },
                  { id: 't3', name: 'ROOM 103' },
                  { id: 't4', name: 'ROOM 104' },
              ];

    // --- BULLETPROOF DATA FETCHER ---
    const formatTime = (time) => {
        if (!time) return '';

        return new Date(`1970-01-01T${time}`)
            .toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            .toLowerCase();
    };

    const scheduleMap = useMemo(() => {
        const map = {};

        schedules.forEach((s) => {
            if (!s.timeslot) return;

            const timeKey =
                `${formatTime(s.timeslot.start_time)}-${formatTime(s.timeslot.end_time)}`
                    .replace(/\s/g, '')
                    .toLowerCase();

            const dayKey = (s.timeslot.day || '').toLowerCase();

            // ROOM VIEW
            const roomKey = `${timeKey}|${dayKey}|room|${s.room_id}`;

            // TEACHER VIEW
            const teacherKey = `${timeKey}|${dayKey}|teacher|${s.teacher_id}`;

            // SECTION VIEW
            const sectionKey = `${timeKey}|${dayKey}|section|${s.section_id}`;

            map[roomKey] = s;
            map[teacherKey] = s;
            map[sectionKey] = s;
        });

        return map;
    }, [schedules]);

    const getSchedule = (
        time,
        room_id = null,
        day = null,
        teacher_id = null,
        section_id = null,
    ) => {
        const cleanTime = time.replace(/\s/g, '').toLowerCase();
        const dayKey = (day || '').toLowerCase();

        let key = '';

        if (room_id) {
            key = `${cleanTime}|${dayKey}|room|${room_id}`;
        }

        if (teacher_id) {
            key = `${cleanTime}|${dayKey}|teacher|${teacher_id}`;
        }

        if (section_id) {
            key = `${cleanTime}|${dayKey}|section|${section_id}`;
        }

        return scheduleMap[key] || null;
    };

    const buildRows = (data, type) => {
        return schedules
            .filter((s) =>
                type === 'section'
                    ? s.section_id === data.id
                    : s.teacher_id === data.id,
            )
            .map((s) => ({
                Time: s.timeslot
                    ? `${formatTime(s.timeslot.start_time)} - ${formatTime(
                          s.timeslot.end_time,
                      )}`
                    : '',
                Subject: s.subject?.code || '',
                [type === 'section' ? 'Teacher' : 'Section']:
                    type === 'section' ? s.teacher?.name : s.section?.name,
                Room: s.room?.generated_name || s.room?.name,
            }));
    };

    const downloadExcel = (data, title, type) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([]);

        const schoolName = 'AISAT COLLEGE - DASMARIÑAS';
        const address = 'Dasmariñas City, Cavite';

        const sectionName = data.name || title;
        const semesterInfo = activeVersion;

        const programName = 'BACHELOR OF SCIENCE IN COMPUTER SCIENCE';

        const effectivityDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
        });

        // HEADER
        const headerRows = [
            [schoolName, '', '', '', '', '', ''],
            [address, '', '', '', '', '', ''],
            [sectionName, '', '', '', '', '', ''],
            [semesterInfo, '', '', '', 'Effectivity:', effectivityDate],
            [programName, '', '', '', 'Updated:', effectivityDate],
            ['Time', ...DAYS],
        ];

        XLSX.utils.sheet_add_aoa(ws, headerRows, { origin: 'A1' });

        // BUILD GRID DATA (same logic as UI)
        const allTimes = [
            ...SHIFTS.Morning,
            ...SHIFTS.Afternoon,
            ...SHIFTS.Evening,
        ];

        const gridRows = allTimes.map((time) => {
            const row = [time];

            DAYS.forEach((day) => {
                const sched =
                    type === 'section'
                        ? getSchedule(time, null, day, null, data.id)
                        : getSchedule(time, null, day, data.id, null);

                if (sched) {
                    row.push(
                        `${sched.subject?.code || ''}\n${sched.room?.generated_name || sched.room?.name || ''} | ${sched.teacher?.code || sched.teacher?.name || ''}`,
                    );
                } else {
                    row.push('');
                }
            });

            return row;
        });

        XLSX.utils.sheet_add_aoa(ws, gridRows, { origin: 'A7' });

        // COLUMN WIDTHS
        ws['!cols'] = [{ wch: 20 }, ...DAYS.map(() => ({ wch: 22 }))];

        // MERGES (optional layout polish)
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
        XLSX.writeFile(wb, `${sectionName}_Schedule.xlsx`);
    };

    const downloadPDF = (data, title, type) => {
        const doc = new jsPDF();

        doc.text(`${title} Schedule`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = [
            'Time',
            'Subject',
            type === 'section' ? 'Teacher' : 'Section',
            'Room',
        ];

        const tableRows = buildRows(data, type).map((row) => [
            row.Time,
            row.Subject,
            row[type === 'section' ? 'Teacher' : 'Section'],
            row.Room,
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0] },
        });

        doc.save(`${title}_Schedule.pdf`);
    };

    // --- RENDER: MASTER GRID TAB ---
    const renderMasterGrid = () => {
        return (
            <div className="mt-6 overflow-hidden bg-white">
                <div
                    className="w-full overflow-x-auto overflow-y-auto pb-8"
                    style={{ maxHeight: '75vh' }}
                >
                    {Object.entries(SHIFTS).map(([shiftName, times]) => {
                        if (
                            filters.shift !== 'All Shift' &&
                            filters.shift !== shiftName
                        )
                            return null;

                        return (
                            <div
                                key={shiftName}
                                className="mb-10 min-w-max px-2"
                            >
                                <table className="w-full border-collapse border-2 border-black text-center text-sm">
                                    <thead>
                                        <tr>
                                            <th className="w-48 border-2 border-black bg-gray-100 p-3 text-sm font-black tracking-widest text-gray-900 uppercase">
                                                {shiftName}
                                            </th>
                                            {displayRooms.map((room) => (
                                                <th
                                                    key={room.id}
                                                    className="min-w-[200px] border-2 border-black bg-gray-50 p-3 font-bold tracking-wide text-gray-800 uppercase"
                                                >
                                                    {room.generated_name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {times.map((time) => (
                                            <tr
                                                key={time}
                                                className="transition-colors hover:bg-blue-50"
                                            >
                                                <td className="border-2 border-black bg-white p-2 font-bold whitespace-nowrap text-gray-800">
                                                    {time.split(' - ')[0]}{' '}
                                                    {/* Formats to just '07:00 am' */}
                                                </td>
                                                {displayRooms.map((room) => {
                                                    const sched = getSchedule(
                                                        time,
                                                        room.id,
                                                        filters.day,
                                                    );
                                                    return (
                                                        <td
                                                            key={`${time}-${room.id}`}
                                                            className={`h-16 border-2 border-black p-2 align-middle ${sched?.is_fallback ? 'bg-orange-50' : 'bg-white'}`}
                                                        >
                                                            {sched ? (
                                                                <div className="flex flex-col items-center justify-center text-xs">
                                                                    <span className="mb-0.5 text-sm font-black text-gray-900">
                                                                        {sched
                                                                            .teacher
                                                                            ?.code ||
                                                                            sched
                                                                                .teacher
                                                                                ?.name ||
                                                                            'TBA'}
                                                                    </span>
                                                                    <span className="font-semibold text-gray-700">
                                                                        {sched
                                                                            .section
                                                                            ?.name ||
                                                                            'TBA'}
                                                                    </span>
                                                                    {sched.is_fallback && (
                                                                        <span
                                                                            title="Fallback Assignment"
                                                                            className="mt-1 text-orange-500"
                                                                        >
                                                                            ⚠️
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-transparent select-none">
                                                                    -
                                                                </span>
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

    // --- RENDER: SECTION DETAIL (Time vs Day) ---
    const renderSectionDetail = () => (
        <div className="animate-fadeIn mt-4">
            <button
                onClick={() => setSelectedSection(null)}
                className="mb-4 text-sm font-bold text-gray-500 hover:text-black"
            >
                ← Back to Sections
            </button>
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">
                        {selectedSection.name}
                    </h2>
                    <div className="mt-1 text-sm text-gray-600 uppercase">
                        <div>Dept: Assigned Department</div>
                        <div>
                            Capacity: {selectedSection.student_count || 0}{' '}
                            Students
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex rounded-full bg-gray-900 p-1 text-sm font-bold text-white">
                        <button
                            className={`rounded-full px-6 py-1 ${sectionSet === 'Set A' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSectionSet('Set A')}
                        >
                            SET A (FTF)
                        </button>
                        <button
                            className={`rounded-full px-6 py-1 ${sectionSet === 'Set B' ? 'bg-gray-700' : ''}`}
                            onClick={() => setSectionSet('Set B')}
                        >
                            SET B (Online)
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                downloadExcel(
                                    selectedSection,
                                    selectedSection.name,
                                    'section',
                                )
                            }
                            className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                        >
                            Excel
                        </button>

                        {/* <button
                            onClick={() =>
                                downloadPDF(
                                    { id: selectedSection.id },
                                    selectedSection.name,
                                    'section',
                                )
                            }
                            className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                        >
                            PDF
                        </button> */}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white p-2">
                <table className="w-full min-w-max border-collapse border-2 border-black text-center text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="w-48 border-2 border-black p-3 font-black uppercase">
                                SHIFT
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day}
                                    className="border-2 border-black p-3 font-bold uppercase"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(SHIFTS).map(([shiftName, times]) =>
                            times.map((time, index) => (
                                <tr
                                    key={time}
                                    className="transition-colors hover:bg-blue-50"
                                >
                                    <td className="border-2 border-black bg-white p-2 font-bold whitespace-nowrap text-gray-800">
                                        {time.split(' - ')[0]}
                                    </td>
                                    {DAYS.map((day) => {
                                        const sched = getSchedule(
                                            time,
                                            null,
                                            day,
                                            null,
                                            selectedSection.id,
                                        );
                                        return (
                                            <td
                                                key={`${time}-${day}`}
                                                className="h-16 border-2 border-black bg-white p-2 align-middle"
                                            >
                                                {sched && (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <div className="mb-0.5 text-sm font-black text-gray-900">
                                                            {
                                                                sched.subject
                                                                    ?.code
                                                            }
                                                        </div>
                                                        <div className="font-semibold text-gray-700">
                                                            {
                                                                sched.room
                                                                    ?.generated_name
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                sched.teacher
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- RENDER: TEACHER DETAIL (Time vs Day) ---
    const renderTeacherDetail = () => (
        <div className="animate-fadeIn mt-4">
            <button
                onClick={() => setSelectedTeacher(null)}
                className="mb-4 text-sm font-bold text-gray-500 hover:text-black"
            >
                ← Back to Teachers
            </button>
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900">
                        {selectedTeacher.name}
                    </h2>
                    <div className="mt-1 text-sm text-gray-600 uppercase">
                        <div>Code: FAC-{selectedTeacher.id}</div>
                        <div>
                            Workload: {selectedTeacher.current_hours || 0}/
                            {selectedTeacher.max_hours || 0} Hours
                        </div>
                    </div>
                </div>

                {/* ✅ ADD THIS RIGHT SIDE BLOCK */}
                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            downloadExcel(
                                selectedTeacher,
                                selectedTeacher.name,
                                'teacher',
                            )
                        }
                        className="rounded bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                    >
                        Excel
                    </button>

                    {/* <button
                        onClick={() =>
                            downloadPDF(
                                { id: selectedTeacher.id },
                                selectedTeacher.name,
                                'teacher',
                            )
                        }
                        className="rounded bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    >
                        PDF
                    </button> */}
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl bg-white p-2">
                <table className="w-full min-w-max border-collapse border-2 border-black text-center text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="w-48 border-2 border-black p-3 font-black uppercase">
                                TIME
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day}
                                    className="border-2 border-black p-3 font-bold uppercase"
                                >
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(SHIFTS).map(([shiftName, times]) =>
                            times.map((time, index) => (
                                <tr
                                    key={time}
                                    className="transition-colors hover:bg-blue-50"
                                >
                                    <td className="border-2 border-black bg-white p-2 font-bold whitespace-nowrap text-gray-800">
                                        {time.split(' - ')[0]}
                                    </td>
                                    {DAYS.map((day) => {
                                        const sched = getSchedule(
                                            time,
                                            null,
                                            day,
                                            selectedTeacher.id,
                                            null,
                                        );
                                        return (
                                            <td
                                                key={`${time}-${day}`}
                                                className="h-16 border-2 border-black bg-white p-2 align-middle"
                                            >
                                                {sched && (
                                                    <div className="flex flex-col items-center text-xs">
                                                        <div className="mb-0.5 text-sm font-black text-gray-900">
                                                            {
                                                                sched.subject
                                                                    ?.code
                                                            }
                                                        </div>
                                                        <div className="font-semibold text-gray-700">
                                                            {sched.room
                                                                ?.generated_name ||
                                                                sched.room
                                                                    ?.name}{' '}
                                                            •{' '}
                                                            {
                                                                sched.section
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // --- MAIN LAYOUT RETURN ---
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Viewer" />
            <div className="max-w-[1400px] p-2 font-sans md:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-gray-900">
                        Schedule Viewer
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-gray-500 uppercase">
                        Viewing: {activeVersion}
                    </p>
                </div>

                {/* Top Navigation Pill */}
                <div className="mb-6 flex w-full rounded-full bg-gray-200 p-1 shadow-inner md:w-3/4">
                    <button
                        onClick={() => {
                            setActiveTab('grid');
                            setSelectedSection(null);
                            setSelectedTeacher(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-bold transition ${activeTab === 'grid' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        MASTER GRID
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('section');
                            setSelectedTeacher(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-bold transition ${activeTab === 'section' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        BY SECTION
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('teacher');
                            setSelectedSection(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-bold transition ${activeTab === 'teacher' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
                    >
                        BY TEACHER
                    </button>
                </div>

                {/* TAB 1: GRID VIEW */}
                {activeTab === 'grid' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 text-xs font-black tracking-wider text-gray-500 uppercase">
                            Grid Filters
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <select
                                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-sm font-bold text-gray-700"
                                value={filters.day}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        day: e.target.value,
                                    })
                                }
                            >
                                {DAYS.map((d) => (
                                    <option key={d}>{d}</option>
                                ))}
                            </select>
                            <select
                                className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 text-sm font-bold text-gray-700"
                                value={filters.shift}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        shift: e.target.value,
                                    })
                                }
                            >
                                <option>All Shift</option>
                                <option>Morning</option>
                                <option>Afternoon</option>
                                <option>Evening</option>
                            </select>
                        </div>
                        {renderMasterGrid()}
                    </div>
                )}

                {/* TAB 2: BY SECTION */}
                {activeTab === 'section' && !selectedSection && (
                    <div>
                        <input
                            type="text"
                            placeholder="Search Section..."
                            className="mb-6 w-full rounded-lg border-2 border-gray-200 bg-white p-3 font-bold shadow-sm md:w-1/3"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {sections &&
                                sections.map((s) => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedSection(s)}
                                        className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-5 transition hover:border-black"
                                    >
                                        <h2 className="mb-1 text-2xl font-black text-gray-900">
                                            {s.name}
                                        </h2>
                                        <p className="text-sm font-bold text-gray-500">
                                            👥 {s.student_count || 0} Students
                                        </p>
                                    </div>
                                ))}
                            {(!sections || sections.length === 0) && (
                                <p className="text-gray-500">
                                    No sections found in database.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'section' &&
                    selectedSection &&
                    renderSectionDetail()}

                {/* TAB 3: BY TEACHER */}
                {activeTab === 'teacher' && !selectedTeacher && (
                    <div>
                        <input
                            type="text"
                            placeholder="Search Teacher..."
                            className="mb-6 w-full rounded-lg border-2 border-gray-200 bg-white p-3 font-bold shadow-sm md:w-1/3"
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                            {teachers &&
                                teachers.map((t) => (
                                    <div
                                        key={t.id}
                                        onClick={() => setSelectedTeacher(t)}
                                        className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-5 transition hover:border-black"
                                    >
                                        <h2 className="mb-1 text-xl font-black text-gray-900">
                                            {t.name}
                                        </h2>
                                        <p className="text-sm font-bold text-gray-500">
                                            🕒 {t.current_hours || 0} Hrs
                                            Workload
                                        </p>
                                    </div>
                                ))}
                            {(!teachers || teachers.length === 0) && (
                                <p className="text-gray-500">
                                    No teachers found in database.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'teacher' &&
                    selectedTeacher &&
                    renderTeacherDetail()}
            </div>
        </AppLayout>
    );
}
