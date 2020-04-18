var canvas = document.getElementById("myCanvas");
			var ctx = canvas.getContext("2d");
			var ballRadius = 20;
			var x = canvas.width/2;
			var y = canvas.height-30;
			var dx = 4;
			var dy = -4;
			var speedMultiplier = 1;
			var paddleSpeed = 7;
			var paddleHeight = 20;
			var paddleWidth = 150;
			var paddleX = (canvas.width-paddleWidth)/2;
			var rightPressed = false;
			var leftPressed = false;
			var brickRowCount = 3;
			var brickColumnCount = 5;
			var brickWidth = 70;
			var brickHeight = 20;
			var brickPadding = 10;
			var brickOffsetV = 30;
			var brickOffsetH = 30;
			var totalBrickHeight = 200;
			var points = 0;
			var level = 0;
			var initialized = false;
			const fps = 60;
			
			var bricks = [];

			document.addEventListener("keydown", keyDownHandler, false);
			document.addEventListener("keyup", keyUpHandler, false);
			document.addEventListener("mousemove", mouseMoveHandler, false);

			function reinit() {
				level++;
				dx = Math.abs(dx) + level;
				dy = -dx;
				paddleSpeed = paddleSpeed + level;
				brickRowCount = 1 + level * 2;
				brickColumnCount = 3 + level * 2;
				brickHeight = totalBrickHeight / 3 * 2 / brickRowCount;
				brickPadding = brickHeight / 2;
				brickWidth = (canvas.width - brickOffsetV * 2 - (brickPadding - 1) * brickColumnCount) / brickColumnCount;
				x = canvas.width/2;
				y = canvas.height-30;
				leftPressed = rightPressed = false;
				for (col = 0; col < brickColumnCount; ++col) {
					bricks[col] = [];
					for (row = 0; row < brickRowCount; ++row) {
						bricks[col][row] = {
							x: 0,
							y: 0,
							destroyed: false,
							isStrong: row % 2 === 1,
							cooldown: 0
						};
					}
				}
				initialized = true;
			}
			
			function toCanvasX(c, e) {
				var posx = 0;
				if (e.pageX) {
					posx = e.pageX;
				} else if (e.clientX) {
					posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				}
				posx = posx - c.offsetLeft;
				return posx;
			}

			function keyDownHandler(e) {
				if (e.keyCode == 39) {
					rightPressed = true;
				} else if (e.keyCode == 37) {
					leftPressed = true;
				} else if (e.keyCode == 87) {
					speedMultiplier *= 2;
				} else if (e.keyCode == 81) {
					speedMultiplier /= 2;
				}
			}

			function keyUpHandler(e) {
				if (e.keyCode == 39) {
					rightPressed = false;
				} else if (e.keyCode == 37) {
					leftPressed = false;
				}
			}
			
			function mouseMoveHandler(e) {
				var mouseX = toCanvasX(canvas, e);
				var possiblePaddleX = mouseX - paddleWidth/2;
				paddleX = (possiblePaddleX + paddleWidth > canvas.width) 
					? canvas.width - paddleWidth : (possiblePaddleX < 0) ? 0 : possiblePaddleX;
			}

			function drawBall() {
				ctx.beginPath();
				ctx.arc(x, y, ballRadius, 0, Math.PI*2);
				ctx.fillStyle = "#9aca2e";
				ctx.fill();
				ctx.closePath();
			}

			function drawPaddle() {
				ctx.beginPath();
				ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
				ctx.fillStyle = "#6179ff";
				ctx.fill();
				ctx.closePath();
			}

			function drawBricks() {
				for (col = 0; col < brickColumnCount; ++col) {
					for (row = 0; row < brickRowCount; ++row) {
						//if (bricks[col][row].destroyed) continue;
						var brickX = brickOffsetH + col * (brickWidth + brickPadding);
						var brickY = brickOffsetV + row * (brickHeight + brickPadding);
						bricks[col][row].x = brickX;
						bricks[col][row].y = brickY;
						ctx.beginPath();
						ctx.rect(brickX, brickY, brickWidth, brickHeight);
						ctx.fillStyle = bricks[col][row].isStrong ? "#ff4444" : "#face8d";
						ctx.fill();
						ctx.closePath();
						if (bricks[col][row].destroyed) {
							ctx.font = "bold" + brickHeight/2 + "px Arial";
							ctx.textBaseline = "middle";
							var ftext = Math.ceil(bricks[col][row].cooldown / fps);
							var ftextw = ctx.measureText(ftext).width;
							ctx.fillStyle = "#999999";
							ctx.fillText(ftext, brickX + brickWidth/2 - ftextw / 2, brickY + brickHeight/2);
						}
					}
				}
			}

			function drawStats() {
				ctx.font = "bold 20px Arial";
				ctx.textBaseline = "top";
				ctx.fillStyle = "#000000";
				var lvltext = "Level: " + level;
				ctx.fillText("Points: " + points, 2, 2);
				ctx.fillText(lvltext, canvas.width - ctx.measureText(lvltext).width - 2, 2);
			}

			function checkCollision() {
				for (var col = 0; col < brickColumnCount; ++col) {
					for (var row = 0; row < bricks[col].length; ++row) {
						// bricks[col][row]
						var brick = bricks[col][row]
						if (x >= brick.x && x <= brick.x + brickWidth) {
							if (y >= brick.y && y <= brick.y + brickHeight) {
								if (!brick.destroyed) {
									if (brick.isStrong) brick.isStrong = false;
									else {
										brick.destroyed = true;
										brick.cooldown = (40*1.5**(level-1)) * fps;
									}
									points++;
									rx = Math.abs(x - (brick.x + brickWidth / 2));
									ry = Math.abs(y - (brick.y + brickHeight / 2));
									if (rx / brickWidth > rx / brickHeight) {
										dx = -dx;
									} else {
										dy = -dy;
									}
								}
							}
						}
					}
				}
			}
			
			function cooldownFrame() {
				bricks.forEach(function(col) {
					col.forEach(function(brick) {
						if (brick.cooldown == 0) return brick.destroyed = false;
						brick.cooldown--;
					});
				});
			}

			function checkWin() {
				return bricks.every(function(col) {
					return col.every(brick => brick.destroyed);
				});
			}

			function draw() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				if (!initialized) reinit();
				cooldownFrame();
				drawBricks();
				drawBall();
				drawPaddle();
				drawStats();
				
				if (x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
					dx = -dx;
				}
				if (y + dy < ballRadius) {
					dy = -dy;
				} else if (y > canvas.height-(paddleHeight/2)-ballRadius) {
					if (x + ballRadius > paddleX && x < paddleX + paddleWidth / 2) {
						console.log("left");
						dy = -dy;
						dx = -Math.abs(dx);
					} else if (x >= paddleX + paddleWidth / 2 && x - ballRadius < paddleX + paddleWidth) {
						console.log("right");
						dy = -dy;
						dx = Math.abs(dx);
					} else {
						alert("GAME OVER\nYour points: " + points);
						document.location.reload();
					}
				}
				
				if (checkWin()) {
					alert("YOU WIN");
					initialized = false;
				}
				
				checkCollision();
				
				if (rightPressed && paddleX < canvas.width-paddleWidth) {
					paddleX += paddleSpeed;
				} else if (leftPressed && paddleX > 0) {
					paddleX -= paddleSpeed;
				}
				
				x += dx * speedMultiplier;
				y += dy * speedMultiplier;
				console.log(`${dx} ${dy} ${x} ${y}`);
				window.requestAnimationFrame(draw);
				}

				draw();
// setInterval(draw, 10);