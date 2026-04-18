import datetime

def to_minutes(time_str):
    dt = datetime.datetime.strptime(time_str, "%I:%M %p")
    return dt.hour * 60 + dt.minute


def is_overlap(t1, t2):
    return max(
        to_minutes(t1["start_time"]),
        to_minutes(t2["start_time"])
    ) < min(
        to_minutes(t1["end_time"]),
        to_minutes(t2["end_time"])
    )