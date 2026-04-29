def extract_solution(solver, assignments):

    result = []

    for key, var in assignments.items():

        if solver.Value(var) == 1:

            result.append({
                "unit_id": key[0],
                "room_id": key[1],
                "timeslot_id": key[2]
            })

    return result