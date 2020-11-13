var countryByIdSimulations = d3.map();
var countryByIdPopulation = d3.map();

// **** add or update coefficients here ****
var coeffs = new Map([
["SANITBASIC",
	new Map(
	[
		[1, 0.002240],
		[11, -0.001308],
		[12, -0.000341],
		[13, 0.000955],
		[14, 0.000705],
		[15, 0.000796],
		[16, -0.000470],
		[2, 233.9464],
		[21, 235.0595],
		[22, 75.44795],
		[23, -434.4536],
		[25, -351.7824],
		[26, 254.2561]
	]
        )
],
["SANITSAFE",
	new Map(
	[
		[1, 7.29E-05],
		[11, -5.98E-05],
		[13, 0.000101],
		[16, -1.99E-05],
		[2, 4264.142],
		[21, 11489.15],
		[23, -3922.251],
		[24, -16243.73],
		[25, -4314.271],
		[26, 2870.706]
	]
        )
],
["SCHOOLPERC",
	new Map(
	[
		[1, 2.13E-05],
		[12, -2.44E-06],
		[15, -4.48E-06],
		[16, 3.87E-06],
		[2, -28011.95],
		[21, -5385.622],
		[22, -5740.458],
		[24, 8537.920],
		[25, -17828.86]
	]
        )
],
["WATERBASIC",
	new Map(
	[
		[1, 0.002777],
		[12, -8.16E-05],
		[14, 0.000788],
		[15, 0.001012],
		[2, -154.0232],
		[22, 108.3361],
		[24, 247.8044]
	]
        )
],
["WATERSAFE",
	new Map(
	[
		[1, 0.002115],
		[11, 0.001616],
		[14, 0.001642],
		[15, -0.001307],
		[16, -0.000999],
		[2, 593.1014],
		[21, -228.0095],
		[22, 57.83624],
		[23, -270.4070],
		[25, 143.7995],
		[26, 168.7410]
	]
        )
],
["IMUNISATION",
	new Map(
	[
		[1, 8.14E-05],
		[11, -1.51E-05],
		[2, -25232.71],
		[21, -8328.613]
	]
        )
]
]);

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

// **** add or update outcomes here ****
var outcomesList = [
        ["WATERBASIC",
        {
            name: "Basic drinking water services",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The percentage of the population drinking water from an improved source, provided collection time is not more than 30 minutes for a round trip."
        }],
		["WATERSAFE",
        {
            name: "Safely-managed drinking water services",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The percentage of the population using drinking water from an improved source that is accessible on premises, available when needed and free from faecal and priority chemical contamination."
        }],	
        ["SANITBASIC",
        {
            name: "Basic sanitation",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The percentage of the population using at least, that is, improved sanitation facilities that are not shared with other households."
        }],
		["SANITSAFE",
        {
            name: "Safe sanitation",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The percentage of the population using improved sanitation facilities that are not shared with other households and where excreta are safely disposed of in situ or transported and treated offsite."
        }],
		["SCHOOLPERC",
        {
            name: "School life expectancy",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The number of years a person of school entrance age can expect to spend within the specified level of education"
        }],

/*
		["IMUNISATION",
        {
            name: "Child immunisation",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The percentage of children ages 12-23 months who received DPT vaccinations before 12 months or at any time before the survey."
        }],
        */
];

let outcomesMap = new Map(outcomesList);

function C(_outcome, index) {
    return coeffs.get(_outcome).get(index);
}

function gg(_type, _d, _gov) {
    var x = _d[_type] + (govMeasures.get(_type).positive == true ? _gov : -_gov);
    var limited = Math.min(Math.max(-2.5, x),2.5)
    return limited;
}

function computegovernance(_d, _gov)
{
    var ret = new Map();
    govMeasures.forEach(function(measure, govtype){
        ret.set(govtype, {desc : measure.desc, value : gg(govtype, _d, _gov)});
    })
    return ret;
}

function compute(d, pop, _outcome, _grpc, _gov) {
    var l = _outcome;
    var improved;

    function g(_type) {
        return gg(_type, d, _gov)
    }

    if (_outcome == "SANITBASIC") {
        improved = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") + C(l, 12) * g("POLSTAB") +
            C(l, 13) * g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) *
            g("VOICE")) * (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") +
            C(l, 23) * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")
        ))))
    } else if (_outcome == "SANITSAFE") {
        improved = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") + 0 * g("POLSTAB") + C(l, 13) *
                g("REGQUALITY") + 0 * g("RULELAW") + 0 * g("GOVEFFECT") + C(l, 16) * g("VOICE")) *
            (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + 0 * g("POLSTAB") + C(l, 23) *
                g("REGQUALITY") + C(l, 24) * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")
            ))));
    } else if (_outcome == "SCHOOLPERC") {
        improved = 100 / (1 + Math.exp(-(C(l, 1) + 0 * g("CORRUPTION") + C(l, 12) * g("POLSTAB") + 0 *
                g("REGQUALITY") + 0 * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) * g("VOICE")) *
            (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") + 0 *
                g("REGQUALITY") + C(l, 24) * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + 0 * g("VOICE")))))
    } else if (_outcome == "WATERBASIC") {
        improved = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 12) * g("POLSTAB") + C(l, 14) * g("RULELAW") +
            C(l, 15) * g("GOVEFFECT")) * (_grpc - (C(l, 2) + C(l, 22) * g("POLSTAB") + C(l, 24) *
            g("RULELAW")))))
    } else if (_outcome == "WATERSAFE") {
        improved = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") + 0 * g("POLSTAB") + 0 *
                g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) * g("VOICE")) *
            (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") + C(l, 23) *
                g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")))))
    } else if (_outcome == "IMUNISATION") {
        improved = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("POLSTAB")) * (_grpc - (C(l, 2) +
            C(l, 21) * g("POLSTAB")))))
    } else {
        improved = NaN;
    }

    return improved;
}

function computeResult(d, pop, _outcome, _grpc, _grpcOrig, _govImprovement) {
    var fitted = compute(d, pop, _outcome, _grpcOrig, 0)
    var original = d[_outcome]
    var improved = compute(d, pop, _outcome, _grpc, _govImprovement)
    var govresults = computegovernance(d, _govImprovement)
    var residual = original - fitted;
    improved = Math.min(Math.max(improved + residual, 0), 100);

    var additional = {};

    if (_outcome == "SANITBASIC" || _outcome == "SANITSAFE" || _outcome == "WATERBASIC" || _outcome == "WATERSAFE") {
        additional["People with increased access"] = (improved - original) / 100 * pop["Population, total"];
        additional["Children < 5 with increased access"] = (improved - original) / 100 * pop["Pop < 5"];
        additional["Females 15-49 with increased access"] = (improved - original) / 100 * pop["Number of females aged 15-49"];
    } else if (_outcome == "IMUNISATION") {
        additional["Number of infants immunised"] = (improved - original) / 100 * pop["Children survive to 1 year"]
    } else if (_outcome == "SCHOOLPERC") {
        additional["Years of school life expectancy"] = 17 * (improved - original) / 100 * pop["Pop < 5"]
    }

    var ret = {
        original: d[_outcome],
        "improved": improved,
        "fitted": fitted,
        "additional": additional,
        "gov" : govresults
    };
    return ret;
}


function typeAndSetPopulation(d) {
    d["Birth rate, crude (per 1,000 people)"] = +d["Birth rate, crude (per 1,000 people)"]
    d["Births attended by skilled health staff (% of total)"] = +d["Births attended by skilled health staff (% of total)"]
    d["Children survive to 1 year"] = +d["Children survive to 1 year"]
    d["Children survive to 5 years"] = +d["Children survive to 5 years"]
    d["Fertility rate, total (births per woman)"] = +d["Fertility rate, total (births per woman)"]
    d["Mortality rate, infant (per 1,000 live births)"] = +d["Mortality rate, infant (per 1,000 live births)"]
    d["Mortality rate, under-5 (per 1,000 live births)"] = +d["Mortality rate, under-5 (per 1,000 live births)"]
    d["Number of births"] = +d["Number of births"]
    d["Number of females aged 15-49"] = +d["Number of females aged 15-49"]
    d["Percentage of female population aged 15-49"] = +d["Percentage of female population aged 15-49"]
    d["Pop < 5"] = +d["Pop < 5"]
    d["Population ages 00-04, female (% of female population)"] = +d["Population ages 00-04, female (% of female population)"]
    d["Population ages 00-04, male (% of male population)"] = +d["Population ages 00-04, male (% of male population)"]
    d["Population ages 10-14, female (% of female population)"] = +d["Population ages 10-14, female (% of female population)"]
    d["Population ages 15-19, female (% of female population)"] = +d["Population ages 15-19, female (% of female population)"]
    d["Population ages 20-24, female (% of female population)"] = +d["Population ages 20-24, female (% of female population)"]
    d["Population ages 25-29, female (% of female population)"] = +d["Population ages 25-29, female (% of female population)"]
    d["Population ages 30-34, female (% of female population)"] = +d["Population ages 30-34, female (% of female population)"]
    d["Population ages 35-39, female (% of female population)"] = +d["Population ages 35-39, female (% of female population)"]
    d["Population ages 40-44, female (% of female population)"] = +d["Population ages 40-44, female (% of female population)"]
    d["Population ages 45-49, female (% of female population)"] = +d["Population ages 45-49, female (% of female population)"]
    d["Population, female"] = +d["Population, female"]
    d["Population, female (% of total population)"] = +d["Population, female (% of total population)"]
    d["Population, male"] = +d["Population, male"]
    d["Population, male (% of total population)"] = +d["Population, male (% of total population)"]
    d["Population, total"] = +d["Population, total"]
    d["Survival rate to 5 years"] = +d["Survival rate to 5 years"]
    d["Survival rate to 12 mo"] = +d["Survival rate to 12 mo"]
    d["countrycode"] = d["countrycode"]
    d["countryname"] = d["countryname"]
    d["female <5 "] = +d["\"female <5 \""]
    d["incomelevel"] = d["incomelevel"]
    d["male <5"] = +d["male <5"]
    d["year"] = +d["year"]
    countryByIdPopulation.set(d.countrycode + d.year, d);
    return d;
}

function typeAndSetSimulations(d) {
    if (d === undefined) {
        return undefined
    } else {
        d.CORRUPTION = +d.CORRUPTION
        d.Country = d.Country
        d.GOVEFFECT = +d.GOVEFFECT
        d.GRPERCAP = +d.GRPERCAP
        d.IMUNISATION = +d.IMUNISATION
        d.ISO = d.ISO
        d.POLSTAB = +d.POLSTAB
        d.REGQUALITY = +d.REGQUALITY
        d.RULELAW = +d.RULELAW
        d.SANITBASIC = +d.SANITBASIC
        d.SANITSAFE = +d.SANITSAFE
        d.SCHOOLPERC = +d.SCHOOLPERC
        d.VOICE = +d.VOICE
        d.WATERBASIC = +d.WATERBASIC
        d.WATERSAFE = +d.WATERSAFE
        d.YEAR = +d["Year "]
        countryByIdSimulations.set(d.ISO + d.YEAR, d);
    }
    return d;
}

function getRevenue(_sim, _pop, m) {
    var ret;
    if (m == "percentage") {
        var newAbsRev = (_sim.GRPERCAP * (govRevenue)) * _pop["Population, total"];
        var additionalPerCapita = _sim.GRPERCAP * govRevenue;
        ret = {
            "percentage increase": govRevenue,
            "new absolute revenue": newAbsRev,
            "additional revenue per capita": additionalPerCapita,
            "new grpc": _sim.GRPERCAP + additionalPerCapita,
            "historical grpc": _sim.GRPERCAP
        };
    } else if (m == "pc") {
        var newGRPC = _sim.GRPERCAP + pcGovRev;
        var newGovRev = newGRPC / _sim.GRPERCAP - 1;
        var newAbsRev = (_sim.GRPERCAP * (newGovRev)) * _pop["Population, total"];
        ret = {
            "percentage increase": newGovRev,
            "new absolute revenue": newAbsRev,
            "additional revenue per capita": pcGovRev,
            "new grpc": newGRPC,
            "historical grpc": _sim.GRPERCAP
        };
    } else if (m == "newgrpc") {
        var newGRPC = enteredGrpc > _sim.GRPERCAP ? enteredGrpc : _sim.GRPERCAP;
        var newGovRev = newGRPC / _sim.GRPERCAP - 1;
        var newAbsRev = (_sim.GRPERCAP * (newGovRev)) * _pop["Population, total"];
        ret = {
            "percentage increase": newGovRev,
            "new absolute revenue": newAbsRev,
            "additional revenue per capita": newGRPC - _sim.GRPERCAP,
            "new grpc": newGRPC,
            "historical grpc": _sim.GRPERCAP
        };
    } else {
        var newGRPC = _sim.GRPERCAP + absGovRev / _pop["Population, total"];
        var newGovRev = newGRPC / _sim.GRPERCAP - 1;
        var additionalPerCapita = absGovRev / _pop["Population, total"];
        ret = {
            "percentage increase": newGovRev,
            "new absolute revenue": absGovRev,
            "additional revenue per capita": additionalPerCapita,
            "new grpc": newGRPC,
            "historical grpc": _sim.GRPERCAP
        };
    }
    return ret;
}
