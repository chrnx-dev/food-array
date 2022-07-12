import pendulum
from lib.services.grocery_service import GroceryService
from lib.utilities.date import get_season

# Model Based Reflex Agent
"""
Environment is comming from the Database.
"""
class DatabaseEnv:
    def __init__(self, service: GroceryService, history_weeks_loopback: int = 4) -> None:
        self.history_weeks_loopback = history_weeks_loopback
        self.service = service
    
    def _get_state(self) -> None:
        pass
    
    def percept(self) -> None:
        today = pendulum.now()
        yesterday = today.subtract(days=1)
        init_week = today.start_of('week').subtract(weeks=self.history_weeks_loopback)
        print(today, get_season(today), self.service.get_list())
        print(today.weekday(), yesterday.weekday(), get_season(today))

    def reaction(self) -> None:
        pass