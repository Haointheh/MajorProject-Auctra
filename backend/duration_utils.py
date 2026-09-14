from datetime import timedelta


def get_duration_timedelta(value: int, unit: str) -> timedelta:
    if unit == "minutes":
        return timedelta(minutes=value)
    elif unit == "hours":
        return timedelta(hours=value)
    elif unit == "days":
        return timedelta(days=value)
    else:
        raise ValueError(f"Invalid duration unit: {unit}")