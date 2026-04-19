class CandidateBuilder:

    def build(self, assignment, timeslots, rooms, teachers, rule_engine):

        candidates = []

        for t in timeslots:
            if not rule_engine.can_schedule(assignment, t):
                continue

            for r in rooms:
                if r["type"] != assignment.get("room_type"):
                    continue

                candidates.append({
                    "timeslot_id": t["id"],
                    "room_id": r["id"]
                })

        return candidates