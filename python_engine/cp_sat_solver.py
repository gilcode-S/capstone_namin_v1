from ortools.sat.python import cp_model
import json
import sys
import traceback

from models import build_assignment_variables
from constraints import (
    add_unit_assignment_constraint,
    add_room_conflict,
    add_section_conflict,
    add_teacher_conflict
)
from output import extract_solution


# =====================================================
# CP-SAT ENTRY POINT
# =====================================================
# PURPOSE:
# ✔ Build optimized schedule safely
# ✔ Respect:
#   - Unit assignment
#   - Room conflict
#   - Section + Set conflict
#   - Teacher conflict
# ✔ Return Laravel-readable JSON
# =====================================================
if __name__ == "__main__":

    try:
        # =================================================
        # INPUT
        # =================================================
        if len(sys.argv) < 2:
            raise Exception("Missing input file path")

        file_path = sys.argv[1]

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as f:
            data = json.load(f)

        # =================================================
        # BASIC VALIDATION
        # =================================================
        required_keys = [
            "class_units",
            "rooms",
            "timeslots"
        ]

        for key in required_keys:
            if key not in data:
                raise Exception(
                    f"Missing required key: {key}"
                )

        if not data["class_units"]:
            raise Exception(
                "No class units found"
            )

        # =================================================
        # MODEL
        # =================================================
        model = cp_model.CpModel()

        # =================================================
        # VARIABLES
        # =================================================
        assignments = build_assignment_variables(
            model,
            data
        )

        # =================================================
        # SAFETY LIMIT
        # =================================================
        if len(assignments) > 500000:
            raise Exception(
                f"Too many variables: {len(assignments)}"
            )

        # =================================================
        # HARD CONSTRAINTS
        # =================================================
        add_unit_assignment_constraint(
            model,
            assignments,
            data
        )

        add_room_conflict(
            model,
            assignments,
            data
        )

        add_section_conflict(
            model,
            assignments,
            data
        )

        # 🔥 NEW
        add_teacher_conflict(
            model,
            assignments,
            data
        )

        # =================================================
        # OBJECTIVE
        # Maximize total scheduled units
        # =================================================
        model.Maximize(
            sum(assignments.values())
        )

        # =================================================
        # SOLVER
        # =================================================
        solver = cp_model.CpSolver()

        solver.parameters.max_time_in_seconds = 30
        solver.parameters.num_search_workers = 8

        status = solver.Solve(model)

        # =================================================
        # OUTPUT
        # =================================================
        if status in [
            cp_model.OPTIMAL,
            cp_model.FEASIBLE
        ]:

            result = extract_solution(
                solver,
                assignments
            )

            status_text = "SOLVED"

        else:

            result = []

            status_text = "NO_SOLUTION"

        print(json.dumps({
            "result": result,
            "debug": {
                "status": status_text,
                "units": len(data["class_units"]),
                "rooms": len(data["rooms"]),
                "timeslots": len(data["timeslots"]),
                "variables": len(assignments),
                "generated_schedules": len(result)
            }
        }))

    except Exception as e:

        print(json.dumps({
            "error": str(e),
            "trace": traceback.format_exc()
        }))