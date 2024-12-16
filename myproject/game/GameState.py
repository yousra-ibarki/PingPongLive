import time
from typing import Dict, Tuple, Any, Optional

class GameState:
    def __init__(self, canvas_width, canvas_height, RpaddleX, RpaddleY, LpaddleX, LpaddleY):

        self.ball = {
            'x': canvas_width / 2,
            'y': canvas_height / 2,
            'vx' : 3,
            'vy': 2,
            'radius': 17
        }
        
        self.paddles = {
            'left': {'x': LpaddleX  , 'y': LpaddleY , 'width': 20, 'height': 130, 'dy': 0},
            'right': {'x': RpaddleX, 'y': RpaddleY , 'width': 20, 'height': 130, 'dy': 0}
        }
        
        self.canvas = {'width': canvas_width, 'height': canvas_height}
        self.last_update = time.time()
        self.speed_factor = 1.08
        self.min_speed = 3
        self.max_speed = 5
        
    
    def check_collision(self, ball, paddle, is_right_paddle):
        ball_x = self.canvas['width'] - ball['x'] if is_right_paddle else ball['x']
        
        # ball_y = self.canvas['height'] - ball['y'] if is_left_paddle else ball['y']
        collision = (
            ball['x'] + ball['radius'] > paddle['x'] and
            ball['x'] - ball['radius'] < paddle['x'] + paddle['width'] and
            ball['y'] > paddle['y'] and
            ball['y'] < paddle['y'] + paddle['height']
        )
        if not is_right_paddle:
            print(f"Left Paddle: , {paddle['x']}, {paddle['y']}")
        else:
            print(f"Right Paddle: , {paddle['x']}, {paddle['y']}")
   

        
        # print(f"BALL AT {ball['x']} PADDLE AT {paddle['x']}")
        if collision:
            print(f"COLLISION DETECTED with paddle at x={paddle['x']}")
            
        return collision
    
    def control_speed(self):
        speed = (self.ball['vx'] ** 2 + self.ball['vy'] ** 2) ** 0.5
        if speed < self.min_speed or speed > self.max_speed:
            scale = min(self.max_speed / speed, max(self.min_speed / speed, 1))
            self.ball['vx'] *= scale
            self.ball['vy'] *= scale
     
    def update(self):
        current_time = time.time()
        date = current_time - self.last_update
        self.last_update = current_time
        # print(f"DATE {date}")
        
        #update ball 
        self.ball['x'] += self.ball['vx']
        self.ball['y'] += self.ball['vy']

        #ball collision
        if(self.ball['y'] - self.ball['radius'] < 0 or self.ball['y'] + self.ball['radius'] > self.canvas['height']):
            print("11111111111")
            self.ball['vy'] *= -1

        left_collision = self.check_collision(self.ball, self.paddles['left'], False)
        right_collision = self.check_collision(self.ball, self.paddles['right'], True )

        # print(f"LEFT COLLISION {left_collision} RIGHT COLLISION {right_collision}")
        #collision with paddles
        if (left_collision or right_collision):
            print("2222222222")
            self.ball['vx'] *= -1


        #increasing speed
        # self.ball['vx'] *= self.speed_factor
        # self.ball['vy'] *= self.speed_factor
        # self.control_speed()

        # print(f"RIGHT {self.ball['x'] - self.ball['radius']}")
        scored = None
        if self.ball['x'] - self.ball['radius'] < 0 :
            print("33333333333")
            scored = 'right'
        elif self.ball['x'] + self.ball['radius'] > self.canvas['width']:
            print("44444444444")
            scored = 'left'

        return {
            'ball': self.ball,
            'paddles': self.paddles,
            'scored': scored
        }
