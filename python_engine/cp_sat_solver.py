from ortools.sat.python import cp_model
import json

class CPSATScheduler:

    def __init__(self, data):
        self.data = data
        self.model = cp_model.CpModel()

        self.assignments = {}

    def build_variables(self):
        """
        Create binary decision variables:
        X[unit, teacher, room, timeslot]
        """

        for u in self.data['class_units']:
            for t in self.data['teachers']:
                for r in self.data['rooms']:
                    for ts in self.data['timeslots']:

                        key = (u['id'], t['id'], r['id'], ts['id'])

                        self.assignments[key] = self.model.NewBoolVar(
                            f"x_{u['id']}_{t['id']}_{r['id']}_{ts['id']}"
                        )

    # -------------------------
    # HARD CONSTRAINTS
    # -------------------------

    def add_constraints(self):

        self.teacher_conflict()
        self.room_conflict()
        self.one_assignment_per_unit()
        self.teacher_single_slot()

    def teacher_conflict(self):

        for t in self.data['teachers']:
            for ts in self.data['timeslots']:

                vars_ = []

                for u in self.data['class_units']:
                    for r in self.data['rooms']:

                        key = (u['id'], t['id'], r['id'], ts['id'])
                        if key in self.assignments:
                            vars_.append(self.assignments[key])

                self.model.Add(sum(vars_) <= 1)

    def room_conflict(self):

        for r in self.data['rooms']:
            for ts in self.data['timeslots']:

                vars_ = []

                for u in self.data['class_units']:
                    for t in self.data['teachers']:

                        key = (u['id'], t['id'], r['id'], ts['id'])
                        if key in self.assignments:
                            vars_.append(self.assignments[key])

                self.model.Add(sum(vars_) <= 1)

    def one_assignment_per_unit(self):

        for u in self.data['class_units']:

            vars_ = []

            for t in self.data['teachers']:
                for r in self.data['rooms']:
                    for ts in self.data['timeslots']:

                        key = (u['id'], t['id'], r['id'], ts['id'])
                        if key in self.assignments:
                            vars_.append(self.assignments[key])

            self.model.Add(sum(vars_) == 1)

    def teacher_single_slot(self):

        for t in self.data['teachers']:
            for ts in self.data['timeslots']:

                vars_ = []

                for u in self.data['class_units']:
                    for r in self.data['rooms']:

                        key = (u['id'], t['id'], r['id'], ts['id'])
                        if key in self.assignments:
                            vars_.append(self.assignments[key])

                self.model.Add(sum(vars_) <= 1)

    # -------------------------
    # OBJECTIVE FUNCTION (SOFT CONSTRAINTS)
    # -------------------------

    def set_objective(self):

        objective_terms = []

        for key, var in self.assignments.items():

            u_id, t_id, r_id, ts_id = key

            score = self.get_score(u_id, t_id)

            objective_terms.append(var * int(score * 100))

        self.model.Maximize(sum(objective_terms))

    def get_score(self, unit_id, teacher_id):
        """
        This comes from Laravel DomainScoringService
        passed through JSON input
        """
        return self.data['scores'].get(f"{unit_id}_{teacher_id}", 0.5)

    # -------------------------
    # SOLVE
    # -------------------------

    def solve(self):

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 30

        status = solver.Solve(self.model)

        if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:

            return self.extract_solution(solver)

        return None

    def extract_solution(self, solver):

        result = []

        for key, var in self.assignments.items():

            if solver.Value(var) == 1:

                u_id, t_id, r_id, ts_id = key

                result.append({
                    "unit_id": u_id,
                    "teacher_id": t_id,
                    "room_id": r_id,
                    "timeslot_id": ts_id
                })

        return result

if __name__ == "__main__":
    import sys

    data = json.loads(sys.argv[1])

    scheduler = CPSATScheduler(data)
    scheduler.build_variables()
    scheduler.add_constraints()
    scheduler.set_objective()

    result = scheduler.solve()

    print(json.dumps(result))
