from pymongo import MongoClient
from lib.environments.item_env import DatabaseEnv
from lib.services.grocery_service import GroceryService

#'mongodb://root:S0l34d0123@localhost:27017/food-array?authSource=admin'
client = MongoClient('mongodb://root:S0l34d0123@localhost:27017/food-array?authSource=admin')
grocery = GroceryService(client)
print(grocery.instance, grocery.client)


env = DatabaseEnv(client)
env.percept()