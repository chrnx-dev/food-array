from __future__ import annotations
from pymongo import MongoClient, ASCENDING

class GroceryService():
    def __init__(self, client: MongoClient) -> None:
        self.client = client

    def get_list(self, start = None, end = None):
        print(start, end, self.client)  
        return self.client.get_database()['groceries'].find({
            '$and': [
                {'date': {'$gte': start}},
                {'date': {'$lte': end}}
            ]
        }).sort('date', ASCENDING)