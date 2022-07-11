import pendulum

"""
Winter = 0
Spring = 1
Summer = 2
Autumm = 3
"""

seasons = [
    (0, (1, 1), (3, 20)),   # Winter
    (1, (3, 21), (6, 20)),  # Spring
    (2, (6, 21), (9, 22)),  # Summer
    (3, (9, 23), (12, 20)), # Autumm
    (0, (12, 21), (12, 31)) # Winter
]

def get_season(date) -> int:
    return next(season for season, start, end in seasons 
        if pendulum.datetime(date.year, start[0], start[1]) <= date <=  pendulum.datetime(date.year, end[0], end[1]))


class ItemEnv:
    def __init__(self) -> None:
        pass
    
    def _get_state(self) -> None:
        pass
    
    def percept(self) -> None:
        today = pendulum.now()
        yesterday = today.subtract(days=1)
        init_week = today.start_of('week').subtract(weeks=4)
        print(today, get_season(today))
        print(today.weekday())
        print(today.start_of('week'), init_week, yesterday)

    def reaction(self) -> None:
        pass