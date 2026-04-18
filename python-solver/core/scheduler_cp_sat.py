from ortools.sat.python import cp_model


class SchedulerCPSAT:

    def assign_rooms(self, assignments, rooms, timeslot_assignment):

        model = cp_model.CpModel()
        assign_room = {}

        # -----------------------------
        # VARIABLES
        # -----------------------------
        for a in assignments:
            a_id = a["id"]

            if a_id not in timeslot_assignment:
                continue

            for r in rooms:
                assign_room[(a_id, r["id"])] = model.NewBoolVar(
                    f"a{a_id}_r{r['id']}"
                )

        # -----------------------------
        # EACH ASSIGNMENT → 1 ROOM
        # -----------------------------
        for a in assignments:
            a_id = a["id"]

            if a_id not in timeslot_assignment:
                continue

            model.Add(
                sum(assign_room[(a_id, r["id"])] for r in rooms) == 1
            )

        # -----------------------------
        # ROOM CONFLICT
        # -----------------------------
        for r in rooms:
            for t_id in set(timeslot_assignment.values()):

                vars_list = []

                for a in assignments:
                    if timeslot_assignment.get(a["id"]) != t_id:
                        continue

                    vars_list.append(assign_room[(a["id"], r["id"])])

                if vars_list:
                    model.Add(sum(vars_list) <= 1)

        # -----------------------------
        # SOLVE
        # -----------------------------
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 5
        solver.Solve(model)

        # -----------------------------
        # BUILD RESULT
        # -----------------------------
        results = []

        for a in assignments:
            a_id = a["id"]

            if a_id not in timeslot_assignment:
                continue

            for r in rooms:
                if solver.Value(assign_room[(a_id, r["id"])]) == 1:
                    results.append({
                        "assignment_id": a_id,
                        "room_id": r["id"],
                        "time_slot_id": timeslot_assignment[a_id]
                    })
                    break

        return results