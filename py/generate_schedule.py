# =========================================================
# STEP 4 — FINAL CP-SAT SCHEDULING ENGINE
# WITH ADVANCED CONSTRAINTS + SPLIT LOGIC
# =========================================================

from ortools.sat.python import cp_model
import json

def generate_schedule(data):
    # -----------------------------------------------------
    # CREATE MODEL
    # -----------------------------------------------------
    model = cp_model.CpModel()

    schedules = []  # final output

    # -----------------------------------------------------
    # DATA INPUT
    # -----------------------------------------------------
    subjects = data["subjects"]        # subjects from curriculum
    teachers = data["teachers"]        # ranked teachers
    rooms = data["rooms"]              # room + timeslot pool

    # -----------------------------------------------------
    # DECISION VARIABLES
    # x = 1 if assignment is used
    # -----------------------------------------------------
    x = {}

    for s in subjects:
        for t in teachers:
            for r in rooms:
                for ts in r["timeslots"]:

                    key = (s["id"], t["id"], r["id"], ts["id"])

                    x[key] = model.NewBoolVar(
                        f"x_s{s['id']}_t{t['id']}_r{r['id']}_ts{ts['id']}"
                    )

    # -----------------------------------------------------
    # SUBJECT DELIVERY RULE (VERY IMPORTANT)
    # -----------------------------------------------------
    # 3 units → 2h + 1h
    # 2 units → 2h
    # 1 unit → 1h
    # -----------------------------------------------------
    def get_required_meetings(units):
        if units == 3:
            return [2, 1]  # split
        elif units == 2:
            return [2]
        else:
            return [1]

    # -----------------------------------------------------
    # HARD CONSTRAINT 1: EXACT SUBJECT ASSIGNMENT
    # -----------------------------------------------------
    # Each subject must be scheduled exactly based on required meetings
    # -----------------------------------------------------
    for s in subjects:

        meetings = get_required_meetings(s["units"])

        total_assignments = []

        for key in x:
            if key[0] == s["id"]:
                total_assignments.append(x[key])

        # number of meetings = required number of placements
        model.Add(sum(total_assignments) == len(meetings))

    # -----------------------------------------------------
    # HARD CONSTRAINT 2: NO TEACHER CONFLICT
    # -----------------------------------------------------
    # A teacher cannot teach 2 classes at same time
    # -----------------------------------------------------
    for t in teachers:
        for r in rooms:
            for ts in r["timeslots"]:

                same_time = []

                for s in subjects:
                    key = (s["id"], t["id"], r["id"], ts["id"])
                    if key in x:
                        same_time.append(x[key])

                if same_time:
                    model.Add(sum(same_time) <= 1)

    # -----------------------------------------------------
    # HARD CONSTRAINT 3: NO ROOM CONFLICT
    # -----------------------------------------------------
    # A room cannot be used twice at same time
    # -----------------------------------------------------
    for r in rooms:
        for ts in r["timeslots"]:

            same_room = []

            for s in subjects:
                for t in teachers:
                    key = (s["id"], t["id"], r["id"], ts["id"])
                    if key in x:
                        same_room.append(x[key])

            if same_room:
                model.Add(sum(same_room) <= 1)

    # -----------------------------------------------------
    # HARD CONSTRAINT 4: PREFERRED TEACHER
    # -----------------------------------------------------
    for s in subjects:
        if s.get("preferred_teacher_id"):

            for t in teachers:
                if t["id"] != s["preferred_teacher_id"]:

                    for r in rooms:
                        for ts in r["timeslots"]:
                            key = (s["id"], t["id"], r["id"], ts["id"])
                            if key in x:
                                model.Add(x[key] == 0)

    # -----------------------------------------------------
    # HARD CONSTRAINT 5: PREFERRED DAY
    # -----------------------------------------------------
    for s in subjects:
        if s.get("preferred_day"):

            for t in teachers:
                for r in rooms:
                    for ts in r["timeslots"]:

                        if ts["day"] != s["preferred_day"]:
                            key = (s["id"], t["id"], r["id"], ts["id"])
                            if key in x:
                                model.Add(x[key] == 0)

    # -----------------------------------------------------
    # HARD CONSTRAINT 6: PREFERRED SHIFT
    # -----------------------------------------------------
    for s in subjects:
        if s.get("preferred_shift"):

            for t in teachers:
                for r in rooms:
                    for ts in r["timeslots"]:

                        if ts["shift"] != s["preferred_shift"]:
                            key = (s["id"], t["id"], r["id"], ts["id"])
                            if key in x:
                                model.Add(x[key] == 0)

    # -----------------------------------------------------
    # HARD CONSTRAINT 7: CONSECUTIVE RULE (FOR 2H BLOCK)
    # -----------------------------------------------------
    # If subject needs 2-hour block, enforce consecutive slots
    # -----------------------------------------------------
    for s in subjects:

        meetings = get_required_meetings(s["units"])

        if 2 in meetings:  # needs 2h block

            for t in teachers:
                for r in rooms:

                    for i in range(len(r["timeslots"]) - 1):

                        ts1 = r["timeslots"][i]
                        ts2 = r["timeslots"][i + 1]

                        if ts1["day"] == ts2["day"]:

                            key1 = (s["id"], t["id"], r["id"], ts1["id"])
                            key2 = (s["id"], t["id"], r["id"], ts2["id"])

                            if key1 in x and key2 in x:
                                # enforce pairing
                                model.Add(x[key1] == x[key2])

    # -----------------------------------------------------
    # OBJECTIVE FUNCTION
    # -----------------------------------------------------
    # Maximize teacher ranking score
    # -----------------------------------------------------
    objective_terms = []

    for s in subjects:
        for t in teachers:
            for r in rooms:
                for ts in r["timeslots"]:

                    key = (s["id"], t["id"], r["id"], ts["id"])

                    if key in x:
                        score = t.get("score", 0.5)
                        objective_terms.append(x[key] * int(score * 100))

    model.Maximize(sum(objective_terms))

    # -----------------------------------------------------
    # SOLVE MODEL
    # -----------------------------------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30

    status = solver.Solve(model)

    # -----------------------------------------------------
    # OUTPUT RESULT
    # -----------------------------------------------------
    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:

        for key, var in x.items():
            if solver.Value(var) == 1:

                schedules.append({
                    "subject_id": key[0],
                    "teacher_id": key[1],
                    "room_id": key[2],
                    "timeslot_id": key[3]
                })

    return schedules


# ---------------------------------------------------------
# API ENTRY POINT (FOR LARAVEL)
# ---------------------------------------------------------
if __name__ == "__main__":
    import sys

    data = json.loads(sys.stdin.read())

    result = generate_schedule(data)

    print(json.dumps({
        "schedule": result
    }))





