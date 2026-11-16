import Phaser from 'phaser';


const TILE_SIZE = 24;
const SNAKE_SPEED = 150; 

export class GameScene extends Phaser.Scene {
  private snake: { x: number, y: number }[] = [];
  private food!: { x: number, y: number };
  private direction: { x: number, y: number } = { x: 1, y: 0 };
  private nextDirection: { x: number, y: number } = { x: 1, y: 0 };
  
  private snakeGraphics!: Phaser.GameObjects.Graphics;
  private foodGraphics!: Phaser.GameObjects.Graphics;
  
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private isGameOver = false;
  private gameOverText?: Phaser.GameObjects.Text;
  
  private moveTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super('GameScene');
  }

  create(): void {
    
    this.isGameOver = false;
    this.score = 0;
    this.snake = [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }]; 
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    this.snakeGraphics = this.add.graphics();
    this.foodGraphics = this.add.graphics();
    
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontFamily: 'system-ui, sans-serif',
      fontSize: '24px', 
      color: '#ffffff' 
    });
    
    this.add.text(16, 48, 'Пробел - перезапуск', { 
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px', 
      color: '#cbd5e1' 
    });

    if (!this.input.keyboard) throw new Error('Keyboard unavailable');
    
    this.input.keyboard.on('keydown-UP', () => this.setDirection(0, -1));
    this.input.keyboard.on('keydown-W', () => this.setDirection(0, -1));
    this.input.keyboard.on('keydown-DOWN', () => this.setDirection(0, 1));
    this.input.keyboard.on('keydown-S', () => this.setDirection(0, 1));
    this.input.keyboard.on('keydown-LEFT', () => this.setDirection(-1, 0));
    this.input.keyboard.on('keydown-A', () => this.setDirection(-1, 0));
    this.input.keyboard.on('keydown-RIGHT', () => this.setDirection(1, 0));
    this.input.keyboard.on('keydown-D', () => this.setDirection(1, 0));

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.isGameOver) this.scene.restart();
    });

    this.moveTimer = this.time.addEvent({
      delay: SNAKE_SPEED,
      callback: this.moveSnake,
      callbackScope: this,
      loop: true
    });

    this.spawnFood();
    this.drawSnake();
    this.drawFood();
  }

  private setDirection(x: number, y: number) {
    // нельзя поворачивать на 180 градусов
    if (this.direction.x === -x && this.direction.y === -y) return;
    if (this.isGameOver) return;
    this.nextDirection = { x, y };
  }

  private moveSnake() {
    if (this.isGameOver) return;

    this.direction = { ...this.nextDirection };

    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // проверка выхода за границы 
    const maxCols = Math.floor(this.scale.width / TILE_SIZE);
    const maxRows = Math.floor(this.scale.height / TILE_SIZE);

    if (newHead.x < 0 || newHead.x >= maxCols || newHead.y < 0 || newHead.y >= maxRows) {
      this.gameOver();
      return;
    }

    // проверка столкновения с собой
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === newHead.x && this.snake[i].y === newHead.y) {
        this.gameOver();
        return;
      }
    }

    
    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      this.spawnFood();
    } else {
      this.snake.pop(); 
    }

    this.drawSnake();
    this.drawFood();
  }

  private gameOver() {
    this.isGameOver = true;
    this.moveTimer.destroy();
    
    this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER\nНажми ПРОБЕЛ', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '32px',
      color: '#ef4444',
      align: 'center'
    }).setOrigin(0.5);
  }

  private spawnFood() {
    const maxCols = Math.floor(this.scale.width / TILE_SIZE);
    const maxRows = Math.floor(this.scale.height / TILE_SIZE);

    let validPos = false;
    while (!validPos) {
      this.food = {
        x: Phaser.Math.Between(0, maxCols - 1),
        y: Phaser.Math.Between(0, maxRows - 1)
      };
      
      validPos = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
    }
  }

  private drawSnake() {
    this.snakeGraphics.clear();
    this.snake.forEach((segment, index) => {
      
      const color = index === 0 ? 0x22c55e : 0x16a34a;
      this.snakeGraphics.fillStyle(color, 1);
      this.snakeGraphics.fillRect(
        segment.x * TILE_SIZE + 2, 
        segment.y * TILE_SIZE + 2, 
        TILE_SIZE - 4, 
        TILE_SIZE - 4
      );
    });
  }

  private drawFood() {
    this.foodGraphics.clear();
    this.foodGraphics.fillStyle(0xef4444, 1); 
    this.foodGraphics.fillCircle(
      this.food.x * TILE_SIZE + TILE_SIZE / 2,
      this.food.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 3
    );
  }
}