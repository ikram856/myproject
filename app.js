const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const modal = document.getElementById('modal');
        const modalContent = document.getElementById('modalContent');
        const modalTitle = document.getElementById('modalTitle');
        const modalImage = document.getElementById('modalImage');
        const finalScore = document.getElementById('finalScore');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const speedDisplay = document.getElementById('speedDisplay');

        const LANES = [100, 200, 300];
        const FINISH_LINE = 10000;

        let gameState = {
            car: {
                x: LANES[1],
                y: 500,
                width: 40,
                height: 60,
                lane: 1
            },
            obstacles: [],
            score: 0,
            speed: 5,
            gameOver: false,
            won: false,
            distance: 0,
            roadOffset: 0
        };

        function drawCar(x, y, crashed = false) {
            if (crashed) {
                ctx.fillStyle = '#888';
                ctx.fillRect(x - 20, y - 30, 40, 60);
                ctx.fillStyle = '#ff0000';
                ctx.font = '30px Arial';
                ctx.fillText('💥', x - 15, y + 5);
            } else {
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(x - 20, y - 30, 40, 60);
                ctx.fillStyle = '#333';
                ctx.fillRect(x - 18, y - 25, 36, 20);
                ctx.fillStyle = '#222';
                ctx.fillRect(x - 15, y + 20, 10, 10);
                ctx.fillRect(x + 5, y + 20, 10, 10);
            }
        }

        function drawObstacle(x, y) {
            ctx.fillStyle = '#FFA500';
            ctx.fillRect(x - 15, y - 15, 30, 30);
            ctx.fillStyle = '#fff';
            ctx.font = '20px Arial';
            ctx.fillText('⚠️', x - 10, y + 5);
        }

        function drawRoad() {
            ctx.fillStyle = '#444';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) {
                let x = i * 100 + 50;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 5;
            ctx.setLineDash([20, 20]);
            for (let i = 0; i < canvas.height; i += 40) {
                let offset = (i + gameState.roadOffset) % 40;
                ctx.beginPath();
                ctx.moveTo(150, offset + i - 40);
                ctx.lineTo(150, offset + i - 20);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(250, offset + i - 40);
                ctx.lineTo(250, offset + i - 20);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }

        function drawProgressBar() {
            const progress = Math.min(gameState.distance / FINISH_LINE, 1);
            const barWidth = 350;
            const barHeight = 20;
            const x = 25;
            const y = 10;

            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x, y, barWidth * progress, barHeight);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(`${Math.floor(progress * 100)}%`, x + barWidth / 2 - 15, y + 15);
        }

        function createObstacle() {
            const lane = Math.floor(Math.random() * 3);
            gameState.obstacles.push({
                x: LANES[lane],
                y: -30,
                width: 30,
                height: 30
            });
        }

        function updateGame() {
            if (gameState.gameOver || gameState.won) return;

            gameState.roadOffset += gameState.speed;
            if (gameState.roadOffset >= 40) gameState.roadOffset = 0;

            gameState.distance += gameState.speed;
            gameState.score = Math.floor(gameState.distance / 10);

            if (gameState.distance >= FINISH_LINE) {
                winGame();
                return;
            }

            gameState.obstacles.forEach(obstacle => {
                obstacle.y += gameState.speed;
            });

            gameState.obstacles = gameState.obstacles.filter(obs => obs.y < canvas.height + 50);

            if (Math.random() < 0.02) {
                createObstacle();
            }

            checkCollisions();
        }

        function checkCollisions() {
            const car = gameState.car;
            gameState.obstacles.forEach(obstacle => {
                if (Math.abs(car.x - obstacle.x) < 25 &&
                    Math.abs(car.y - obstacle.y) < 40) {
                    crashGame();
                }
            });
        }

        function drawGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawRoad();
            drawProgressBar();

            gameState.obstacles.forEach(obstacle => {
                drawObstacle(obstacle.x, obstacle.y);
            });

            drawCar(gameState.car.x, gameState.car.y, gameState.gameOver);
            scoreDisplay.textContent = gameState.score;
        }

        function gameLoop() {
            updateGame();
            drawGame();
            if (!gameState.gameOver && !gameState.won) {
                requestAnimationFrame(gameLoop);
            }
        }

        function crashGame() {
            gameState.gameOver = true;
            modalContent.className = 'modal-content crash';
            modalTitle.textContent = 'CRASH!';
            modalImage.textContent = '🚗💥';
            finalScore.textContent = `Score Final: ${gameState.score}`;
            modal.style.display = 'flex';
            drawGame();
        }

        function winGame() {
            gameState.won = true;
            modalContent.className = 'modal-content winner';
            modalTitle.textContent = 'WINNER!';
            modalImage.textContent = '🏆🚗';
            finalScore.textContent = `Score Final: ${gameState.score}`;
            modal.style.display = 'flex';
        }

        function restartGame() {
            gameState = {
                car: {
                    x: LANES[1],
                    y: 500,
                    width: 40,
                    height: 60,
                    lane: 1
                },
                obstacles: [],
                score: 0,
                speed: 5,
                gameOver: false,
                won: false,
                distance: 0,
                roadOffset: 0
            };
            modal.style.display = 'none';
            speedDisplay.textContent = gameState.speed;
            gameLoop();
        }

        function increaseSpeed() {
            if (gameState.speed < 15) {
                gameState.speed++;
                speedDisplay.textContent = gameState.speed;
            }
        }

        function decreaseSpeed() {
            if (gameState.speed > 1) {
                gameState.speed--;
                speedDisplay.textContent = gameState.speed;
            }
        }

        document.addEventListener('keydown', (e) => {
            if (gameState.gameOver || gameState.won) return;

            if (e.key === 'ArrowLeft' && gameState.car.lane > 0) {
                gameState.car.lane--;
                gameState.car.x = LANES[gameState.car.lane];
            } else if (e.key === 'ArrowRight' && gameState.car.lane < 2) {
                gameState.car.lane++;
                gameState.car.x = LANES[gameState.car.lane];
            }
        });

        gameLoop();