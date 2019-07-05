let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const GAME_WIDTH = 1500;
const GAME_HEIGHT = 900;
const MIN_RAIDUS = 10;
const MAX_RADIUS = 20;
const MIN_SPEED = 1;
const MAX_SPEED = 5;
const MAX_NUM_OF_BALLS = 100;
const MIN_NUM_OF_BALLS = 50;
const MAX_X = 1000;
const MIN_X = 100;
const MAX_Y = 700;
const MIN_Y = 100;

/**
 * returns a random number
 *
 * @param {Number} minVal - minimum value
 * @param {Number} maxVal - maximum value
 */
function generateRandom(minVal, maxVal) {
  let randomNumber = Math.floor(Math.random() * (maxVal - minVal)) + minVal;
  return randomNumber;
}
class Ball {
  /**
   * sets ball's properties
   *
   * @param {Number} x - center of circle in x axis
   * @param {Number} y - center of circle in y axis
   */
  constructor(x, y, r) {
    this.colors = ["#ccccff", "#99ffcc", "#ffff66", "#cc6699", "#FF0000"];
    this.radius = r;
    this.position = {
      x: x,
      y: y
    };
    this.speed = {
      x: generateRandom(MIN_SPEED, MAX_SPEED),
      y: generateRandom(MIN_SPEED, MAX_SPEED)
    };
    this.markedForDeletion = false;
  }
  /**
   * renders the ball
   *
   * @param {Number} ctx - context of canvas
   */
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.colors[generateRandom(0, this.colors.length)];
    ctx.fill();
  }
  /**
   * moves the ball and checks for boundary collision
   *
   * @param {Number} deltaTime -time of update
   */
  update(deltaTime) {
    if (!deltaTime) return;

    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    //checks to see if hits the wall left or right
    if (this.position.x + this.radius >= GAME_WIDTH) {
      this.position.x = GAME_WIDTH-this.radius;
      this.speed.x = -this.speed.x;
    } else if (this.position.x - this.radius <= 0) {
      this.position.x = this.radius;
      this.speed.x = -this.speed.x;
    }
    //checks to see if hits the wall top
    if (this.position.y - this.radius <= 0) {
      this.position.y = this.radius;
      this.speed.y = -this.speed.y;
    } else if (this.position.y + this.radius >= GAME_HEIGHT) {
      this.position.y = GAME_HEIGHT-this.radius;
      this.speed.y = -this.speed.y;
    }
  }
}

let balls = [];
for (let i = 0; i < generateRandom(MIN_NUM_OF_BALLS, MAX_NUM_OF_BALLS); i++) {
  let x = generateRandom(MAX_X, MIN_X);
  let y = generateRandom(MAX_Y, MIN_Y);
  let radius = generateRandom(MAX_RADIUS, MIN_RAIDUS);
  if (i !== 0) {
    for (let j = 0; j < balls.length; j++) {
      let dx = x - balls[j].x;
      let dy = y - balls[j].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let sum = radius + balls[j].radius;
      if (distance - sum <= 0) {
        x = generateRandom(MAX_X, MIN_X);
        y = generateRandom(MAX_Y, MIN_Y);

        j = -1;
      }
    }
  }

  let ball = new Ball(x, y, radius);
  balls.push(ball);
}

balls.forEach(function(ball1, index1) {
  balls.forEach(function(ball2, index2) {
    if (index1 === index2) {
      return;
    } else {
      if (collision(ball1, ball2)) {
        ball1.position.x = generateRandom(
          ball1.radius,
          GAME_WIDTH - ball1.radius
        );
        ball1.position.y = generateRandom(
          ball2.radius,
          GAME_HEIGHT - ball1.radius
        );
      }
    }
  });
});

/**
 * checks for collision
 *
 * @param {object} ball - ball object
 * @param {object} gameObject - ball object
 */
function collision(ball, gameObject) {
  let dx = gameObject.position.x - ball.position.x;
  let dy = gameObject.position.y - ball.position.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  let sum = ball.radius + gameObject.radius;
  if (distance <= sum) {
    return true;
  }
}

/**
 * checks if the mouse click is on the circle
 *
 * @param {object} point - mouse click position object
 * @param {object} ball - ball object
 */
function isIntersect(point, ball) {
  return (
    Math.sqrt(
      (point.x - ball.position.x) ** 2 + (point.y - ball.position.y) ** 2
    ) < ball.radius
  );
}

canvas.addEventListener("click", e => {
  let rect = canvas.getBoundingClientRect();
  const pos = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  balls.forEach(ball => {
    if (isIntersect(pos, ball)) {
      ball.markedForDeletion = true;
    }
  });
});

let lastTime = 0;
function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT); /*clear our canvas */
  balls.forEach(function(ballA, indexA) {
    balls = balls.filter(object => !object.markedForDeletion);
    ballA.draw(ctx);
    ballA.update(deltaTime);
    balls.forEach(function(ballB, indexB) {
      if (indexA === indexB) {
        return;
      } else {
        if (collision(ballA, ballB)) {
          let tempX, tempY;
          tempX = ballA.speed.x;
          tempY = ballA.speed.y;
          ballA.speed.x = ballB.speed.x;
          ballB.speed.x = tempX;
          ballA.speed.y = ballB.speed.y;
          ballB.speed.y = tempY;
        }
      }
    });
  });
  requestAnimationFrame(gameLoop);
}

gameLoop();
