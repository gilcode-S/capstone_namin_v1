import json
import sys
from collections import defaultdict
from ortools.sat.python import cp_model


# =====================================================
# CONFIG (🔥 NEW)
# =====================================================
MAX_COMBOS = 50
MAX_ROOMS = 5


# =====================================================
# TIMESLOT FILTER (with preferred_days)
# =====================================================
def filter_timeslots(unit, timeslots):
    preferred = unit.get("preferred_shift")
    preferred_days = unit.get("preferred_days", [])
    year = unit.get("year_level", 1)

    filtered = []

    for ts in timeslots:
        shift = ts.get("shift")
        day = ts.get("day")

        # preferred days
        if preferred_days and day not in preferred_days:
            continue

        if preferred:
            if shift == preferred:
                filtered.append(ts)
            continue

        if year <= 2:
            if shift in ["morning", "afternoon"]:
                filtered.append(ts)
        elif year == 3:
            if shift == "afternoon":
                filtered.append(ts)
        else:
            if shift == "evening":
                filtered.append(ts)

    return filtered if filtered else timeslots


# =====================================================
# ROOM FILTER + LIMIT
# =====================================================
def filter_rooms(unit, rooms):
    required_type = unit.get("room_type", "classroom")

    filtered = [
        r for r in rooms
        if r.get("type", "classroom").lower() == required_type.lower()
    ]

    return (filtered if filtered else rooms)[:MAX_ROOMS]


# =====================================================
# LOAD DATA
# =====================================================
input_path = sys.argv[1]

with open(input_path, "r") as f:
    data = json.load(f)

units = data["class_units"]
rooms = data["rooms"]
timeslots = data["timeslots"]

unit_map = {u["id"]: u for u in units}
timeslot_map = {t["id"]: t for t in timeslots}


# =====================================================
# DOMAIN BUILD (LIMITED)
# =====================================================
unit_domains = {}

for unit in units:
    combos = []

    for r in filter_rooms(unit, rooms):
        for t in filter_timeslots(unit, timeslots):
            combos.append((r["id"], t["id"]))

    # 🔥 LIMIT DOMAIN SIZE
    unit_domains[unit["id"]] = combos[:MAX_COMBOS]


# =====================================================
# SORT (HARDEST FIRST)
# =====================================================
units_sorted = sorted(units, key=lambda u: len(unit_domains[u["id"]]))

# 🔥 20% split (your request)
split_index = int(len(units_sorted) * 0.2)

hard_units = units_sorted[:split_index]
easy_units = units_sorted[split_index:]


# =====================================================
# MODEL
# =====================================================
model = cp_model.CpModel()

assignments = {}
domain_map = {}
pre_assigned = {}

room_time_map = defaultdict(list)
section_time_map = defaultdict(list)
teacher_time_map = defaultdict(list)


# =====================================================
# VARIABLE BUILDER
# =====================================================
def build_variables(unit_list):
    for unit in unit_list:
        uid = unit["id"]
        combos = unit_domains[uid]

        if len(combos) == 1:
            pre_assigned[uid] = combos[0]
            continue

        domain_map[uid] = []

        for (room_id, ts_id) in combos:
            var = model.NewBoolVar(f"x_{uid}_{room_id}_{ts_id}")

            assignments[(uid, room_id, ts_id)] = var
            domain_map[uid].append(var)

            room_time_map[(room_id, ts_id)].append(var)
            section_time_map[(unit["section_id"], ts_id)].append(var)

            teacher_id = unit.get("teacher_id")
            if teacher_id:
                teacher_time_map[(teacher_id, ts_id)].append(var)


# =====================================================
# CONSTRAINTS
# =====================================================
def add_constraints():
    for vars_ in domain_map.values():
        if vars_:
            model.Add(sum(vars_) == 1)

    for vars_ in room_time_map.values():
        model.Add(sum(vars_) <= 1)

    for vars_ in section_time_map.values():
        model.Add(sum(vars_) <= 1)


# =====================================================
# BUILD HARD UNITS
# =====================================================
build_variables(hard_units)

# =====================================================
# SAFE PRE-ASSIGNED BLOCKING (FIXED)
# =====================================================
for uid, (room_id, ts_id) in pre_assigned.items():

    unit = unit_map[uid]
    teacher_id = unit.get("teacher_id")
    section_id = unit.get("section_id")

    for (u, r, t), var in assignments.items():

        if u != uid:  # 🔥 CRITICAL FIX

            if u != uid and r == room_id and t == ts_id:
                model.Add(var == 0)


add_constraints()


# =====================================================
# PARTIAL SOLVE
# =====================================================
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = 20

status = solver.Solve(model)

if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    for (uid, r, t), var in assignments.items():
        if solver.Value(var) == 1:
            model.Add(var == 1)


# =====================================================
# BUILD EASY UNITS
# =====================================================
build_variables(easy_units)
add_constraints()


# =====================================================
# SOFT CONSTRAINTS (RELAXED)
# =====================================================
teacher_penalties = []
spread_penalties = []

# 🔥 RELAXED TEACHER
for (teacher_id, ts_id), vars_ in teacher_time_map.items():
    overload = model.NewIntVar(0, 10, f"over_{teacher_id}_{ts_id}")
    model.Add(sum(vars_) <= 2 + overload)
    teacher_penalties.append(overload)

# SECTION SPREAD
section_day_map = defaultdict(list)

for uid, (r, t) in pre_assigned.items():
    day = timeslot_map[t]["day"]
    section_id = unit_map[uid]["section_id"]
    section_day_map[(section_id, day)].append(model.NewConstant(1))

for (uid, r, t), var in assignments.items():
    day = timeslot_map[t]["day"]
    section_id = unit_map[uid]["section_id"]
    section_day_map[(section_id, day)].append(var)

for (section_id, day), vars_ in section_day_map.items():
    if len(vars_) > 1:
        spread = model.NewIntVar(0, 10, f"spread_{section_id}_{day}")
        model.Add(sum(vars_) <= 3 + spread * 2)  # 🔥 RELAXED
        spread_penalties.append(spread)


# =====================================================
# OBJECTIVE
# =====================================================
model.Minimize(
    sum(teacher_penalties) * 5 +
    sum(spread_penalties)
)


# =====================================================
# FINAL SOLVE
# =====================================================
solver.parameters.max_time_in_seconds = 60
status = solver.Solve(model)


# =====================================================
# 🔥 LAYER 8 FALLBACK (INSIDE PYTHON)
# =====================================================
if status == cp_model.INFEASIBLE:

    model = cp_model.CpModel()

    assignments.clear()
    domain_map.clear()
    room_time_map.clear()
    section_time_map.clear()
    teacher_time_map.clear()

    build_variables(units)
    add_constraints()

    for (teacher_id, ts_id), vars_ in teacher_time_map.items():
        model.Add(sum(vars_) <= 3)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30

    status = solver.Solve(model)


# =====================================================
# OUTPUT
# =====================================================
result = []

for uid, (r, t) in pre_assigned.items():
    result.append({
        "unit_id": uid,
        "room_id": r,
        "timeslot_id": t
    })

if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    for (uid, r, t), var in assignments.items():
        if solver.Value(var) == 1:
            result.append({
                "unit_id": uid,
                "room_id": r,
                "timeslot_id": t
            })


print(json.dumps({
    "result": result,
    "debug": {
        "status": str(status),
        "units": len(units),
        "variables": len(assignments),
        "preassigned": len(pre_assigned),
        "generated": len(result)
    }
}))