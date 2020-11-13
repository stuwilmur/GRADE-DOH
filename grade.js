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
var governance = 0;
var country = "$-ALL";
var method = "newgrpc";
var prefix = "U";

var outcome = "SANITBASIC";
var govtype = "GOVEFFECT";

const cLIC = 1;
const cLMIC = 2;
const cUMIC = 3;
const cHIC = 4;

function getColor(_cid, _year, _method) {
    var value = getResult(_cid, _year, _method);
    var dataRowPopulations = countryByIdPopulation.get(_cid + _year);
    if (!isNaN(value)) {
        if (country == "$-ALL" //|| country == _cid
            ||
            country.slice(0, 1) != "$" ||
            country == "$-LIC" && dataRowPopulations.incomelevel == "LIC" ||
            country == "$-LMIC" && dataRowPopulations.incomelevel == "LMC" ||
            country == "$-UMIC" && dataRowPopulations.incomelevel == "UMC" ||
            country == "$-HIC" && dataRowPopulations.incomelevel == "HIC") {
            return colorScale(value);
        } else
            return "rgba(0, 0, 0, 0.3)";
    } else {
        return "rgba(0, 0, 0, 0.6)";
    }
}

function makeText(dataRowSimulations, dataRowPopulations) {
    var revenues = getRevenue(dataRowSimulations, dataRowPopulations, method);
    var result = computeResult(dataRowSimulations, dataRowPopulations, outcome, revenues["new grpc"], revenues["historical grpc"], governance);
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
    var text = "";
    text = text + "<h1 class='tooltip'> " + dataRowPopulations.countryname + "</h1>" +
        "<br/><strong>" + year + "</strong>" +
        "<br/>Current Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["historical grpc"].toFixed(2)) + "</span>" +
        "<br/>New Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["new grpc"].toFixed(2)) + "</span>" +
        "<br/><br/><strong>" + outcomesMap.get(outcome).name + "</strong><br/>" +
        "Current % coverage: <span class = 'ar'>" + result.original.toFixed(3) + "</span>"
        //+ "<br/>fitted: <span class = 'ar'>" 	+ result.original.toFixed(3) + "</span>" 
        +
        "<br/>New % coverage: <span class = 'ar'>" + result.improved.toFixed(3) + "</span>";

    if (result.hasOwnProperty("additional")) {
        for (const [key, value] of Object.entries(result.additional)) {
            text = text + "<br/>" + key + ":&nbsp&nbsp<span class = 'arb'>" + d3.format(",")(value.toFixed(0)) + "</span>";
        }
    }
    
    var govtext = "";
    result.gov.forEach(function(result, govmeasure){
        govtext = govtext + result.desc + ": <span class = 'ar'>" + result.value.toFixed(2) + "</span><br/>"
    })
    
    text = text + "<br/><br/><strong>Governance</strong><br/>" + govtext;
    
    return text;
}

function getPrefix(p) {
    if (p == "U")
        return "";
    else
        return p;
}

function getPrefixValue(p) {
    if (p == "B")
        return 1E9;
    else if (p == "M")
        return 1E6;
    else
        return 1;
}

function getText(d) {
    if (d.id[0] == "$") {
        return "";
    }
    var dataRowSimulations = countryByIdSimulations.get(d.id + year);
    var dataRowPopulations = countryByIdPopulation.get(d.id + year);
    if (dataRowSimulations && dataRowPopulations) {
        return makeText(dataRowSimulations, dataRowPopulations);
    } else {
        if (d.hasOwnProperty("properties"))
            return "<strong>" + d.properties.name + "<\/strong>" + ": No data";
        else
            return "<strong>No data<\/strong>";
    }
}

function getResult(_cid, _year, _method) {
    var dataRowSimulations = countryByIdSimulations.get(_cid + _year);
    var dataRowPopulations = countryByIdPopulation.get(_cid + _year);
    if (dataRowSimulations && dataRowPopulations) {
        var revenues = getRevenue(dataRowSimulations, dataRowPopulations, _method);
        var result = computeResult(dataRowSimulations, dataRowPopulations, outcome,
            revenues["new grpc"], revenues["historical grpc"], governance);
        return result.improved;
    } else {
        return NaN;
    }
}

function setupMenus(countries, outcomes) {
    function initMenus(countries, outcomes) {
        countries.sort(function (a, b) {
            if (a.properties.name < b.properties.name) //sort string ascending
                return -1;
            if (a.properties.name > b.properties.name)
                return 1;
            return 0; //default return value (no sorting)
        });

        // add some "special" countries representing aggregate options.
        countries.unshift({
            id: "$-HIC",
            properties: {
                name: "High-income countries"
            }
        });
        countries.unshift({
            id: "$-UMIC",
            properties: {
                name: "Upper-middle-income countries"
            }
        });
        countries.unshift({
            id: "$-LMIC",
            properties: {
                name: "Lower-middle-income countries"
            }
        });
        countries.unshift({
            id: "$-LIC",
            properties: {
                name: "Low-income countries"
            }
        });
        countries.unshift({
            id: "$-ALL",
            properties: {
                name: "Show all countries"
            }
        });

        d3.select('#countrylist')
            .on('change', function (d) {
                country = this.options[this.selectedIndex].value;
                mainUpdate();
                focusCountry();
            })
            .selectAll('option')
            .data(countries)
            .enter()
            .append('option')
            .attr('value', function (d) {
                return d.id;
            })
            .text(function (d) {
                return d.properties.name;
            });

        d3.select("#outcomes")
            .selectAll("option")
            .data(outcomes)
            .enter()
            .append("option")
            .attr('value', function (d) {
                return d[0];
            })
            .text(function (d) {
                return d[1].name;
            });

        /*
        d3.select("#govList")
        .selectAll("option")
        .data(govMeasures)
        .enter()
        .append("option")
        .attr('value', function(d){return d.name})
        .text(function(d){return d.desc;})
        */

        d3.select("#methodlist")
            .on("change", function (d) {
                method = this.options[this.selectedIndex].value;
                if (method == "percentage") {
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
                } else if (method == "pc") {
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
                } else if (method == "newgrpc") {
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
                } else {
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
            .on("change", function (d) {
                prefix = this.options[this.selectedIndex].value;
                var sliderVar = document.getElementById('#absRevSlider');
                var prefixValue = getPrefixValue(prefix);
                absGovRev = absGovRevSlider * prefixValue;
                d3.select("#absRevenueVal").text("$" + Math.round(absGovRev / prefixValue) + getPrefix(prefix));
                mainUpdate();
            })
    }

    initMenus(countries, outcomes);
    d3.select("#revenueVal").text(govRevenue);
    d3.select("#yearVal").text(year);


    d3.select("#revSlider").on("input", function (d) {
        govRevenue = this.value / 100.0;
        d3.select("#revenueVal").text(Math.round(govRevenue * 100) + " %");
        mainUpdate();
    });

    d3.select("#absRevSlider").on("input", function (d) {
        absGovRevSlider = this.value;
        absGovRev = absGovRevSlider * getPrefixValue(prefix);
        d3.select("#absRevenueVal").text("$" + Math.round(absGovRev / getPrefixValue(prefix)) + prefix);
        mainUpdate();
    });

    d3.select("#pcRevSlider").on("input", function (d) {
        pcGovRev = this.value * 1;
        d3.select("#perCapitaRevenueVal").text("$" + Math.round(pcGovRev));
        mainUpdate();
    });
    d3.select("#grpcSlider").on("input", function (d) {
        enteredGrpc = this.value * 1;
        d3.select("#grpcVal").text("$" + enteredGrpc);
        mainUpdate();
    });

    d3.select("#govSlider").on("input", function (d) {
        governance = Math.round((this.value / 200.0 * 2.0 - 1) * 100) / 100 ;
        d3.select("#govVal").text((governance<=0?"":"+") + governance);
        mainUpdate();
    });


    d3.select("#yearSlider").on("input", function (d) {
        year = this.value;
        d3.select("#yearVal").text(year);
        mainUpdate();
    });

    d3.selectAll("#outcomes").on("change", function (d) {
        outcome = this.options[this.selectedIndex].value
        updateLegend();
        mainUpdate();
    });

    /*
    d3.selectAll("#govList").on("change", function(d){
            govtype = this.value;
            console.log(govtype);
            mainUpdate();
    })
    */

    d3.selectAll(".colourscheme").on("input", function (d) {
        ccolor = this.value;
        //updateLegend();
        mainUpdate();
    });
}

function colourCountries() {
    svg.selectAll('path.countries').transition()
        .duration(transitionTime)
        .attr('fill', function (d) {
            return getColor(d.id, year, method);
        })
}

function updateCountries() {
    var d = {
        "id": country
    };
    var text = getText(d);
    d3.select("#countrytext").
    html(text);
    d3.select("#countrydata")
        .style("display", text.length > 0 ? "block" : "none");
    colourCountries();
}

function updateLegend() {
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
    outcomesMap.forEach(function (v, k) {
        outcomesMap.get(k).extent = d3.extent(simulationsData, function (d) {
            return parseFloat(d[k]);
        });
    })

    colorScale.domain(d3.extent(simulationsData, function (d) {
        return parseFloat(d[outcome]);
    }));

    var countries = topojson.feature(countries, countries.objects.units).features;

    svg.selectAll('path.countries')
        .data(countries)
        .enter()
        .append('path')
        .attr('class', 'countries')
        .attr('d', path)
        .on("click", clicked)
        .attr('fill', function (d, i) {
            return getColor(d.id, year, method);
        })
        .call(d3.helper.tooltip(
            function (d, i) {
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

    d3.select("#revSlider").on("change", function (d) {
        govRevenue = this.value / 100.0;
    });
    d3.select("#absRevSlider").on("change", function () {
        absGovRevSlider = this.value;
        absGovRev = absGovRevSlider * getPrefixValue(prefix);
    })
    d3.select("#pcRevSlider").on("change", function () {
        pcGovRev = this.value * 1;
    });
    d3.select("#grpcSlider").on("change", function () {
        enteredGrpc = this.value * 1;
    });

    setupMenus(countries, outcomesList);

}
