const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const chalk = require('chalk');
const _ = require('lodash');

const rmu = require('./room_management');
const pls = require('./player_management');
const rules = require('./rules');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server); //The server-side client

app.use(router);
app.use(cors());

const updateRoom = roomName => {
	const room = rmu.getRoom({ roomName });
	const rule = {};
	try {
		rule.playerDist = rules.getPlayerDistribution(room.players.length);
		rule.missions = rules.getMissionRules(room.players.length);
	} catch (error) {
		switch (error.message) {
			case rules.err.PLAYER_LTMIN:
				rule.playerDist = {};
				rule.missions = [];
				break;
		}
	}

	io.in(roomName).emit('roomUpdate', { room, rule });
};

const newRound = room => {
	room.votes_p = [];
	const existingCaptainIndex = room.players.findIndex(player => player === room.captain);
	room.captain = room.players[(existingCaptainIndex + 1) % room.players.length];
	room.proposal = [];
};

io.on('connection', (socket) => {
	socket.on('join', ({ name, roomName }, callback) => {
		try {
			pls.connectPlayer({ name, id: socket.id });
		} catch (error) {
			switch (error.message) {
				case pls.err.PLAYER_EXISTS:
					return callback({ error: error.message });
					break;
				default:
					return;
			}
		}

		try {
			const room = rmu.addPlayer({ name, roomName });

			//socket.broadcast.to(room.name).emit('roomUpdate', { room });
			socket.join(room.name);

			updateRoom(room.name);
		} catch (error) {
			switch (error.message) {
				case rmu.err.GAME_BEGAN:
					return callback({ error: error.message });
					break;
			}
		}
	});

	socket.on('ready', ({ roomName }) => {
		const room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.LEADER_PROPOSES });
		const resistanceCt = rules.getPlayerDistribution(room.players.length).resistance;
		room.players = _.shuffle(room.players);
		room.roles = _.shuffle(room.players.map((player, index) => {
			return (index < resistanceCt) ? rules.RESISTANCE : rules.SPY;
		}));
		room.admin = null;
		room.captain = room.players[0];
		updateRoom(room.name);
	});

	socket.on('propose', ({ roomName, proposal }) => {
		const room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.PROPOSAL_VOTE });
		room.proposal = proposal;
		updateRoom(room.name);
	});

	socket.on('vote', ({ name, roomName, vote }) => {
		let room = rmu.getRoom({ roomName });
		room.votes_p.push({ name, vote });

		const agreeCt = room.votes_p.filter(pair => pair.vote === "agree").length;
		const disagreeCt = room.votes_p.filter(pair => pair.vote === "disagree").length;
		const threshold = room.players.length / 2;

		if (agreeCt > threshold) {
			room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.MISSION });
			room.votes_m = 0;
			room.votes_mt = 0;
		} else if (disagreeCt >= threshold) {
			room.consecutiveRejects++;
			if (room.consecutiveRejects >= 5) {
				room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.S_WINS });
			} else {
				room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.LEADER_PROPOSES });
				newRound(room);
			}
		}

		updateRoom(room.name);
	});

	socket.on('mission', ({ roomName, vote }) => {
		let room = rmu.getRoom({ roomName });
		room.votes_mt++;
		if (vote === "success") room.votes_m++;

		if (room.votes_mt === room.proposal.length) {
			const missionIndex = room.score.findIndex(score => !score);
			if (room.votes_m >= rules.getMissionRules(room.players.length)[missionIndex].required) {
				room.score[missionIndex] = "Resistance";
			} else {
				room.score[missionIndex] = "Spies";
			}

			if (room.score.filter(winner => winner === "Resistance").length >= 3) {
				room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.R_WINS });
			} else if (room.score.filter(winner => winner === "Spies").length >= 3) {
				room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.S_WINS });
			} else {
				room = rmu.setRoomGameState({ roomName, gameState: rmu.gs.LEADER_PROPOSES });
				newRound(room);
			}
		}

		updateRoom(room.name);
	});

	socket.on('kick', ({ nameToRemove, roomName }) => {
		try {
			rmu.removePlayer({ name: nameToRemove, roomName });
			io.to(pls.getPlayer({ name: nameToRemove }).id).emit('kick');
		} catch (error) {

		}

		//Separate block since the player to remove could be offline
		try {
			updateRoom(roomName);
		} catch (error) {

		}
	});

	socket.on('disconnect', () => {
		try {
			pls.disconnectPlayer({ id: socket.id });
		} catch (error) {
			//what
		}
	});
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
