from gym import Env
from gym.spaces import Discrete, Box

"""
Actions: [ Add, Remove, Hold, Adjust ]

Add     : Recomend Add Item to List
Remove  : Recomend Remove Item to List
Hold    : Recomend Hold 
Adjust  : Adjust Parameters
"""
actions: Discrete = Discrete(4)

seasons: Discrete = Discrete(4)

observation_space: Box = Box(6,)

class ItemEnv(Env):
    def __init__(self) -> None:
        self.action_space = actions
        self.obervation_space = observation_space
        self.state = 40
        pass

    def step(self, action: int) -> tuple:
        pass

    def render(self) -> None:
        pass

    def reset(self) -> tuple:
        pass