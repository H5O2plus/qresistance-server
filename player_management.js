let players = [];

const err = {
	ARG_EMPTY: "Arguments are empty",
	PLAYER_EXISTS: "Player with same name is already registered in players",
	PLAYER_DNE: "Player not found",
};

const playerExists = ({ name, id }) => {
	if (!name && !id) throw new Error(err.ARG_EMPTY);
	else if (name && !id) return players.some(player => player.name === name);
	else if (!name && id) return players.some(player => player.id === id);
	else return players.some(player => player.name === name && player.id === id);
}

const getPlayer = ({ name }) => {
	const existingPlayer = players.find(player => player.name === name);
	if (existingPlayer) return existingPlayer;
	else throw new Error(err.PLAYER_DNE);
};

const getPlayerIndex = ({ id }) => {
	const existingPlayerIndex = players.findIndex(player => player.id === id);
	if (existingPlayerIndex >= 0) return existingPlayerIndex;
	else throw new Error(err.PLAYER_DNE);
}

const connectPlayer = ({ name, id }) => {
	if (!name || !id) {
		throw new Error(err.ARG_EMPTY);
	} else if (playerExists({ name })) {
		throw new Error(err.PLAYER_EXISTS);
	} else {
		players.push({
			name,
			id,
		});
	}
};

const disconnectPlayer = ({ id }) => {
	if (!id) {
		throw new Error(err.ARG_EMPTY);
	} else if (!playerExists({ id })) {
		throw new Error(err.PLAYER_DNE);
	} else {
		players.splice(getPlayerIndex({ id }), 1);
	}
};

module.exports = {
	playerExists,
	getPlayer,
	connectPlayer,
	disconnectPlayer,
	err,
}