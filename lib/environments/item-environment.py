from gym import Env
from gym.spaces import Discrete, Box
from collections import deque
import pandas as pd

"""
Actions: [ Add, Remove, Hold, Adjust ]

Add     : Recomend Add Item to List
Remove  : Recomend Remove Item to List
Hold    : Recomend Hold 
Adjust  : Adjust Parameters
"""
actions: Discrete = Discrete(4)

seasons: Discrete = Discrete(4)

days: Discrete = Discrete(31)

"""
Item [ Cantidad_Actual, MAX, MIN, CYCLE, DAY, SEASON ]

"""
observation_space: Box = Box(3,)

class ItemLearnEnv(Env):
    def __init__(self, loopback_data: pd.DataFrame, window_size: int = 14) -> None:
        super(ItemEnv, self)

        """
        Actions: [ Suggest, Hold, Adjust ]

        Suggest     : 0 : Recomend Add Item to List
        Hold        : 1 : Recomend Hold Actions
        Adjust      : 2 : Adjust Parameters
        """
        self.action_space = Discrete(3)

        # [Cantidad, Compras, Diferencia]
        self.obervation_space = Box(3,)

        self.history = deque(loopback_data, window_size)

    def step(self, action: int) -> tuple:
        reward = 0
        done = False

        info = {}
        return self.state, reward, done, info

    def render(self) -> None:
        pass

    def reset(self) -> tuple:
        self.state = -1
        self.cycle = self.cycle_days
        pass