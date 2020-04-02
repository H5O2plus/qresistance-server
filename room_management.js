const err = {
	GAME_BEGAN: "Game has already started",
	PLAYER_EXISTS: "Player with same name is already in room",
	PLAYER_DNE: "Player not found in room",
	PLAYER_IS_ADMIN: "Player is admin",
	ROOM_EXISTS: "Room with same name already exists",
	ROOM_DNE: "Room does not exist",
}

//game states as enums
const gs = {
	IDLE: 0,
	LEADER_PROPOSES: 1,
	PROPOSAL_VOTE: 2,
	MISSION: 3,
	R_WINS: 4,
	S_WINS: 5,
};

//Types of votes
const vote = {
	AGREE: 0,
	DISAGREE: 1,
};

let rooms = new Map();

const getRoom = ({ roomName }) => {
	if (rooms.has(roomName)) {
		return rooms.get(roomName);
	} else {
		throw new Error(err.ROOM_DNE);
	}
};

const setRoomGameState = ({ roomName, gameState }) => {
	const room = getRoom({ roomName });
	room.gameState = gameState;
	return room;
};

const createRoom = ({ roomName, name }) => {
	if (rooms.has(roomName)) {
		throw err.ROOM_EXISTS;
	} else {
		rooms.set(roomName, {
			name: roomName,
			admin: name,
			players: [name],
			roles: [],
			captain: null,
			proposal: [],
			consecutiveRejects: 0,
			score: [null, null, null, null, null],
			gameState: gs.IDLE,
			votes_p: [],
			votes_m: 0, //number of successes
			votes_mt: 0, //total mission votes
		});
		return rooms.get(roomName);
	}
};

const addPlayer = ({ name, roomName }) => {
	try {
		const room = getRoom({ roomName });
		const { players, gameState } = room;
		if (!players.includes(name)) {
			if (gameState !== gs.IDLE) {
				throw new Error(err.GAME_BEGAN);
			} else {
				players.push(name);
			}


		}
	} catch (error) {
		switch (error.message) {
			case err.ROOM_DNE:
				createRoom({ name, roomName });
				break;
			default:
				throw error;
		}
	}

	return rooms.get(roomName);
};

const removePlayer = ({ name, roomName }) => {
	try {
		const room = getRoom({ roomName });
		const { admin, players, gameState } = room;
		if (gameState !== gs.IDLE) {
			throw new Error(err.GAME_BEGAN);
		} else if (players.includes(name)) {
			if (name === admin) {
				throw new Error(err.PLAYER_IS_ADMIN);
			} else {
				players.splice(players.indexOf(name), 1);
			}
		} else {
			throw new Error(err.PLAYER_DNE);
		}
	} catch (error) {
		switch (error.message) {
			default:
				throw error;
		}
	}

	return getRoom({ roomName });
};

module.exports = {
	getRoom,
	setRoomGameState,
	addPlayer,
	removePlayer,
	err,
	gs,
}