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
        localTZ = pendulum.now().timezone
        today = pendulum.now(pendulum.timezone('UTC')).end_of('day')
        yesterday = today.subtract(days=1)
        init_week = today.start_of('week')
        init_period = init_week.subtract(weeks=self.history_weeks_loopback).start_of('day')
        
        print(init_period.to_iso8601_string(), today.to_iso8601_string())
        data = self.service.get_list(init_period, today)
        
        for d in data:
            date_shopping = localTZ.convert(pendulum.instance(d['date']))
            print(date_shopping, init_week, date_shopping.weekday(), get_season(date_shopping), date_shopping < init_week)

    
    def resolve(self, state) -> None:
        pass

    def reaction(self, action) -> None:
        pass