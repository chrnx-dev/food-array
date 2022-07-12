from __future__ import annotations
from pymongo import MongoClient

class GroceryService():
    def __init__(self, client: MongoClient) -> None:
        self.client = client
        
    def __new__(self, cls: GroceryService) -> GroceryService:
        if not hasattr(cls, 'instance'):
            cls.instance = super().__new__(cls)
        return cls.instance