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

const m1 = 0.622535;
const _extrapolatedPlayerDistribution = total => {
	let resistance = Math.round(m1 * total);
	let spies = total - resistance;
	return {
		resistance,
		spies,
	};
};

const mR = [0.323129, 0.438776, 0.438776, 0.554422, 0.554422];
const mFailMin = 0.222535;
const _extrapolatedMissionRules = total => mR.map((m, index) => {
	let roundTotal = Math.round(m * total);
	return {
		total: roundTotal,
		required: (index === 3) ? roundTotal + 1 - Math.round(mFailMin * total) : roundTotal,
	};
});

const getPlayerDistribution = total => {
	if (total <= 4) throw new Error(err.PLAYER_LTMIN);
	else if (total >= 5 && total <= 10) return _PLAYER_DISTRIBUTION[total - 5];
	else return _extrapolatedPlayerDistribution(total);
};

const getMissionRules = total => {
	if (total <= 4) throw new Error(err.PLAYER_LTMIN);
	else if (total >= 5 && total <= 7) return _MISSION_RULES[total - 5];
	else if (total >= 8 && total <= 10) return _MISSION_RULES[3];
	else return _extrapolatedMissionRules(total);
};

module.exports = {
	err,
	getPlayerDistribution,
	getMissionRules,
	RESISTANCE: "Resistance",
	SPY: "Spy",
}