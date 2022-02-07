var govMeasures = new Map([
    ["CORRUPTION", {
        desc: "Corruption",
        positive: true
    }],
    ["GOVEFFECT", {
        desc: "Government effectiveness",
        positive: true
    }],
    ["POLSTAB", {
        desc: "Political stability",
        positive: true
    }],
    ["REGQUALITY", {
        desc: "Regulatory quality",
        positive: true
    }],
    ["RULELAW", {
        desc: "Rule of law",
        positive: true
    }],
    ["VOICE", {
        desc: "Voice and accountability",
        positive: true
    }],
]);

function getGov(_type, _d, _gov) {
    var x = NaN
    if (_gov > -100) // Governance of -100 is a flag to use the endogenous model
    {
        // Exogenous governance model
        x = _d[_type] + (govMeasures.get(_type).positive == true ? _gov : -_gov);
    }
    else
    {
        x = 0; //!! TODO
    }
    var limited = Math.min(Math.max(-2.5, x), 2.5)
    return limited;
}