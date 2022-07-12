from __future__ import annotations
from pymongo import MongoClient

class GroceryService():
    def __init__(self, client: MongoClient) -> None:
        self.client = client

    def get_list(self, start = None, end = None):
        print(start, end, self.client)
        # self.client.get_database()['groceries'].find_one()
        return self.client.get_database()['groceries'].find()