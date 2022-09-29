(function() {
   
    function Location(row, col) {
        this.row = row;
        this.col = col;
    }

    
    Location.prototype.equals = function(that) {
        return this.row == that.row && this.col == that.col;
    };

    var SnakeWorld = {
        init: function() {
            this.snake = [this.getRandomLocation()];
            this.placeFood();
        },

        placeFood: function() {
            this.food = this.getRandomLocation();
        },

       
        getRandomLocation: function() {
            return new Location(getRandomInt(0, getNumRows() - 1),
                                getRandomInt(0, getNumCols() - 1));
        },

       
        getSnake: function() {
            return this.snake;
        },

       
        getFood: function() {
            return this.food;
        },

       
        checkSnakeCollision: function() {
            var head = this.getHead();
            for (var i = 0; i < this.snake.length - 1; ++i) {
                if (head.equals(this.snake[i])) {
                    return true;
                }
            }
            return false;
        },

       
        checkFoodCollision: function() {
            return this.getHead().equals(this.food);
        },

        
        update: function(currDir) {
            this.snake.push(this.getNewHead(currDir));
            if (this.checkFoodCollision()) {
                this.placeFood();
                Snake.incrementScore();
            } else if (this.checkSnakeCollision()) {
                Snake.endGame();
            } else {
                this.snake.shift();
            }
        },


       
        getNewHead: function(dir) {
            var oldHead = this.getHead(),
                newHead = new Location(oldHead.row, oldHead.col);

            if (dir == DIRS["W"]) {
                newHead.row--;
            } else if (dir == DIRS["S"]) {
                newHead.row++;
            } else if (dir == DIRS["A"]) {
                newHead.col--;
            } else if (dir == DIRS["D"]) {
                newHead.col++;
            }

          
            if (newHead.row < 0) newHead.row = getNumRows() - 1;
            if (newHead.col < 0) newHead.col = getNumCols() - 1;
            newHead.row %= getNumRows();
            newHead.col %= getNumCols();

            return newHead;
        },

        getHead: function() {
            return this.snake[this.snake.length - 1];
        }
    };

    var SnakeGraphics = {
        init: function() {
            this.setupCanvas();
        },

        
        setupCanvas: function() {
            this.addCanvas();
            this.ctx = this.canvas.getContext('2d');
        },

        
        addCanvas: function() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'unique-snake-canvas-id';
            this.fitCanvasToWindow();
            this.canvas.style.cssText = CANVAS_CSS;

            $(window).resize($.proxy(this.fitCanvasToWindow, this));

            $(document.body).append(this.canvas);
        },

        
        fitCanvasToWindow: function() {
            this.canvas.width = $(window).innerWidth();
            this.canvas.height = $(window).innerHeight();
        },

      
        draw: function() {
            this.clearCanvas();
            this.drawSnake();
            this.drawFood();
            this.drawScore();
        },

        clearCanvas: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },

        drawSnake: function() {
            snake = SnakeWorld.getSnake();
            this.ctx.fillStyle = SNAKE_COLOR;
            for (var i = 0; i < snake.length; ++i) {
                this.drawRect(snake[i]);
            }
        },

        drawFood: function() {
            food = SnakeWorld.getFood();
            this.ctx.fillStyle = FOOD_COLOR;
            this.drawRect(food);
        },

        drawScore: function() {
            this.drawText({
                message: 'Score: ' + Snake.getScore(),
                x: this.canvas.width,
                y: this.canvas.height,
                font: 'bold 25pt Calibri',
                color: 'red',
                align: 'right',
                baseline: 'bottom'
            });
        },

       
        drawRect: function(loc) {
            this.ctx.fillRect(
                loc.col * TILE_SIZE,
                loc.row * TILE_SIZE,
                TILE_SIZE, TILE_SIZE
            );
        },

        drawLoseScreen: function() {
            this.drawText({
                message: 'You lose!',
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                font: 'bold 40pt Calibri',
                color: 'red',
                align: 'center',
                baseline: 'middle'
            });
        },

       
        drawText: function(options) {
            this.ctx.font = options.font;
            this.ctx.fillStyle = options.color;
            this.ctx.textAlign = options.align;
            this.ctx.textBaseline = options.baseline;
            this.ctx.fillText(options.message, options.x, options.y);
        },

        
        takeDown: function() {
            $('#unique-snake-canvas-id').remove();
            $(window).unbind('resize', $.proxy(this.fitCanvasToWindow, this));
        }
    };

    var Snake = {
        run: function() {
            SnakeGraphics.init();
            SnakeWorld.init();

           
            this.lastTwoDirs = [null, DIRS["RIGHT"]];
            $(window).keydown($.proxy(this.onKeyDown, this));

           
            this.score = 0;

            this.playing = true;
            this.updateFrame();
        },

        getScore: function() {
            return this.score;
        },

        incrementScore: function() {
            this.score++;
        },

        
        onKeyDown: function(e) {
			e.preventDefault();
            if (e.keyCode == KEYS["W"]) {
                this.setDir(DIRS["W"]);
            } else if (e.keyCode == KEYS["S"]) {
                this.setDir(DIRS["S"]);
            } else if (e.keyCode == KEYS["A"]) {
                this.setDir(DIRS["A"]);
            } else if (e.keyCode == KEYS["D"]) {
                this.setDir(DIRS["D"]);
            }
        },

       
        setDir: function(dir) {
            if (this.lastTwoDirs[1] != DIRS.OPPOSITE[dir]) {
                this.lastTwoDirs.shift();
                this.lastTwoDirs[1] = dir;
            }
        },

       
        updateFrame: function() {
            SnakeGraphics.draw();
            SnakeWorld.update(this.lastTwoDirs[1]);
           
            if (this.playing) {
                this.timerId = setTimeout($.proxy(this.updateFrame, this), DELAY);
            }
        },

       
        endGame: function() {
            this.playing = false;
            SnakeGraphics.drawLoseScreen();

            
            window.setTimeout(function() {
                SnakeGraphics.takeDown();
                $(window).unbind('keydown', $.proxy(this.onKeyDown, this));
                delete window.Snake;
            }, 3000);
        }
    };


    
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


   
    function getNumRows() {
        return Math.floor($(window).height() / TILE_SIZE);
    }

    function getNumCols() {
        return Math.floor($(window).width() / TILE_SIZE);
    }


    

    var TILE_SIZE = 20, 
        KEYS = { ESC: 27, SPACE: 32, A: 37, W: 38, D: 39, S: 40 },
        DIRS = { W: 0, S: 1, A: 2, D: 3, OPPOSITE: [1, 0, 3, 2] },
        SNAKE_COLOR = 'green',
        FOOD_COLOR = 'red',
        DELAY = 50;

    var CANVAS_CSS = "background: rgba(0, 0, 0, 0) !important; position: fixed; top: 0; left: 0; z-index: 100000";


    window.Snake = Snake; 
})();
