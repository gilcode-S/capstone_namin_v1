import { useMemo } from "react"

interface Program {
    id: number
    program_name: string
    department_id: number
}

interface Section {
    id?: number
    section_name: string
    program: Program
}

interface Subject {
    subject_code: string
    subject_name: string
}

interface Faculty {
    id?: number
    first_name: string
    last_name: string
}

interface Assignment {
    section: Section
    subject: Subject
    faculty: Faculty
}

interface Room {
    id?: number
    room_name: string
}

interface Timeslot {
    id: number
    day_of_week: string
    start_time: string
    end_time: string
}

interface Schedule {
    id: number
    assignment: Assignment
    room: Room
    timeslot: Timeslot
}

interface Props {
    schedules: Schedule[]
    timeslots: Timeslot[]
}

export default function TimetableGrid({ schedules, timeslots }: Props) {

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ]

    const uniqueTimes = useMemo(() => {

        const map = new Map()

        timeslots.forEach(t => {
            const key = `${t.start_time}-${t.end_time}`
            map.set(key, t)
        })

        return Array.from(map.values())

    }, [timeslots])

    const getSchedules = (day: string, start: string) => {
        return schedules.filter(
            s =>
                s.timeslot.day_of_week === day &&
                s.timeslot.start_time === start
        )
    }

    const detectConflict = (entries: Schedule[]) => {

        const facultySet = new Set<string>()
        const roomSet = new Set<string>()
        const sectionSet = new Set<string>()

        let type: "none" | "faculty" | "room" | "section" = "none"

        entries.forEach(e => {

            const faculty = e.assignment.faculty.first_name + e.assignment.faculty.last_name
            const room = e.room.room_name
            const section = e.assignment.section.section_name

            if (facultySet.has(faculty)) type = "faculty"
            if (roomSet.has(room)) type = "room"
            if (sectionSet.has(section)) type = "section"

            facultySet.add(faculty)
            roomSet.add(room)
            sectionSet.add(section)

        })

        return type
    }

    return (

        <div>

            {/* Legend */}
            <div className="flex gap-4 mb-4 text-sm">

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 border border-blue-400"></div>
                    Normal
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 border border-yellow-400"></div>
                    Section Conflict
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-200 border border-orange-400"></div>
                    Room Conflict
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 border border-red-500"></div>
                    Faculty Conflict
                </div>

            </div>

            <div className="overflow-x-auto border rounded-lg shadow">

                <table className="w-full border-collapse text-sm">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="border px-4 py-2 w-[120px] text-left">
                                Time
                            </th>

                            {days.map(day => (
                                <th key={day} className="border px-4 py-2 text-center">
                                    {day}
                                </th>
                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {uniqueTimes.map((time) => (

                            <tr key={time.id}>

                                <td className="border px-3 py-2 font-medium">
                                    {time.start_time} - {time.end_time}
                                </td>

                                {days.map(day => {

                                    const entries = getSchedules(day, time.start_time)

                                    const conflictType = detectConflict(entries)

                                    const colorClass =
                                        conflictType === "faculty"
                                            ? "bg-red-200 border-red-500"
                                            : conflictType === "room"
                                                ? "bg-orange-200 border-orange-500"
                                                : conflictType === "section"
                                                    ? "bg-yellow-200 border-yellow-500"
                                                    : "bg-blue-100 border-blue-300"

                                    return (

                                        <td
                                            key={day}
                                            className="border px-2 py-2 align-top min-w-[160px]"
                                        >

                                            {entries.map(s => (

                                                <div
                                                    key={s.id}
                                                    className={`mb-1 rounded-md p-2 text-xs border ${colorClass}`}
                                                >

                                                    <div className="font-semibold">
                                                        {s.assignment.subject.subject_code}
                                                    </div>

                                                    <div>
                                                        {s.assignment.section.section_name}
                                                    </div>

                                                    <div className="flex justify-between mt-1 text-gray-600">

                                                        <span>
                                                            {s.assignment.faculty.first_name}
                                                        </span>

                                                        <span className="bg-white px-1 rounded text-[10px] border">
                                                            {s.room.room_name}
                                                        </span>

                                                    </div>

                                                </div>

                                            ))}

                                        </td>

                                    )

                                })}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    )
}