//  Socket Controller

const debug = require('debug')('game:socket_controller');
let io = null; // socket.io server instance

// list of socket-ids and their username
const rooms = [];

// a 'toggler' for a status of a waiting opponent
let waiting_opponent = true;

// creating a temporary variabel with a name for room
let roomName = false;

// battlefield size (10x10)
const FIELD_SIZE = 10;

// we declare class yacht for create a new yacht
class Yacht {

	// @length - how many spans our ship will take on battlefield
	// @row_start - the starting row of our ship
	// @row_col - the starting column of our ship
	// @vertical - horizontal ship = "0", vertical ship = "1"
	constructor(length, row_start, col_start, vertical) {
		this.row_start = row_start
		this.col_start = col_start

		// contains information about position of grid divs occupied by our ship
		this.points = this.getPoints(length, row_start, col_start, vertical)

		this.hit_points = []
		this.is_killed = false
	}


	// checks if every point of a newly created yacht will intersect existing yachts
	isNear(other_yacht) {

		let current_yacht_points = this.points;
		let other_yacht_points = other_yacht.points;

		for (let current_yacht_point of current_yacht_points) {
			for (let other_yacht_point of other_yacht_points) {
				// points are considered as near if they have either same position or
				// they are neighbours (neighbors mean row/colum difference is 1).
				if (Math.abs(current_yacht_point.row - other_yacht_point.row) <= 1
					&& Math.abs(current_yacht_point.col - other_yacht_point.col) <= 1) {

					return true;
				}
			}
		}

		return false;
	}
	// checks current yacht is located within battlefield
	isNotFitField(field_rows, field_columns) {

		let current_yacht_points = this.points;
		// we check if every point within battlefield.
		// 0 < column <= field_columns
		// 0 < row    <= field_rows
		for (let point of current_yacht_points) {
			if (point.row >= field_rows || point.row < 0 || point.col >= field_columns || point.col < 0) {
				return true;
			}
		}

		return false;
	}

	// generates points for a nnew yacht
	getPoints(length, row_start, col_start, vertical) {
		let points = [{ row: row_start, col: col_start }];

		// if it is a 2 points ship
		if (length === 2) {
			// and it is horizontal
			if (vertical === 0) {
				// we keep the same row but add another column horizontally
				points.push({ row: row_start, col: col_start + 1 })
			} else {
				// if it is vertical we add another row
				points.push({ row: row_start + 1, col: col_start })
			}
			// do the same for other ships
		} else if (length === 3) {
			if (vertical === 0) {
				points.push({ row: row_start, col: col_start + 1 })
				points.push({ row: row_start, col: col_start + 2 })

			} else {
				points.push({ row: row_start + 1, col: col_start })
				points.push({ row: row_start + 2, col: col_start })
			}
		} else if (length === 4) {
			if (vertical === 0) {
				points.push({ row: row_start, col: col_start + 1 })
				points.push({ row: row_start, col: col_start + 2 })
				points.push({ row: row_start, col: col_start + 3 })

			} else {
				points.push({ row: row_start + 1, col: col_start })
				points.push({ row: row_start + 2, col: col_start })
				points.push({ row: row_start + 3, col: col_start })
			}
		}
		return points;
	}

}
//  Handle a user disconnecting
const handleDisconnect = function () {
	// debug(`Client ${this.id} disconnected :(`);
	// find the room that this socket is part of
	const room = rooms.find(room => room.users.find(user => user.id === this.id));

	// if socket was not in a room, don't broadcast disconnect
	if (!room) {
		return;
	}

	// let everyone in the room know that this user has disconnected
	this.broadcast.to(room.id).emit('user:disconnected')

	// remove a room because we need to start a new game
	rooms.splice(rooms.indexOf(room), 1)
}

const getNewYachts = function () {
	const yacht_sizes = [4, 3, 2, 2];
	const yachts = [];

	// here we generate yachts based on how many yachts we need
	for (let i = 0; i < yacht_sizes.length; i++) {

		let new_yacht;
		let is_near;
		let is_not_fit_field;

		// we create a new yacht based on class constructor
		do {
			is_near = false;
			is_not_fit_field = false;
			new_yacht = new Yacht(yacht_sizes[i], Math.floor(Math.random() * FIELD_SIZE), Math.floor(Math.random() * FIELD_SIZE), Math.floor(Math.random() * 2));

			// then we check if the yacht is near other yachts
			for (let existing_yacht of yachts) {
				is_near = existing_yacht.isNear(new_yacht);

				if (is_near) {
					break;
				}
			}

			// and if it fits or not fits the game field
			is_not_fit_field = new_yacht.isNotFitField(FIELD_SIZE, FIELD_SIZE)
			// and we repeat this logic until we get a proper yacht
		} while (is_near || is_not_fit_field);

		// if we get a proper yacht we push it to all yachts array
		yachts.push(new_yacht);
	}
	return yachts
}

// builds a list of Yacht objects from the client payload (or random if none given)
const buildYachts = function (yachts) {
	if (!yachts) {
		return getNewYachts();
	}

	const result = [];
	for (let yacht of yachts) {
		if (yacht.vertical === 'horizontal') {
			yacht.vertical = 0
		} else {
			yacht.vertical = 1
		}
		result.push(new Yacht(yacht.length, yacht.row_start, yacht.col_start, yacht.vertical))
	}
	return result;
}

const handleChatMessage = async function (data) {

	const room = rooms.find(room => room.users.find(user => user.id === this.id));
	if (!room) {
		return
	}
	// emit `chat:message` event to everyone EXCEPT the sender
	this.broadcast.to(room.id).emit('chat:message', data)
}

// checks if a coordinate is inside the battlefield
const inField = function (row, col) {
	return row >= 0 && row < FIELD_SIZE && col >= 0 && col < FIELD_SIZE
}

// checks if a coordinate was already shot
const alreadyShot = function (shots, row, col) {
	return shots.some(s => s.row === row && s.col === col)
}

// Computer AI: picks the next cell to shoot (hunt & target strategy)
const getBotShot = function (bot) {
	const ai = bot.ai;
	let target = null;

	// if we are currently hunting a damaged (but not sunk) ship, target its neighbours
	while (ai.targets.length > 0) {
		const idx = Math.floor(Math.random() * ai.targets.length);
		const candidate = ai.targets[idx];
		ai.targets.splice(idx, 1);

		if (!alreadyShot(ai.shots, candidate.row, candidate.col)) {
			target = candidate;
			break;
		}
	}

	// otherwise shoot a random cell that we have not shot before
	if (!target) {
		const unshot = [];
		for (let r = 0; r < FIELD_SIZE; r++) {
			for (let c = 0; c < FIELD_SIZE; c++) {
				if (!alreadyShot(ai.shots, r, c)) {
					unshot.push({ row: r, col: c });
				}
			}
		}
		target = unshot[Math.floor(Math.random() * unshot.length)];
	}

	ai.shots.push(target);
	return target;
}

// Computer AI: update targeting info after a shot
const updateBotAi = function (bot, target, isHit, killedYacht) {
	const ai = bot.ai;

	if (!isHit) {
		return;
	}

	if (killedYacht) {
		// ship is sunk, stop hunting it
		ai.targets = [];
		return;
	}

	// damaged but not sunk: add orthogonal neighbours as candidates
	const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
	for (const [dr, dc] of directions) {
		const row = target.row + dr;
		const col = target.col + dc;
		const alreadyTargeted = ai.targets.some(t => t.row === row && t.col === col);

		if (inField(row, col) && !alreadyShot(ai.shots, row, col) && !alreadyTargeted) {
			ai.targets.push({ row, col });
		}
	}
}

// processes a shot from `shooter` against the opponent in the same room
const processShot = function (room, shooter, target) {
	const opponent = room.users.find(user => user.id !== shooter.id);

	let opponentCoordinates = [];
	let killedYacht = false;

	// gather all enemy yacht points
	opponent.yachts.forEach(yacht => {
		yacht.points.forEach(point => opponentCoordinates.push(point));
	});

	const isHit = opponentCoordinates.some(coordinate => {
		return coordinate.row === target.row && coordinate.col === target.col;
	});

	// mark hit points and detect killed yacht
	opponent.yachts.forEach(yacht => {
		yacht.points.forEach(point => {
			if (point.row === target.row && point.col === target.col) {
				const hasObj = yacht.hit_points.some(coordinate => {
					return coordinate.row === target.row && coordinate.col === target.col;
				});

				if (!hasObj) {
					yacht.hit_points.push(target);
				}

				if (yacht.hit_points.length === yacht.points.length) {
					yacht.is_killed = true;
					killedYacht = yacht;
				}
			}
		});
	});

	const gameOver = opponent.yachts.every(yacht => yacht.is_killed === true);

	return { isHit, killedYacht, gameOver };
}

// Computer's turn: shoot at the human player and emit the result
const botTurn = function (room, bot, human) {
	// the room may have been removed (game ended / player left) while waiting
	if (!rooms.includes(room)) {
		return;
	}

	const target = getBotShot(bot);
	const result = processShot(room, bot, target);
	updateBotAi(bot, target, result.isHit, result.killedYacht);

	if (result.isHit) {
		io.in(room.id).emit('shot:hit', bot.id, target, result.killedYacht);
	} else {
		io.in(room.id).emit('shot:miss', bot.id, target);
	}

	// switch turns
	bot.move = false;
	human.move = true;

	if (result.gameOver) {
		io.in(room.id).emit('shot:winner', bot.id, target, result.killedYacht);
	}
}

module.exports = function (socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	// handle user disconnect
	socket.on('disconnect', handleDisconnect)

	socket.on('user:joined', function (username, yachts, mode, callback) {

		const gameMode = (mode === 'computer') ? 'computer' : 'friend';

		// ---------- SINGLE PLAYER (against the computer) ----------
		if (gameMode === 'computer') {

			const room = {
				id: 'room_' + this.id,
				mode: 'computer',
				users: [],
			}
			rooms.push(room);

			// human user (always moves first for a friendlier experience)
			const user = {
				id: this.id,
				username: username,
				move: true,
				killed_ships: 0,
				yachts: buildYachts(yachts),
			}
			room.users.push(user);
			this.join(room.id);

			// computer opponent (virtual player, no socket)
			const bot = {
				id: 'bot_' + this.id,
				username: 'Computer',
				move: false,
				killed_ships: 0,
				isBot: true,
				yachts: getNewYachts(),
				ai: { shots: [], targets: [] },
			}
			room.users.push(bot);

			// respond immediately - there is nobody to wait for
			callback({
				yachts: user.yachts,
				waiting: false,
				computerGame: true,
				opponent: bot.username,
				move: user.move,
			});

			return;
		}

		// ---------- MULTIPLAYER (against a friend) ----------
		// if there is no room creating a new room with id equal to the first sockets id
		if (!roomName) {
			roomName = 'room_' + this.id
			let room = {
				id: roomName,
				mode: 'friend',
				users: [],
			}
			// push a new room to all rooms array
			rooms.push(room);
		} else {
			waiting_opponent = false
		}

		// looking for a room with a name from temporary variable in the rooms array
		const room = rooms.find(room => room.id === roomName)

		if (!room) {
			return
		}

		// join user to this room
		this.join(room.id);

		// associate socket id with username and store it in a room oject in the rooms array
		let user = {
			id: this.id,
			username: username,
			move: false,
			killed_ships: 0,
			yachts: buildYachts(yachts),
		}

		room.users.push(user);

		callback({
			yachts: user.yachts,
			waiting: waiting_opponent
		});

		// if we don't need to wait an opponent anymore:
		if (!waiting_opponent) {

			// choose a random user to move first
			let user_to_move_first = Math.floor(Math.random() * 2);
			room.users[user_to_move_first].move = true;

			// sever emit to second socket waiting status, opponent name and who move first
			socket.emit('user:opponent_found', waiting_opponent, room.users[0].username, room.users[1].move);

			// sever emit to first socket waiting status, opponent name and who move first
			socket.to(room.id).emit('user:opponent_found', waiting_opponent, username, room.users[0].move);

			// discard the temporary variables
			waiting_opponent = true;
			roomName = false;

		};
	});

	socket.on('chat:message', handleChatMessage);


	socket.on('game:shoot', (shootTarget) => {

		if (shootTarget) {
			const room = rooms.find(room => room.users.find(user => user.id === socket.id))

			if (!room) {
				return
			}

			const user = room.users.find(user => user.id === socket.id)
			const opponent = room.users.find(user => user.id !== socket.id)

			if (!opponent) {
				return
			}

			// in single player mode the human can only shoot on their own turn
			if (room.mode === 'computer' && user.move !== true) {
				return
			}

			const result = processShot(room, user, shootTarget);

			if (result.isHit) {
				io.in(room.id).emit('shot:hit', user.id, shootTarget, result.killedYacht)
			} else {
				io.in(room.id).emit('shot:miss', user.id, shootTarget)
			}

			if (result.gameOver) {
				io.in(room.id).emit('shot:winner', user.id, shootTarget, result.killedYacht)
				return
			}

			// single player: hand the turn over to the computer
			if (room.mode === 'computer' && opponent.isBot) {
				user.move = false;
				opponent.move = true;

				const delay = 800 + Math.random() * 800;
				setTimeout(() => botTurn(room, opponent, user), delay);
			}
		}
	})

	socket.on('game:end', () => {
		const room = rooms.find(room => room.users.find(user => user.id === socket.id));
		if (!room) {
			return;
		}
		rooms.splice(rooms.indexOf(room), 1);
	})
}
