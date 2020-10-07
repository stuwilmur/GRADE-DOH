var countryByIdSimulations = d3.map();
var countryByIdPopulation = d3.map();

// **** add or update coefficients here ****
var coeffs = new Map([
["SANITBASIC", 	
	new Map(
	[
		[1	,	0.00224	],	
		[11	,	-0.00130],
		[12	,	-0.00034],
		[13	,	0.000955],
		[14	,	0.000705],
		[15	,	0.000796],
		[16	,	-0.00047],
		[2	,	233.9464],
		[21	,	235.0595],
		[22	,	75.44795],
		[23	,	-434.453],
		[25	,	-351.782],
		[26	,	254.2561]
	]
	)
],
["SANITSAFE", 	
	new Map(
	[
		[1	,	7.29E-05],
		[11	,	-5.98E-0],
		[13	,	0.000101],
		[16	,	-1.99E-0],
		[2 	,	4264.142],
		[21	,	11489.15],
		[23	,	-3922.25],
		[24	,	-16243.7],
		[25	,	-4314.27],
		[26	,	2870.706]
	]
	)
],
["SCHOOLPERC", 	
	new Map(
	[
		[1	,	2.13E-05],
		[12	,	-2.44E-06],
		[15	,	-4.48E-06],
		[16	,	3.87E-06 ],
		[2	,	-28011.95],
		[21	,	-5385.622],
		[22	,	-5740.458],
		[24	,	8537.92  ],
		[25	,	-17828.86]
	]
	)
],
["WATERBASIC", 	
	new Map(
	[
		[1	,	0.002777],
		[12	,	-8.16E-0],
		[14	,	0.000788],
		[15	,	0.001012],
		[2	,	-154.023],
		[22	,	108.3361],
		[24	,	247.8044]
	]
	)
],
["WATERSAFE",	
	new Map(
	[
		[1	,	0.00211],
		[11	,	0.00161],
		[14	,	0.00164],
		[15	,	-0.0013],
		[16	,	-0.0009],
		[2	,	593.101],
		[21	,	-228.00],
		[22	,	57.8362],
		[23	,	-270.40],
		[25	,	143.799],
		[26	,	168.741]
	]
	)
],
["IMUNISATION",	
	new Map(
	[
		[1	,	8.14E-05],	
		[11	,	-1.51E-05],
		[2	,	-25232.71],
		[21	,	-8328.613]
	]
	)
]
]);

// **** add or update outcomes here ****
var outcomesList = [
		[ "SANITBASIC",                                  
				{ 
						name : "Basic sanitation",  
						loCol : "#dee5f8",              
						hiCol : "#e09900",
						fixedExtent : [0,100],						
						desc: "The percentage of the population using at least, that is, improved sanitation facilities that are not shared with other households."}], 
		[ "SANITSAFE",                                       
				{ 
						name : "Safe sanitation",    
						loCol : "#dee5f8",              
						hiCol : "#e09900",              
						fixedExtent : [0,100],
						desc: "The percentage of the population using improved sanitation facilities that are not shared with other households and where excreta are safely disposed of in situ or transported and treated offsite."}], 
		[ "SCHOOLPERC",
				{
						name : "School life expectancy", 
						loCol : "#dee5f8",              
						hiCol : "#e09900",    
						fixedExtent : [0,100],
						desc : "The number of years a person of school entrance age can expect to spend within the specified level of education"}],
		[ "WATERBASIC", 	                                                    
				{                                       
						name : "Basic drinking water services",             				
						loCol : "#dee5f8",                                      
						hiCol : "#e09900",                                      
						fixedExtent : [0,100],                          		
						desc : "The percentage of the population drinking water from an improved source, provided collection time is not more than 30 minutes for a round trip."}],        				
						
		[ "WATERSAFE", 	                                                    
				{                                       
						name : "Safely-managed drinking water services",             				
						loCol : "#dee5f8",                                      
						hiCol : "#e09900",                                      
						fixedExtent : [0,100],                          		
						desc : "The percentage of the population using drinking water from an improved source that is accessible on premises, available when needed and free from faecal and priority chemical contamination."}],        										
		
		[ "IMUNISATION", 	                                                    
				{                                       
						name : "Child immunisation",             				
						loCol : "#dee5f8",                                      
						hiCol : "#e09900",                                      
						fixedExtent : [0,100],                          		
						desc : "The percentage of children ages 12-23 months who received DPT vaccinations before 12 months or at any time before the survey."}],
];

let outcomesMap = new Map(outcomesList);

function C(_outcome, index)
{
	return coeffs.get(_outcome).get(index);
}

function computeResult(d, _outcome, _grpc)
{		
	var improved;
	var l = _outcome;
	if (_outcome == "SANITBASIC")
	{
		improved = 100 / (1 + Math.exp(-(C(l,1)+C(l,11)*d.CORRUPTION+C(l,12)*d.POLSTAB
		+C(l,13)*d.REGQUALITY+C(l,14)*d.RULELAW+C(l,15)*d.GOVEFFECT+C(l,16)
		*d.VOICE)*(_grpc-(C(l,2)+C(l,21)*d.CORRUPTION+C(l,22)*d.POLSTAB
		+C(l,23)*d.REGQUALITY+0*d.RULELAW+C(l,25)*d.GOVEFFECT+C(l,26)*d.VOICE
		))))	
	}
	else if (_outcome == "SANITSAFE")
	{
		improved = 100/(1+Math.exp(-(C(l,1)+C(l,11)*d.CORRUPTION+0*d.POLSTAB+C(l,13)
        *d.REGQUALITY+0*d.RULELAW+0*d.GOVEFFECT+C(l,16)*d.VOICE)
        *(_grpc-(C(l,2)+C(l,21)*d.CORRUPTION+0*d.POLSTAB+C(l,23)
        *d.REGQUALITY+C(l,24)*d.RULELAW+C(l,25)*d.GOVEFFECT+C(l,26)*d.VOICE
        ))))			
	}
	else if (_outcome == "SCHOOLPERC")
	{
		improved = 100/(1+Math.exp(-(C(l,1)+0*d.CORRUPTION+C(l,12)*d.POLSTAB+0
        *d.REGQUALITY+0*d.RULELAW+C(l,15)*d.GOVEFFECT+C(l,16)*d.VOICE)
        *(_grpc-(C(l,2)+C(l,21)*d.CORRUPTION+C(l,22)*d.POLSTAB+0
        *d.REGQUALITY+C(l,24)*d.RULELAW+C(l,25)*d.GOVEFFECT+0*d.VOICE ))))
	}
	else if (_outcome == "WATERBASIC")
	{
		improved = 100/(1+Math.exp(-(C(l,1)+C(l,12)*d.POLSTAB+C(l,14)*d.RULELAW
        +C(l,15)*d.GOVEFFECT)*(_grpc-(C(l,2)+C(l,22)*d.POLSTAB+C(l,24)
        *d.RULELAW))))		
	}
	else if (_outcome == "WATERSAFE")
	{
		improved = 100/(1+Math.exp(-(C(l,1)+C(l,11)*d.CORRUPTION+0*d.POLSTAB+0
        *d.REGQUALITY+C(l,14)*d.RULELAW+C(l,15)*d.GOVEFFECT+C(l,16)*d.VOICE)
        *(_grpc-(C(l,2)+C(l,21)*d.CORRUPTION+C(l,22)*d.POLSTAB+C(l,23)
        *d.REGQUALITY+0*d.RULELAW+C(l,25)*d.GOVEFFECT+C(l,26)*d.VOICE ))))
	}
	else if (_outcome == "IMUNISATION")
	{
		improved = 100/(1+Math.exp(-(C(l,1)+C(l,11)*d.POLSTAB)*(_grpc-(C(l,2)
        +C(l,21)*d.POLSTAB ))))		
	}

	// [historical, improved]	
	return [d[_outcome], improved]
}


function typeAndSetPopulation(d) {
	d["Birth rate, crude (per 1,000 people)"]						=	+d["Birth rate, crude (per 1,000 people)"]						
	d["Births attended by skilled health staff (% of total)"]		=   +d["Births attended by skilled health staff (% of total)"]		
	d["Children survive to 1 year"]									=   +d["Children survive to 1 year"]									
	d["Children survive to 5 years"]								=   +d["Children survive to 5 years"]								
	d["Fertility rate, total (births per woman)"]					=   +d["Fertility rate, total (births per woman)"]					
	d["Mortality rate, infant (per 1,000 live births)"]				=   +d["Mortality rate, infant (per 1,000 live births)"]				
	d["Mortality rate, under-5 (per 1,000 live births)"]			=   +d["Mortality rate, under-5 (per 1,000 live births)"]			
	d["Number of births"]											=   +d["Number of births"]											
	d["Number of females aged 15-49"]								=   +d["Number of females aged 15-49"]								
	d["Percentage of female population aged 15-49"]					=   +d["Percentage of female population aged 15-49"]					
	d["Pop < 5"]													=   +d["Pop < 5"]													
	d["Population ages 00-04, female (% of female population)"]		=   +d["Population ages 00-04, female (% of female population)"]		
	d["Population ages 00-04, male (% of male population)"]			=   +d["Population ages 00-04, male (% of male population)"]			
	d["Population ages 10-14, female (% of female population)"]		=   +d["Population ages 10-14, female (% of female population)"]		
	d["Population ages 15-19, female (% of female population)"]		=   +d["Population ages 15-19, female (% of female population)"]		
	d["Population ages 20-24, female (% of female population)"]		=   +d["Population ages 20-24, female (% of female population)"]		
	d["Population ages 25-29, female (% of female population)"]		=   +d["Population ages 25-29, female (% of female population)"]		
	d["Population ages 30-34, female (% of female population)"]		=   +d["Population ages 30-34, female (% of female population)"]		
	d["Population ages 35-39, female (% of female population)"]		=   +d["Population ages 35-39, female (% of female population)"]		
	d["Population ages 40-44, female (% of female population)"]		=   +d["Population ages 40-44, female (% of female population)"]		
	d["Population ages 45-49, female (% of female population)"]		=   +d["Population ages 45-49, female (% of female population)"]		
	d["Population, female"]											=   +d["Population, female"]											
	d["Population, female (% of total population)"]					=   +d["Population, female (% of total population)"]					
	d["Population, male"]											=   +d["Population, male"]											
	d["Population, male (% of total population)"]					=   +d["Population, male (% of total population)"]					
	d["Population, total"]											=   +d["Population, total"]											
	d["Survival rate to 5 years"]									=   +d["Survival rate to 5 years"]									
	d["Survival rate to 12 mo"]										=   +d["Survival rate to 12 mo"]										
	d["countrycode"]												=    d["countrycode"]												
	d["countryname"]												=    d["countryname"]												
	d["female <5 "]													=   +d["\"female <5 \""]												
	d["incomelevel"]												=    d["incomelevel"]												
	d["male <5"]													=   +d["male <5"]													
	d["year"]														=   +d["year"]
    countryByIdPopulation.set(d.countrycode + d.year, d);	
	return d;
}

function typeAndSetSimulations(d) {
	d.CORRUPTION  	= +d.CORRUPTION  	
	d.Country 		=  d.Country 		
	d.GOVEFFECT 	= +d.GOVEFFECT 		
	d.GRPERCAP 		= +d.GRPERCAP 		
	d.IMUNISATION 	= +d.IMUNISATION 	
	d.ISO 			=  d.ISO 			
	d.POLSTAB 		= +d.POLSTAB 		
	d.REGQUALITY 	= +d.REGQUALITY 	
	d.RULELAW 		= +d.RULELAW 		
	d.SANITBASIC 	= +d.SANITBASIC 	
	d.SANITSAFE 	= +d.SANITSAFE 		
	d.SCHOOLPERC 	= +d.SCHOOLPERC 	
	d.VOICE 		= +d.VOICE 			
	d.WATERBASIC 	= +d.WATERBASIC 	
	d.WATERSAFE 	= +d.WATERSAFE 		
	d.YEAR 		 	= +d["Year "]
	countryByIdSimulations.set(d.ISO + d.YEAR, d);	
	return d;
}

function getRevenue(_sim, _pop, m)
{
	
		//returns % increase, new absolute revenue, additional revenue per capita, new grpc, historical grpc (no increase)
		if (m == "percentage")
		{
				var newAbsRev = (_sim.GRPERCAP * (govRevenue)) * _pop["Population, total"];
				var additionalPerCapita = _sim.GRPERCAP * govRevenue;
				return [govRevenue, newAbsRev, additionalPerCapita, _sim.GRPERCAP + additionalPerCapita, _sim.GRPERCAP];
		}
		else if (m == "pc")
		{
				var newGRPC = _sim.GRPERCAP + pcGovRev;
				var newGovRev = newGRPC / _sim.GRPERCAP - 1;
				var newAbsRev = (_sim.GRPERCAP * (newGovRev)) * _pop["Population, total"];
				return [newGovRev, newAbsRev, pcGovRev, newGRPC, _sim.GRPERCAP];
		}
		else if (m == "newgrpc")
		{
				var newGRPC = enteredGrpc > _sim.GRPERCAP ? enteredGrpc : _sim.GRPERCAP;
				var newGovRev = newGRPC / _sim.GRPERCAP - 1;
				var newAbsRev = (_sim.GRPERCAP * (newGovRev)) * _pop.population;
				return [newGovRev, newAbsRev, newGRPC - _sim.GRPERCAP, newGRPC, _sim.GRPERCAP];
		}
		else
		{
				var newGRPC = _sim.GRPERCAP + absGovRev / _pop["Population, total"];
				var newGovRev = newGRPC / _sim.GRPERCAP - 1;
				var additionalPerCapita = absGovRev / _pop["Population, total"];
				return [newGovRev, absGovRev, additionalPerCapita, newGRPC, _sim.GRPERCAP];
		}
}