const _PLAYER_DISTRIBUTION = [
	{
		resistance: 3,
		spies: 2,
	},
	{
		resistance: 4,
		spies: 2,
	},
	{
		resistance: 4,
		spies: 3,
	},
	{
		resistance: 5,
		spies: 3,
	},
	{
		resistance: 6,
		spies: 3,
	},
	{
		resistance: 6,
		spies: 4,
	},
];

const _MISSION_RULES = [
	[
		{
			total: 2,
			required: 2,
		},
		{
			total: 3,
			required: 3,
		},
		{
			total: 2,
			required: 2,
		},
		{
			total: 3,
			required: 3,
		},
		{
			total: 3,
			required: 3,
		},
	],
	[
		{
			total: 2,
			required: 2,
		},
		{
			total: 3,
			required: 3,
		},
		{
			total: 4,
			required: 4,
		},
		{
			total: 3,
			required: 3,
		},
		{
			total: 4,
			required: 4,
		},
	],
	[
		{
			total: 2,
			required: 2,
		},
		{
			total: 3,
			required: 3,
		},
		{
			total: 3,
			required: 3,
		},
		{
			total: 4,
			required: 3,
		},
		{
			total: 4,
			required: 4,
		},
	],
	[
		{
			total: 3,
			required: 3,
		},
		{
			total: 4,
			required: 4,
		},
		{
			total: 4,
			required: 4,
		},
		{
			total: 5,
			required: 4,
		},
		{
			total: 5,
			required: 5,
		},
	],
];

const err = {
	PLAYER_LTMIN: "Not enough players",
}

const getPlayerDistribution = total => {
	if (total <= 4) throw new Error(err.PLAYER_LTMIN);
	else if (total >= 5 && total <= 10) return _PLAYER_DISTRIBUTION[total - 5];
	else {
		//TODO: extrapolate pattern to total > 10
	}
};

const getMissionRules = total => {
	if (total <= 4) throw new Error(err.PLAYER_LTMIN);
	else if (total >= 5 && total <= 7) {
		return _MISSION_RULES[total - 5];
	}
	else if (total >= 8 && total <= 10) {
		return _MISSION_RULES[3];
	}
	else {
		//TODO: extrapolate pattern
	}
};

module.exports = {
	err,
	getPlayerDistribution,
	getMissionRules,
	RESISTANCE: "Resistance",
	SPY: "Spy",
}