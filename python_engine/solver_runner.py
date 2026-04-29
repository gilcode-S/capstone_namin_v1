from ortools.sat.python import cp_model


def solve_model(model, assignments):
    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 60
    solver.parameters.num_search_workers = 8

    status = solver.Solve(model)

    if status in [
        cp_model.OPTIMAL,
        cp_model.FEASIBLE
    ]:
        return extract_solution(
            solver,
            assignments
        )

    return []


def extract_solution(solver, assignments):
    result = []

    for key, var in assignments.items():

        if solver.Value(var) == 1:

            unit_id, teacher_id, room_id, timeslot_id = key

            result.append({
                "unit_id": unit_id,
                "teacher_id": teacher_id,
                "room_id": room_id,
                "timeslot_id": timeslot_id
            })

    return result