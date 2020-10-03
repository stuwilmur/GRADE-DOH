var subheight = 100;
var legendCells = 10;
var transitionTime = 500;
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

var outcome = "SANITBASIC";

const cLIC  = 1;
const cLMIC  = 2;
const cUMIC  = 3;               
const cHIC  = 4;
		



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

function makeText(dataRowSimulations, dataRowPopulations)
{
	var revenues = getRevenue(dataRowSimulations, dataRowPopulations, method);
	console.log(revenues);
	var result = computeResult(dataRowSimulations, outcome, revenues[3]);
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
	return "historical:" + result[0] + "<br/>fitted:\t" + result[1] + "<br/>improved:\t" + result[2];	
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
		var dataRowPopulations = countryByIdPopulation.get(d.id + year);
		console.log(dataRowPopulations, dataRowSimulations);
		if (dataRowSimulations && dataRowPopulations) {
			return makeText(dataRowSimulations, dataRowPopulations);
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