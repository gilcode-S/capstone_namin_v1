from ortools.sat.python import cp_model
import json

def generate_schedule(data):

    # CREATE MODEL
    model = cp_model.CpModel()

    schedules = []

    # INPUT DATA
    units = data["units"]          # scheduling_units
    teachers = data["teachers"]    # ranked teachers
    rooms = data["rooms"]          # rooms + timeslots

    x = {}

    # -----------------------------------------
    # CREATE DECISION VARIABLES
    # -----------------------------------------
    for u in units:
        for t in teachers:
            for r in rooms:
                for ts in r["timeslots"]:

                    key = (u["id"], t["id"], r["id"], ts["id"])

                    x[key] = model.NewBoolVar(
                        f"x_u{u['id']}_t{t['id']}_r{r['id']}_ts{ts['id']}"
                    )

    # -----------------------------------------
    # HARD: EACH UNIT MUST BE ASSIGNED ONCE
    # -----------------------------------------
    for u in units:

        possible = []

        for key in x:
            if key[0] == u["id"]:
                possible.append(x[key])

        model.Add(sum(possible) == 1)

    # -----------------------------------------
    # HARD: TEACHER CONFLICT
    # -----------------------------------------
    for t in teachers:
        for r in rooms:
            for ts in r["timeslots"]:

                same_time = []

                for u in units:
                    key = (u["id"], t["id"], r["id"], ts["id"])
                    if key in x:
                        same_time.append(x[key])

                if same_time:
                    model.Add(sum(same_time) <= 1)

    # -----------------------------------------
    # HARD: ROOM CONFLICT
    # -----------------------------------------
    for r in rooms:
        for ts in r["timeslots"]:

            same_room = []

            for u in units:
                for t in teachers:
                    key = (u["id"], t["id"], r["id"], ts["id"])
                    if key in x:
                        same_room.append(x[key])

            if same_room:
                model.Add(sum(same_room) <= 1)

    # -----------------------------------------
    # OBJECTIVE: MAXIMIZE RANKING SCORE
    # -----------------------------------------
    objective = []

    for u in units:
        for t in teachers:
            for r in rooms:
                for ts in r["timeslots"]:

                    key = (u["id"], t["id"], r["id"], ts["id"])

                    if key in x:
                        score = t.get("score", 0.5)
                        objective.append(x[key] * int(score * 100))

    model.Maximize(sum(objective))

    # -----------------------------------------
    # SOLVE
    # -----------------------------------------
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30

    status = solver.Solve(model)

    if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:

        for key, var in x.items():
            if solver.Value(var) == 1:
                schedules.append({
                    "unit_id": key[0],
                    "teacher_id": key[1],
                    "room_id": key[2],
                    "timeslot_id": key[3]
                })

    return schedules


if __name__ == "__main__":
    import sys

    data = json.loads(sys.stdin.read())

    result = generate_schedule(data)

    print(json.dumps({"schedule": result}))

