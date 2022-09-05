import pendulum
import math
from lib.services.grocery_service import GroceryService
from lib.utilities.date import get_season, to_local, to_utc
from lib.agents.actions import Actions
from pymongo.cursor import Cursor
from collections import Counter

class WeekShopping():
    def __init__(self, data: Cursor, period: pendulum.DateTime) -> None:
        shopping_list = list(data)
        self._count = len(shopping_list)
        self.items = dict()
        self.start = period.start_of('week')
        self.end = period.end_of('week')

        print(Actions.ADJUST.name)

        for shopping in shopping_list:
            for item in shopping['items']:
                if not item['sku'] in self.items:
                    self.items[item['sku']] = item
                    self.items[item['sku']]['count'] =1
                else:
                    self.items[item['sku']]['qty'] += item['qty']
                    self.items[item['sku']]['count'] += 1
                
                self.items[item['sku']]['daily_consumption'] = math.ceil(self.items[item['sku']]['qty'] / 7)

    def get_item(self, sku: int):
        if not sku in self.items:
            return None
        
        return self.items[sku]
    
    def get_items_sku(self) -> list:
        return self.items.keys()

    def is_before(self, dt: pendulum.DateTime) -> bool:
        return self.start < dt
    
    def has_shop(self) -> bool:
        return self._count > 0
    
    def is_item_shopped(self, sku) -> bool:
        return sku in self.get_items_sku()

class State():
    def __init__(self, weeks: list, current: WeekShopping) -> tuple:
        self.weeks = weeks
        self.current = current
        skus, counter = self._get_items()
        self.skus = skus
        self.counter = counter
    
    def _get_items(self) -> list:
        items_sku = list()
        for w in self.weeks:
            items_sku.extend(w.get_items_sku())

        counter = Counter(items_sku)
        return (list(set(items_sku))), counter

# Model Based Reflex Agent
"""
Environment is comming from the Database.
"""
class DatabaseEnv:
    def __init__(self, service: GroceryService, history_weeks_loopback: int = 4) -> None:
        self.history_weeks_loopback = history_weeks_loopback
        self.service = service
    
    def _get_state(self, period: pendulum.DateTime) -> tuple:
        data = list()
        for p in period.range('weeks'):
            week_data = self.service.get_list(to_utc(p.start_of('week')), to_utc(p.end_of('week')))
            data.append(WeekShopping(week_data, p))

        current_week = data.pop()
        return data, current_week
    
    def percept(self) -> None:
        today = pendulum.now().end_of('day')
        
        init_week = today.start_of('week')
        init_period = init_week.subtract(weeks=self.history_weeks_loopback).start_of('day')
        

        period = pendulum.period(init_period, today)
        weeks_data, current  = self._get_state(period)
        
        for w in weeks_data:
            print(w.get_item(1), w.start.to_formatted_date_string(), w.end.to_formatted_date_string(), w.is_before(init_week), w.is_item_shopped(1))
        
        return State(weeks_data, current)
    
    def resolve(self, state: State) -> None:
        pass

    def reaction(self, action: Actions) -> None:
        pass
