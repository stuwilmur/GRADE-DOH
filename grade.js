//!! TODO
// make first and last years dynamic in slider
// decouple model from global variables
// relative sizing
// move special country options to html
// outcomes objects including functions

var subheight = 100;
var legendCells = 10;
var transitionTime = 500;
var legendLinear;
var countrycodes = new Map();

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
var plottype = "population";
var outcome = "SANITBASIC";
var govtype = "GOVEFFECT";

var plotlayout = {
    showlegend: true,
	legend: {"orientation": "h"},
    yaxis: {hoverformat: ',f0', tickformat : ',f0'},
    xaxis: {tickformat: 'd'}
};

var popdata = new PopData();

function getColor(_cid, _year, _method) {
    var value = getResult(_cid, _year, _method);
    var incomeLevel = popdata.getvalue(_cid, _year, "incomelevel");
    
    if (!isNaN(value)) {
        if (country == "$-ALL" //|| country == _cid
            ||
            country.slice(0, 1) != "$" ||
            country == "$-LIC" && incomelevel == "LIC" ||
            country == "$-LMIC" && incomelevel == "LMC" ||
            country == "$-UMIC" && incomelevel == "UMC" ||
            country == "$-HIC" && incomelevel == "HIC") {
            return colorScale(value);
        } else
            return "rgba(0, 0, 0, 0.3)";
    } else {
        return "rgba(0, 0, 0, 0.6)";
    }
}

function makeText(_iso, _year) {
    var revenues = getRevenue(_iso, _year, method);
    if (revenues === undefined)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No data";
    }
    var result = computeResult(_iso, _year, outcome, revenues["new grpc"], revenues["historical grpc"], governance);
    if (result === undefined)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No data";
    }
    var text = "";
    text = text + "<h1 class='tooltip'> " +  countrycodes.get(_iso) + "</h1>" +
        "<br/><strong>" + year + "</strong>" +
        "<br/>Current Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["historical grpc"].toFixed(2)) + "</span>" +
        "<br/>New Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["new grpc"].toFixed(2)) + "</span>" +
        "<br/>Increase in Gov. rev. per capita: <span class = 'ar'>" + (revenues["percentage increase"] * 100).toFixed(2) + "%</span>" +
        "<br/><br/><strong>" + outcomesMap.get(outcome).name + "</strong><br/>" +
        "Current % coverage: <span class = 'ar'>" + result.original.toFixed(2) + "</span>" +
        "<br/>New % coverage: <span class = 'ar'>" + result.improved.toFixed(2) + "</span>";

    if (result.hasOwnProperty("additional")) {
        for (const [key, value] of Object.entries(result.additional)) {
            text = text + "<br/>" + key + ":&nbsp&nbsp<span class = 'arb'>" + d3.format(",")(value.toFixed(0)) + "</span>";
        }
    }

    var govtext = "";
    result.gov.forEach(function (result, govmeasure) {
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

    if (true) {
        return makeText(d.id, year);
    } else {
        
    }
}

function getResult(_cid, _year, _method) {
        var revenues = getRevenue(_cid, _year, _method);
        if (revenues === undefined)
            {return NaN;}
        var result = computeResult(_cid, _year, outcome,
            revenues["new grpc"], revenues["historical grpc"], governance);
        if (result === undefined)
            {return NaN;}
        return result.improved;
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

        // make sure selection matches initial value
        d3.select('#outcomes').property('value', outcome);

        // individual governance sliders
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
        
        d3.select("#plottype")
        .on("change", function(d){
            plottype = this.options[this.selectedIndex].value;
            updateplot();
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
        d3.select("#absRevenueVal").text("$" + d3.format(",")(Math.round(absGovRev / getPrefixValue(prefix))) + getPrefix(prefix));
        mainUpdate();
    });

    d3.select("#pcRevSlider").on("input", function (d) {
        pcGovRev = this.value * 1;
        d3.select("#perCapitaRevenueVal").text("$" + d3.format(",")(Math.round(pcGovRev)));
        mainUpdate();
    });
    d3.select("#grpcSlider").on("input", function (d) {
        enteredGrpc = this.value * 1;
        d3.select("#grpcVal").text("$" + d3.format(",")(enteredGrpc));
        mainUpdate();
    });

    d3.select("#govSlider").on("input", function (d) {
        governance = Math.round((this.value / 200.0 * 2.0 - 1) * 100) / 100;
        d3.select("#govVal").text((governance <= 0 ? "" : "+") + governance);
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
        .style("display", text.length > 0 ? "inline-block" : "none");
    colourCountries();
    updateplot();
}

function getplotdata(_firstyear, _country, _outcome) {
    // Takes a baseline year an increase in revenue, and calculates the corresponding % increase in grpc:
    // projects this by: allowing five years for increased revenue to act, where there is no effect;
    // applying the percentage increase for all remaining years. 
    var ret = {data: [], error: null};
    var grpcPcIncrease = 0;
    for (y = _firstyear; y < popdata.lastyear && ((y - _firstyear) < 10); y++) {
        var revenues = getRevenue(_country, y, method);
        if (revenues === undefined){
            ret.error = "GRPC not available for " + y;
            return ret;
        }
        if (y == _firstyear) {
            grpcPcIncrease = revenues["percentage increase"];
            grpc = revenues["historical grpc"];
        } else if ((y - _firstyear) < 5) {
            grpc = revenues["historical grpc"];
        } else {
            grpc = revenues["historical grpc"] * (1 + grpcPcIncrease);
        }

        var computed = computeResult(_country, y, _outcome, grpc, revenues["historical grpc"], governance);
        if (computed === undefined) {
            var outcome_name = (outcomesMap.get(outcome)).name;
            ret.error = outcome_name + " not available for " + y
            return ret;
            }
        
        ret.data.push({
            "year": +y,
            "improved": computed.additional
        });  
    }
    
    ret.start_of_effect = Math.min(popdata.lastyear, _firstyear + 4);
    return (ret);
}

function updateplot() {
    if (country.slice(0, 2) == "$-") {
        d3.select("#plotwrapper").style("display", "none");
    } else {
        var plotdata = getplotdata(+year, country, outcome);
        
        if (plotdata.error){
            d3.select("#plotwrapper").style("display", "none");
            d3.select("#ploterrortext").html(plotdata.error);
            d3.select("#ploterror").style("display", "inline-block");
            return;
        }
        
        var data = plotdata.data;
        console.log(data);
        var x_annotation = plotdata.start_of_effect;
        console.log(plotdata.start_of_effect)

        d3.select("#plotwrapper").style("display", "inline-block");
        d3.select("#ploterror").style("display", "none");
       
        var plotdata = [];
        
        for (const prop in data[0].improved){
            var outcomedata = {
                x: data.map(a => a.year),
                y: data.map(a => a.improved[prop]),
                type: "scatter",
                name: prop
            };
            plotdata.push(outcomedata);
        }
        
        var y_var_max = Math.max(plotdata.map(d => Math.max(d.y)));
        
        var theOutcome = outcomesMap.get(outcome);
        plotlayout.title = "Projection for " + countrycodes.get(country) + ": " + theOutcome.name;
        plotlayout.annotations = [{
                x: x_annotation,
                y: 0,
                xref: 'x',
                yref: 'y',
                text: 'Start of effect',
                showarrow: true,
                arrowhead: 20,
                ax: 0,
                ay: -50
            }
          ]
        
        console.log(y_var_max);
        if (y_var_max < 1E-6){
            plotlayout.yaxis.range = [-1,1];
        }

        Plotly.newPlot('plot', plotdata, plotlayout);
    }
}

function getplotcsvdata(_year, _country, _outcome)
{
    var plotdata = getplotdata(_year, _country, _outcome);
    
    if (plotdata.error){
        return undefined;
    }
    
    var data = plotdata.data;
    
    var header = "country,iso,year";
    for (const property in data[0].improved){
        header += "," + property;
    }
    
    header += "\n";
    
    var body = "";
    data.forEach(function(datarow){
        var row = "";
        body += countrycodes.get(_country) + "," + _country + "," + datarow.year + ","
        for (const property in datarow.improved){
            body += datarow.improved[property] + ",";
        }
        body += row + "\n";
    })
    return header + body;
}

function download_csv() {
    var csvdata = getplotcsvdata(year, country, outcome);
    var button_title = country+"_"+year + ".csv";
    if (csvdata === undefined){
        return undefined;
    }
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvdata);
    hiddenElement.target = '_blank';
    hiddenElement.download = button_title;
    hiddenElement.click();
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

function loaded(error, countries, _popdata) {
    /*
    // used to handle non-fixed variable extents - to be updated if required
    outcomesMap.forEach(function (v, k) {
        outcomesMap.get(k).extent = d3.extent(simulationsData, function (d) {
            return parseFloat(d[k]);
        });
    })

    colorScale.domain(d3.extent(simulationsData, function (d) {
        return parseFloat(d[outcome]);
    }));
    */
    
    popdata.nestdata(_popdata);
    
    var theOutcome = outcomesMap.get(outcome)
    colorScale.domain(theOutcome.hasOwnProperty("fixedExtent") ? theOutcome.fixedExtent : theOutcome.extent);

    var countries = topojson.feature(countries, countries.objects.units).features;
    countries.forEach(function(d) {countrycodes.set(d.id, d.properties.name)})

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
    spinner.stop();

}
