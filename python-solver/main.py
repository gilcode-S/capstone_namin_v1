from fastapi import FastAPI, Request
from ortools.sat.python import cp_model
import time
from collections import defaultdict
import random

app = FastAPI()


# ---------------------------------
# HUMAN-LIKE GREEDY TIMESLOT
# ---------------------------------
def greedy_timeslot(assignments, timeslots):

    section_busy = set()
    faculty_busy = set()

    result = {}

    # -----------------------------
    # Group timeslots by day
    # -----------------------------
    timeslots_by_day = defaultdict(list)

    for t in timeslots:
        day = t.get("day") or t.get("day_of_week") or t.get("dayOfWeek")

        if not day:
            print("❌ BAD TIMESLOT:", t)
            raise ValueError("Timeslot missing day field")

        timeslots_by_day[day].append(t)

    # -----------------------------
    # Track load per day
    # -----------------------------
    day_load = {day: 0 for day in timeslots_by_day.keys()}

    # -----------------------------
    # Sort assignments (hard first)
    # -----------------------------
    assignments_sorted = sorted(
        assignments,
        key=lambda x: (x.get("faculty_id") is None, x["section_id"])
    )

    # -----------------------------
    # Assign timeslots
    # -----------------------------
    for a in assignments_sorted:
        a_id = a["id"]
        section = a["section_id"]
        faculty = a.get("faculty_id")

        # pick least-loaded day first
        sorted_days = sorted(day_load.keys(), key=lambda d: day_load[d])

        assigned = False

        for day in sorted_days:

            day_slots = timeslots_by_day[day][:]
            random.shuffle(day_slots)  # avoid same-hour stacking

            for t in day_slots:
                t_id = t["id"]

                if (section, t_id) in section_busy:
                    continue

                if faculty and (faculty, t_id) in faculty_busy:
                    continue

                # assign
                result[a_id] = t_id
                section_busy.add((section, t_id))

                if faculty:
                    faculty_busy.add((faculty, t_id))

                day_load[day] += 1
                assigned = True
                break

            if assigned:
                break

        # fallback (rare)
        if not assigned:
            for t in timeslots:
                t_id = t["id"]

                if (section, t_id) in section_busy:
                    continue

                if faculty and (faculty, t_id) in faculty_busy:
                    continue

                result[a_id] = t_id
                section_busy.add((section, t_id))

                if faculty:
                    faculty_busy.add((faculty, t_id))

                break

    print("Day distribution:", day_load)

    return result


# ---------------------------------
# MAIN API
# ---------------------------------
@app.post("/generate")
async def generate_schedule(request: Request):
    """
    Expects JSON body with keys:
    - assignments: list of dicts
    - rooms: list of dicts
    - timeslots: list of dicts (each with 'day' or 'day_of_week')
    """

    # Parse JSON request
    data = await request.json()

    # Debug print
    print("=== FULL REQUEST DATA ===")
    print(data)

    assignments = data.get("assignments")
    rooms = data.get("rooms")
    timeslots = data.get("timeslots")

    print("Received timeslots:", timeslots)
    if timeslots and isinstance(timeslots, list) and len(timeslots) > 0:
        print("Sample timeslot keys:", list(timeslots[0].keys()))
    else:
        print("No timeslots received or empty or wrong format!")

    # -------------
    # Normalization: Ensure each timeslot has a day field
    # -------------
    for i, t in enumerate(timeslots):
        if not (t.get("day") or t.get("day_of_week") or t.get("dayOfWeek")):
            print(f"⚠️ Timeslot missing day field at index {i}, injecting default 'Monday': {t}")
            t["day_of_week"] = "Monday"  # default fallback to Monday

    start_total = time.time()

    # ---------------------------------
    # STEP 1: HUMAN GREEDY
    # ---------------------------------
    timeslot_assignment = greedy_timeslot(assignments, timeslots)

    print("Timeslots assigned:", len(timeslot_assignment))

    # ---------------------------------
    # STEP 2: CP-SAT (ROOM ASSIGNMENT)
    # ---------------------------------
    model = cp_model.CpModel()

    assign_room = {}

    # create vars
    for a in assignments:
        a_id = a["id"]

        if a_id not in timeslot_assignment:
            continue

        for r in rooms:
            assign_room[(a_id, r["id"])] = model.NewBoolVar(
                f"a{a_id}_r{r['id']}"
            )

    # each assignment → 1 room
    for a in assignments:
        a_id = a["id"]

        if a_id not in timeslot_assignment:
            continue

        model.Add(
            sum(assign_room[(a_id, r["id"])] for r in rooms) == 1
        )

    # room conflict (same time)
    for r in rooms:
        for t in timeslots:

            vars_list = []

            for a in assignments:
                a_id = a["id"]

                if timeslot_assignment.get(a_id) != t["id"]:
                    continue

                vars_list.append(assign_room[(a_id, r["id"])])

            if vars_list:
                model.Add(sum(vars_list) <= 1)

    # objective
    model.Maximize(sum(assign_room.values()))

    # solve
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10
    solver.parameters.num_search_workers = 8

    start = time.time()
    status = solver.Solve(model)
    solve_time = time.time() - start

    print("CP-SAT Status:", solver.StatusName(status))
    print("CP-SAT Time:", solve_time)

    # ---------------------------------
    # BUILD RESULT
    # ---------------------------------
    results = []

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):

        for a in assignments:
            a_id = a["id"]

            if a_id not in timeslot_assignment:
                continue

            assigned_room = None

            for r in rooms:
                if solver.Value(assign_room[(a_id, r["id"])]) == 1:
                    assigned_room = r["id"]
                    break

            if assigned_room:
                results.append({
                    "assignment_id": a_id,
                    "room_id": assigned_room,
                    "time_slot_id": timeslot_assignment[a_id]
                })

    total_time = time.time() - start_total

    print("Total time:", total_time)
    print("Scheduled classes:", len(results))

    return {
        "total_time": total_time,
        "cp_sat_time": solve_time,
        "scheduled": len(results),
        "schedule": results
    }