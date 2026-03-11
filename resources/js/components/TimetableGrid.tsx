import { useMemo } from "react"

interface Schedule {
    id: number
    assignment: any
    room: any
    timeslot: any
}

interface Props {
    schedules: Schedule[]
    timeslots: any[]
}

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

const subjectColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
]

export default function TimetableGrid({ schedules, timeslots }: Props) {

    const rows = useMemo(() => {
        const grouped: any = {}

        timeslots.forEach(slot => {
            const key = `${slot.start_time}-${slot.end_time}`
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(slot)
        })

        return Object.entries(grouped)
    }, [timeslots])

    const getSchedule = (day: string, start: string, end: string) => {
        return schedules.find(s =>
            s.timeslot.day_of_week === day &&
            s.timeslot.start_time === start &&
            s.timeslot.end_time === end
        )
    }

    const getColor = (subject: string) => {
        const index = subject.charCodeAt(0) % subjectColors.length
        return subjectColors[index]
    }

    return (
        <div className="mt-10 border rounded-xl overflow-hidden shadow">

            <div className="bg-gray-100 p-4 font-semibold text-lg">
                Weekly Timetable
            </div>

            <div className="overflow-x-auto">

                <table className="w-full text-sm">

                    <thead className="bg-gray-50">
                        <tr>

                            <th className="p-3 border w-32">Time</th>

                            {days.map(day => (
                                <th key={day} className="border p-3 text-center">
                                    {day}
                                </th>
                            ))}

                        </tr>
                    </thead>

                    <tbody>

                        {rows.map(([timeKey, slots]: any) => {

                            const slot = slots[0]
                            const start = slot.start_time
                            const end = slot.end_time

                            return (
                                <tr key={timeKey}>

                                    <td className="border p-3 font-medium text-gray-700">
                                        {start} - {end}
                                    </td>

                                    {days.map(day => {

                                        const sched = getSchedule(day, start, end)

                                        return (
                                            <td key={day} className="border h-24 p-1 align-top">

                                                {sched && (

                                                    <div
                                                        className={`rounded-lg p-2 text-white text-xs shadow-md hover:scale-105 transition cursor-pointer ${getColor(
                                                            sched.assignment.subject.subject_code
                                                        )}`}
                                                        title={`${sched.assignment.subject.subject_name}
Faculty: ${sched.assignment.faculty.first_name} ${sched.assignment.faculty.last_name}
Room: ${sched.room.room_name}`}
                                                    >

                                                        <div className="font-bold">
                                                            {sched.assignment.subject.subject_code}
                                                        </div>

                                                        <div className="opacity-90">
                                                            {sched.assignment.faculty.first_name}
                                                        </div>

                                                        <div className="mt-1 bg-white/20 px-2 py-0.5 rounded text-[10px] inline-block">
                                                            {sched.room.room_name}
                                                        </div>

                                                    </div>

                                                )}

                                            </td>
                                        )
                                    })}

                                </tr>
                            )
                        })}

                    </tbody>

                </table>

            </div>

        </div>
    )
}