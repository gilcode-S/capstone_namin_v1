from fastapi import FastAPI, Request
import time
import datetime

from core.set_mode_engine import SetModeEngine
from core.rule_engine import RuleEngine

app = FastAPI()


# -----------------------------
# TIME PREPROCESS
# -----------------------------
def to_minutes(time_str):
    dt = datetime.datetime.strptime(time_str, "%I:%M %p")
    return dt.hour * 60 + dt.minute


def preprocess_timeslots(timeslots):
    for t in timeslots:
        t["start_min"] = to_minutes(t["start_time"])
        t["end_min"] = to_minutes(t["end_time"])

        if not t.get("day_of_week"):
            t["day_of_week"] = "Monday"

    return timeslots


# -----------------------------
# ENGINE INIT (NO CHANGE NOW)
# -----------------------------
engine = SetModeEngine()


# -----------------------------
# API
# -----------------------------
@app.post("/generate")
async def generate_schedule(request: Request):

    data = await request.json()

    assignments = data.get("assignments", [])
    rooms = data.get("rooms", [])
    timeslots = data.get("timeslots", [])
    mode = data.get("mode", "balanced")

    # 🔥 IMPORTANT (keep this)
    timeslots = preprocess_timeslots(timeslots)

    start = time.time()

    rule_engine = RuleEngine()

    result = engine.run(
        mode,
        assignments,
        rooms,
        timeslots,
        rule_engine
    )

    result["total_time"] = time.time() - start

    return result