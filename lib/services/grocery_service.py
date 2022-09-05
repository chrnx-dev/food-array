from __future__ import annotations
from pymongo import MongoClient, ASCENDING, cursor

class GroceryService():
    def __init__(self, client: MongoClient) -> None:
        self.client = client

    def get_list(self, start = None, end = None) -> cursor.Cursor:
        return self.client.get_database()['groceries'].find({
            '$and': [
                {'date': {'$gte': start}},
                {'date': {'$lte': end}}
            ]
        }).sort('date', ASCENDING)