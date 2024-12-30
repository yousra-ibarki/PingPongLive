import time
import random

class GameState:
    def __init__(self, canvas_width, canvas_height):
        #we need to define the original width and height
        
        self.original_width = 800
        self.original_height = 610
        self.paddle_height = 100
        self.paddle_width = 15
        self.offsetX = 10
         
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
        self.speed_factor = 1.08
        self.min_speed = 3
        self.max_speed = 12
    
    
    def check_collision(self, ball, paddle, is_right_paddle):
                
        if is_right_paddle:
            ball_x = ball['x'] - ball['radius']  # Adjust for ball radius
        else:
            ball_x = ball['x'] + ball['radius']  # Adjust for ball radius
            
        collision = (
            ball_x > paddle['x'] - ball['radius'] and  # Check if ball is to the right of the paddle's left edge
            ball_x < paddle['x'] + paddle['width'] + ball['radius'] and  # Check if ball is to the left of the paddle's right edge
            ball['y'] > paddle['y'] - ball['radius'] and  # Check if ball is above the paddle's top edge
            ball['y'] < paddle['y'] + paddle['height'] + ball['radius']  # Check if ball is below the paddle's bottom edge
        )
        
        if collision:
            print(f"Collision detected! Ball pos: ({ball['x']}, {ball['y']}), Paddle pos: ({paddle['x']}, {paddle['y']})")
            # Move ball to proper position to prevent sticking
            if is_right_paddle:
                ball['x'] =paddle['x'] - ball['radius'] - 1  # Move just outside left edge of right paddle
            else:
                ball['x'] = paddle['x'] + paddle['width'] + ball['radius'] + 1  # Move just outside right edge of left paddle
                
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
        
        # Update ball position with delta time
        self.ball['x'] += self.ball['vx'] * date * 60 # Normalize to 60 FPS
        self.ball['y'] += self.ball['vy'] * date * 60

       # Wall collisions (top and bottom)
        if self.ball['y'] - self.ball['radius'] <= 0:
            self.ball['y'] = self.ball['radius']
            self.ball['vy'] = abs(self.ball['vy'])  # Ensure positive velocity
        elif self.ball['y'] + self.ball['radius'] >= self.original_height:
            self.ball['y'] = self.original_height - self.ball['radius']
            self.ball['vy'] = -abs(self.ball['vy'])  # Ensure negative velocity

        left_collision = self.check_collision(self.ball, self.paddles['left'], False)
        right_collision = self.check_collision(self.ball, self.paddles['right'], True )

        #collision with paddles
        if (right_collision or left_collision):
        # if (left_collision or right_collision):
            self.ball['vx'] *= -1
            self.ball['vy'] += (random.random() - 0.5) * 2
            #increasing speed
            self.ball['vx'] *= self.speed_factor
            self.ball['vy'] *= self.speed_factor
            self.control_speed()
            
        # Scoring
        scored = None #changed
        if self.ball['x'] - self.ball['radius'] <= 0:
            scored = 'right'
            self.ball['x'] = self.original_width / 2
            self.ball['y'] = self.original_height / 2
        elif self.ball['x'] + self.ball['radius'] >= self.original_width:
            scored = 'left'
            self.ball['x'] = self.original_width / 2
            self.ball['y'] = self.original_height / 2
        return {
            'ball': self.ball,
            'paddles': self.paddles,
            'scored': scored,
            'original_width': self.original_width,
            'original_height': self.original_height
        }
