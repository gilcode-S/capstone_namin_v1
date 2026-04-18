from ortools.sat.python import cp_model


class SetModeEngine:

    def __init__(self):
        pass

    # -----------------------------
    # FAST MODE (PURE GREEDY FALLBACK)
    # -----------------------------
    def fast(self, assignments, timeslots):

        result = {}

        for i, a in enumerate(assignments):
            if timeslots:
                result[a["id"]] = timeslots[i % len(timeslots)]["id"]

        return {
            "mode": "fast",
            "schedule": result
        }

    # -----------------------------
    # GREEDY PRE-FILTER (VERY IMPORTANT)
    # -----------------------------
    def build_candidates(self, assignments, timeslots, rooms, rule_engine):

        candidates = {}

        for a in assignments:

            valid = []

            for t in timeslots:
                if not rule_engine.can_schedule(a, t):
                    continue

                for r in rooms:

                    valid.append((t["id"], r["id"]))

                    if len(valid) >= 10:  # 🔥 HARD LIMIT
                        break

            # fallback if empty
            if not valid and timeslots and rooms:
                valid = [(timeslots[0]["id"], rooms[0]["id"])]

            candidates[a["id"]] = valid

        return candidates

    # -----------------------------
    # BALANCED MODE (V2 HYBRID)
    # -----------------------------
    def balanced(self, assignments, rooms, timeslots, rule_engine):

        print("⚖️ BALANCED MODE V2 (HYBRID STABLE)")

        candidates = self.build_candidates(
            assignments, timeslots, rooms, rule_engine
        )

        model = cp_model.CpModel()
        x = {}

        # -----------------------------
        # VARIABLES (SMALL SEARCH SPACE ONLY)
        # -----------------------------
        for a in assignments:
            a_id = a["id"]

            for t_id, r_id in candidates[a_id]:

                x[(a_id, t_id, r_id)] = model.NewBoolVar(
                    f"x_{a_id}_{t_id}_{r_id}"
                )

        # -----------------------------
        # CONSTRAINT 1: each assignment picks 1
        # -----------------------------
        for a in assignments:
            a_id = a["id"]

            model.Add(
                sum(x[(a_id, t_id, r_id)]
                    for (aid, t_id, r_id) in x
                    if aid == a_id) >= 1
            )

        # -----------------------------
        # CONSTRAINT 2: room conflict
        # -----------------------------
        for t in timeslots:
            for r in rooms:

                model.Add(
                    sum(
                        x.get((a["id"], t["id"], r["id"]), 0)
                        for a in assignments
                    ) <= 1
                )

        # -----------------------------
        # OBJECTIVE (soft optimization)
        # -----------------------------
        model.Maximize(sum(x.values()))

        # -----------------------------
        # SOLVER SETTINGS (SAFE)
        # -----------------------------
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 2
        solver.parameters.num_search_workers = 8

        status = solver.Solve(model)

        print("Solver status:", solver.StatusName(status))

        # -----------------------------
        # RESULT (ALWAYS SAFE OUTPUT)
        # -----------------------------
        results = []

        for (a_id, t_id, r_id), var in x.items():
            if solver.Value(var) == 1:
                results.append({
                    "assignment_id": a_id,
                    "time_slot_id": t_id,
                    "room_id": r_id
                })

        # -----------------------------
        # FALLBACK (if CP-SAT fails)
        # -----------------------------
        if not results:
            print("⚠️ CP-SAT failed → using greedy fallback")

            for a in assignments:
                a_id = a["id"]
                t_id, r_id = candidates[a_id][0]

                results.append({
                    "assignment_id": a_id,
                    "time_slot_id": t_id,
                    "room_id": r_id
                })

        return {
            "mode": "balanced_v2",
            "schedule": results,
            "status": solver.StatusName(status)
        }

    # -----------------------------
    # RUN
    # -----------------------------
    def run(self, mode, assignments, rooms, timeslots, rule_engine):

        if mode == "fast":
            return self.fast(assignments, timeslots)

        return self.balanced(assignments, rooms, timeslots, rule_engine)