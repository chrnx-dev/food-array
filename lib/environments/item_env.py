import pendulum
from lib.services.grocery_service import GroceryService
from lib.utilities.date import get_season, to_local, to_utc

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
        today = pendulum.now().end_of('day')
        
        init_week = today.start_of('week')
        init_period = init_week.subtract(weeks=self.history_weeks_loopback).start_of('day')
        
        data = self.service.get_list(init_period, today)
        

        period = pendulum.period(init_period, today)

        for p in period.range('weeks'):
            print(p, p.end_of('week'))
            week_data = self.service.get_list(to_utc(p.start_of('week')), to_utc(p.end_of('week')))
            print(list(week_data))
        
        return
    """
        for d in data:
            date_shopping = localTZ.convert(pendulum.instance(d['date']))
            print(date_shopping, init_week, date_shopping.weekday(), get_season(date_shopping), date_shopping < init_week)
    """
    
    def resolve(self, state) -> None:
        pass

    def reaction(self, action) -> None:
        pass


class WeekState():
    def __init__(self, data: list) -> None:
        pass