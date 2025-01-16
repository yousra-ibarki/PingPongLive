import time
import random

class GameState:
    def __init__(self, canvas_width, canvas_height):
        #we need to define the original width and height
        
        self.original_width = 800
        self.original_height = 610
        self.paddle_height = 90
        self.paddle_width = 17
        self.offsetX = 30
        self.scoreR = 0
        self.scoreL = 0
        self.scoreMax = 5
        self.isOver = None
        self.isReload = None
        
         
        self.ball = {
            'x': self.original_width / 2,
            'y': self.original_height / 2,
            'vx' : 3,
            'vy': 2,
            'radius': 13
        }
        self.paddles = {
            'left': {
                'x': self.offsetX, 
                'y': self.original_height / 2 , 
                'width': self.paddle_width, 
                'height': self.paddle_height
                },
            'right': {
                'x': self.original_width - (self.paddle_width + self.offsetX), 
                'y': self.original_height / 2 , 
                'width': self.paddle_width, 
                'height': self.paddle_height
                }
        }
        
        self.canvas = {'width': canvas_width, 'height': canvas_height, 
        'original_width': self.original_width, 'original_height': self.original_height}
        self.last_update = time.time()
        self.speed_factor = 1.1
        self.min_speed = 4.5
        self.max_speed = 12
    
    
    def check_collision(self, ball, paddle, is_right_paddle):
                
        if is_right_paddle:
            ball_x = ball['x'] - ball['radius']  
        else:
            ball_x = ball['x'] + ball['radius']  
        collision = (
            ball_x > paddle['x'] - ball['radius'] and  # here calculate if the ball is to the right of the paddle's left edge
            ball_x < paddle['x'] + paddle['width'] + ball['radius'] and  # same for the left of the paddle's right edge
            ball['y'] > paddle['y'] - ball['radius'] and  # same for the ball is above the paddle's top edge
            ball['y'] < paddle['y'] + paddle['height'] + ball['radius']  # and the ball is below the paddle's bottom edge
        )
        
        if collision:
            if is_right_paddle:
                ball['x'] =paddle['x'] - ball['radius'] - 1  
            else:
                ball['x'] = paddle['x'] + paddle['width'] + ball['radius'] + 1  
                
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
        
        # Update ball position with delta time
        self.ball['x'] += self.ball['vx'] * date * 60 
        self.ball['y'] += self.ball['vy'] * date * 60

       # Wall collisions (top and bottom)
        if self.ball['y'] - self.ball['radius'] <= 0:
            self.ball['y'] = self.ball['radius']
            self.ball['vy'] = abs(self.ball['vy'])  
        elif self.ball['y'] + self.ball['radius'] >= self.original_height:
            self.ball['y'] = self.original_height - self.ball['radius']
            self.ball['vy'] = -abs(self.ball['vy'])  

        left_collision = self.check_collision(self.ball, self.paddles['left'], False)
        right_collision = self.check_collision(self.ball, self.paddles['right'], True )

        #collision with paddles
        if (right_collision or left_collision):
            self.ball['vx'] *= -1
            self.ball['vy'] += (random.random() - 0.5) * 2
            #increasing speed
            self.ball['vx'] *= self.speed_factor
            self.ball['vy'] *= self.speed_factor
            self.control_speed()
            
        # Scoring
        scored = None 
        if self.ball['x'] - self.ball['radius'] <= 0:
            scored = 'right'
            self.scoreR += 1
            self.ball['x'] = self.original_width / 2
            self.ball['y'] = self.original_height / 2
        elif self.ball['x'] + self.ball['radius'] >= self.original_width:
            scored = 'left'
            self.scoreL += 1
            self.ball['x'] = self.original_width / 2
            self.ball['y'] = self.original_height / 2
            
        if self.scoreR == self.scoreMax or self.scoreL == self.scoreMax:
            self.isOver = True
            
        return {
            'ball': self.ball,
            'paddles': self.paddles,
            'isOver': self.isOver,
            'scored': scored,
            'isReload': self.isReload,
            'original_width': self.original_width,
            'original_height': self.original_height
        }
