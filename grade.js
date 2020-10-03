var subheight = 100;
var legendCells = 10;
var transitionTime = 500;
var countryByIdSimulations = d3.map();
var countryByIdPopulation = d3.map();
var legendLinear;

var govRevenue = 0;
var enteredGrpc = 0;
var absGovRev = 0;
var absGovRevSlider = 0;
var pcGovRev = 0;
var year = 2016;
var country = "$-ALL";
var method = "newgrpc"
var prefix = "U";

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

console.log(coeffs);

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
var outcome = "SANITSAFE";

const cLIC  = 1;
const cLMIC  = 2;
const cUMIC  = 3;               
const cHIC  = 4;
		
function getRevenue(d, m)
{
		if (m == "percentage")
		{
				var newAbsRev = (d.govRevCap * (govRevenue)) * d.population;
				var additionalPerCapita = d.govRevCap * govRevenue;
				return [govRevenue, newAbsRev, additionalPerCapita, d.govRevCap + additionalPerCapita];
		}
		else if (m == "pc")
		{
				var newGRPC = d.govRevCap + pcGovRev;
				var newGovRev = newGRPC / d.govRevCap - 1;
				var newAbsRev = (d.govRevCap * (newGovRev)) * d.population;
				return [newGovRev, newAbsRev, pcGovRev, newGRPC];
		}
		else if (m == "newgrpc")
		{
				var newGRPC = enteredGrpc > d.govRevCap ? enteredGrpc : d.govRevCap;
				var newGovRev = newGRPC / d.govRevCap - 1;
				var newAbsRev = (d.govRevCap * (newGovRev)) * d.population;
				return [newGovRev, newAbsRev, newGRPC - d.govRevCap, newGRPC];
		}
		else
		{
				var newGRPC = d.govRevCap + absGovRev / d.population;
				var newGovRev = newGRPC / d.govRevCap - 1;
				var additionalPerCapita = absGovRev / d.population;
				return [newGovRev, absGovRev, additionalPerCapita, newGRPC];
		}
}


function computeResult(d, _outcome)
{
	
		var computedRevenue = getRevenue(d, method);
		var grpc = computedRevenue[3];
		
		//console.log(d, _outcome);
		
		return [d[_outcome]]
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


function getColor(d) {
		var dataRowSimulations = countryByIdSimulations.get(d.id + year);
		if (dataRowSimulations) {
				var results = computeResult(dataRowSimulations, outcome);
				if (country == "$-ALL" || country == d.id       
				|| country == "$-LIC"   && dataRowSimulations.income == cLIC 
				|| country == "$-LMIC" && dataRowSimulations.income == cLMIC
				|| country == "$-UMIC" && dataRowSimulations.income == cUMIC
				|| country == "$-HIC"   && dataRowSimulations.income == cHIC)
						return colorScale(results[0]);
				else
						return "rgba(0, 0, 0, 0.3)";
		} else {
				return "rgba(0, 0, 0, 0.7)";
		}
}

function makeText(dataRowSimulations)
{
	var result = computeResult(dataRowSimulations, outcome);
	/*var revenues = getRevenue(dataRowSimulations, method);
	var newGovRev = 100 * revenues[0];
	var newGovAbsRev = revenues[1] / getPrefixValue(prefix);
	var newAdditionalPCGovRev = revenues[2];
	var livesSaved = result[1];
	var costs = computeCostPerLife(dataRowSimulations, outcome, newAdditionalPCGovRev, livesSaved);
	var countryname = dataRowSimulations.hasOwnProperty("COUNTRY") ? dataRowSimulations.COUNTRY : dataRowSimulations.name;
	var text = "<h1 class='tooltip'> " + countryname + "<\/h2 class='tooltip'><br/>";
	var delta = result[0] - result[2];
	text = text
	+ "<strong> Year: <span class = 'ar'>" + year + "<\/span><br/>"
	+ "<strong> Population: <span class = 'ar'>" + d3.format(",")(dataRowSimulations.population) + "<\/span><br/>"
	+ "<h2 class='tooltip'> Revenue <\/h2><\/br>"
	+ "<strong>" + "Original GrPC"
	+ "<\/strong>" + ": <span class='ar'>$" + d3.format(",")(dataRowSimulations.govRevCap.toFixed(0)) + "<\/span><br/>"
	+ "<strong>" +  "Percentage GrPC increase"
	+ "<\/strong>" + ": <span class='ar'>" + newGovRev.toFixed(2) + "%<\/span><br/>"
	+ "<strong>" +  "Absolute extra revenue" 
	+ "<\/strong>" + ": <span class='ar'>$" + d3.format(",")(newGovAbsRev.toFixed(2)) + getPrefix(prefix) + "<\/span><br/>"
	+ "<strong>" +  "Extra revenue per capita" 
	+ "<\/strong>" + ": <span class='ar'>$" + d3.format(",")(newAdditionalPCGovRev.toFixed(0)) + "<\/span><br/>"
	+ "<h2 class='tooltip'>" + outcomesMap.get(outcome).name + " <\/h2><\/br>"
	+ "<strong> Original " + outcomesMap.get(outcome).name 
	+ "<\/strong>" + ": <span class='ar'>" + result[2].toFixed(2) + "<\/span><br/>";
	text = text     + "<strong> Improved " + outcomesMap.get(outcome).name 
	+ "<\/strong>" + ": <span class='ar'>" + result[0].toFixed(2) + "<\/span><br/>"
	text = text     + "<strong> Improvement in " + outcomesMap.get(outcome).name 
	+ "<\/strong>" + ": <span class='ar'>" + delta.toFixed(2) + "<\/span><br/>" 
	+ "<strong>" +  " lives saved" 
	+ "<\/strong>" + ":<span class='ar'> " + result[1].toFixed(1) + "<\/span><br/>"
	+ "<h2 class='tooltip'> Cost per life saved <\/h2><\/br>"
	//+ "<strong>" +  "Per-capita cost of single life"
	//+ "<\/strong>" + ": <span class='ar'>$" + costs[0].toFixed(2) + "<\/span><br/>"
	+ "<strong>" +  "Absolute cost of single life" 
	+ "<\/strong>" + ": <span class='ar'>$" + d3.format(",")((costs[1] / getPrefixValue(prefix)).toFixed(2)) + getPrefix(prefix) + "<\/span><br/>"
	//+ "<strong>" +  "Increase in GRpC" 
	//+ "<\/strong>" + ": <span class='ar'>" + costs[2].toFixed(2) + "%<\/span><br/>";
	*/
	return result[0];	
}

function getPrefix(p)
{
	if (p == "U")
		return "";
	else
		return p;
}

function getPrefixValue(p)
{
	if (p == "B")
		return 1000000000;
	else if (p == "M")
		return 1000000;
	else 
		return 1;
}

function getText(d) {
		if (d.id[0] == "$")
		{
				return "";
		}
		var dataRowSimulations = countryByIdSimulations.get(d.id + year);
		if (dataRowSimulations) {
			return makeText(dataRowSimulations);
		} else {
				if (d.hasOwnProperty("properties"))
						return "<strong>" + d.properties.name + "<\/strong>" + ": No data";
				else
						return "<strong>No data<\/strong>";
		}
}

function setupMenus(countries, outcomes)
{
	function initMenus(countries, outcomes)
	{
			countries.sort(function(a,b)
			{
					 if (a.properties.name < b.properties.name) //sort string ascending
							return -1;
					if (a.properties.name > b.properties.name)
							return 1;
					return 0; //default return value (no sorting)
			});
			
			// add some "special" countries representing aggregate options.
			countries.unshift({
					id: "$-HIC", 
					properties : {name : "High-income countries"}});
			countries.unshift({
					id: "$-UMIC", 
					properties : {name : "Upper-middle-income countries"}});
			countries.unshift({
					id: "$-LMIC", 
					properties : {name : "Lower-middle-income countries"}});
			countries.unshift({
					id: "$-LIC", 
					properties : {name : "Low-income countries"}});
			countries.unshift({
					id: "$-ALL", 
					properties : {name : "Show all countries"}});

			 d3.select('#countrylist')
			.on('change', function(d) {
					country = this.options[this.selectedIndex].value;
					mainUpdate();
			})
			.selectAll('option')
			.data(countries)
			.enter()
			.append('option')
			.attr('value', function(d) {return d.id;})
			.text(function(d) {return d.properties.name;}); 
			
			d3.select("#outcomes")
			.selectAll("option")
			.data(outcomes)
			.enter()
			.append("option")
			.attr('value', function(d) {return d[0];})
			.text(function(d) {return d[1].name;}); 
			
			d3.select("#methodlist")
			.on("change", function(d) {
					method = this.options[this.selectedIndex].value;
					if (method == "percentage")
					{
							d3.select("#revDiv")
							.style("display", "block")
							d3.select("#absRevDiv")
							.style("display", "none")
							d3.select("#pcRevDiv")
							.style("display", "none")
							d3.select("#prefix")
							.style("display", "none")
							d3.select("#grpcdiv")
							.style("display", "none")
					}
					else if (method == "pc")
					{
							d3.select("#revDiv")
							.style("display", "none")
							d3.select("#absRevDiv")
							.style("display", "none")
							d3.select("#pcRevDiv")
							.style("display", "block")
							d3.select("#prefix")
							.style("display", "none")
							d3.select("#grpcdiv")
							.style("display", "none")
					}
					else if (method == "newgrpc")
					{
							d3.select("#revDiv")
							.style("display", "none")
							d3.select("#absRevDiv")
							.style("display", "none")
							d3.select("#pcRevDiv")
							.style("display", "none")
							d3.select("#prefix")
							.style("display", "none")
							d3.select("#grpcdiv")
							.style("display", "block")
					}
					else
					{
							d3.select("#revDiv")
							.style("display", "none")
							d3.select("#absRevDiv")
							.style("display", "block")
							d3.select("#pcRevDiv")
							.style("display", "none")
							d3.select("#prefix")
							.style("display", "block")
							d3.select("#grpcdiv")
							.style("display", "none")
					}										
					mainUpdate();
			})
			
			d3.select("#prefix")
			.on("change", function(d)
			{
				prefix = this.options[this.selectedIndex].value;
				var sliderVar = document.getElementById('#absRevSlider');
				var prefixValue = getPrefixValue(prefix);
				absGovRev = absGovRevSlider * prefixValue;
				d3.select("#absRevenueVal").text("$" + Math.round(absGovRev / prefixValue) + getPrefix(prefix));
				mainUpdate();
			}
			)
	}

initMenus(countries, outcomes);
d3.select("#revenueVal").text(govRevenue);
d3.select("#yearVal").text(year);


d3.select("#revSlider").on("input", function(d){
		govRevenue = this.value / 100.0;
		d3.select("#revenueVal").text(Math.round(govRevenue * 100) + " %");
		mainUpdate();
});

d3.select("#absRevSlider").on("input", function(d){
		absGovRevSlider = this.value;
		absGovRev = absGovRevSlider * getPrefixValue(prefix);
		d3.select("#absRevenueVal").text("$" + Math.round(absGovRev / getPrefixValue(prefix)) + prefix);
		mainUpdate();
});

d3.select("#pcRevSlider").on("input", function(d){
		pcGovRev = this.value * 1;
		d3.select("#perCapitaRevenueVal").text("$" + Math.round(pcGovRev));
		mainUpdate();
});
d3.select("#grpcSlider").on("input", function(d){
		enteredGrpc = this.value * 1;
		d3.select("#grpcVal").text("$" + enteredGrpc);
		mainUpdate();
});


d3.select("#yearSlider").on("input", function(d){
		year = this.value;
		d3.select("#yearVal").text(year);
		mainUpdate();
});

d3.selectAll("#outcomes").on("change", function(d){
		outcome = this.options[this.selectedIndex].value
		updateLegend();
		mainUpdate();
});

d3.selectAll(".colourscheme").on("input", function(d){
		ccolor = this.value;
		//updateLegend();
		mainUpdate();
});
}

function colourCountries()
{
		   svg.selectAll('path.countries').transition()  
		  .duration(transitionTime)  
		  .attr('fill', function(d) {
				return getColor(d);
		  })
}

function updateCountries()
{
		var d = {"id" : country};
		var text = getText(d);
		d3.select("#countrytext").
		html(text);
		d3.select("#countrydata")
		.style("display", text.length > 0 ? "block" : "none");
		colourCountries();
}

function updateLegend()
{
		var theOutcome = outcomesMap.get(outcome)
		var domain = theOutcome.hasOwnProperty("fixedExtent") ? theOutcome.fixedExtent : theOutcome.extent;
		colorScale.range([theOutcome.loCol, theOutcome.hiCol])
		.domain(domain);
		legendLinear.scale(colorScale);
		
		svg2.select(".legendLinear").remove();
		
		svg2.append("g")
		.attr("class", "legendLinear")
		.attr("transform", "translate(0,20)");
		
		svg2.select(".legendLinear")
		.call(legendLinear);
		
		svg2.select("text")
		.text(theOutcome.desc);
}

function loaded(error, countries, populationsData, simulationsData) {
	
		//console.log(countryByIdPopulation)
		//console.log(countryByIdSimulations)

		outcomesMap.forEach(function(v, k){
				outcomesMap.get(k).extent = d3.extent(simulationsData, function(d) {
				return parseFloat(d[k]);
				});
		})
		
		colorScale.domain(d3.extent(simulationsData, function(d) {
		return parseFloat(d[outcome]);
		}));
		
		var countries = topojson.feature(countries, countries.objects.units).features;

		svg.selectAll('path.countries')
				.data(countries)
				.enter()
				.append('path')
				.attr('class', 'countries')
				.attr('d', path)
				.attr('fill', function(d,i) {
						return getColor(d);
				})
				.call(d3.helper.tooltip(
						function(d, i){
								return getText(d);
						})); // tooltip based on an example from Roger Veciana: http://bl.ocks.org/rveciana/5181105    

		svg2.append("g")
		  .attr("class", "legendLinear")
		  .attr("transform", "translate(0,20)");

		legendLinear = d3.legend.color()
		  .shapeWidth(75)
		  .orient('horizontal')
		  .scale(colorScale)
		  .cells(legendCells);

		svg2.select(".legendLinear")
		  .call(legendLinear);
		  
		svg2.append("text")
				.attr("x", 0)             
				.attr("y", 15)
				.text(outcomesMap.get(outcome).desc);
		  
		d3.select("#revSlider").on("change", function(d){
		  govRevenue = this.value / 100.0;
		}); 
		d3.select("#absRevSlider").on("change", function(){
		  absGovRevSlider = this.value;
		  absGovRev = absGovRevSlider * getPrefixValue(prefix);
		})
		d3.select("#pcRevSlider").on("change", function(){
		  pcGovRev = this.value * 1;
		});
		d3.select("#grpcSlider").on("change", function(){
		  enteredGrpc = this.value * 1;
		});
		
setupMenus(countries, outcomesList);

}