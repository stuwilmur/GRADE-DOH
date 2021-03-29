//!! TODO
// ensure initial options consistent (without resorting to on change)
// sort projection range size

var subheight = 100;
var legendCells = 10;
var transitionTime = 500;
var legendLinear;
var countrycodes = new Map();

// inputs / initial values
var govRevenue = 0;
var enteredGrpc = 0;
var absGovRev = 0;
var absGovRevSlider = 0;
var pcGovRev = 0;
var year = 2002;
var years_to_project = 10;
var governance = 0;
var target = 100;
var country = "$-ALL";
var method = "absolute";
var prefix = "M";
var plottype = "population";
var outcome = "SANITBASIC";
var govtype = "GOVEFFECT";
var multiplecountries = [];
var selections = new Map([
    [
        "$-ALL",
        {
        desc : "All countries",
        short_desc : "All",
        fn : (d) => true,
        }
    ],
    [
        "$-LIC",
        {
        desc : "Low-income countries",
        short_desc : "LICs",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "incomelevel") == "LIC",
        }],
    [
        "$-LMIC",
        {   
        desc : "Lower-middle-income countries",
        short_desc : "LMICs",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "incomelevel") == "LMC",
        }],
    [
        "$-UMIC",
        {   
        desc : "Upper-middle-income countries",
        short_desc : "UMICs",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "incomelevel") == "UMC",
        }],
    [
        "$-HIC",
        {
        desc : "High-income countries",
        short_desc : "HICs",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "incomelevel") == "HIC",
    }],
    [
        "$-REG-LCN",
        {
        desc : "Latin America and Caribbean",
        short_desc : "Latin America & Caribbean",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "LCN",
    }],
    [
        "$-REG-NAC",
        {
        desc : "North America",
        short_desc : "North America",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "NAC",
    }],
    [
        "$-REG-EAS",
        {
        desc : "East Asia and Pacific",
        short_desc : "East Asia and Pacific",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "EAS",
    }],
    [
        "$-REG-ECS",
        {
        desc : "Europe and Central Asia",
        short_desc : "Europe and Central Asia",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "ECS",
    }],
    [
        "$-REG-MEA",
        {
        desc : "Middle East and North Africa",
        short_desc : "Middle East and North Africa",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "MEA",
    }],
    [
        "$-REG-SSF",
        {
        desc : "Sub-Saharan Africa",
        short_desc : "Sub-Saharan Africa",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "SSF",
    }],
    [
        "$-REG-SAS",
        {
        desc : "South Asia",
        short_desc : "South Asia",
        fn : (_cid, _year) => popdata.getstring(_cid, _year, "region") == "SAS",
    }],
]);

var plotlayout = {
    showlegend: true,
	legend: {"orientation": "h"},
    yaxis: {hoverformat: ',f0', tickformat : ',f0'},
    xaxis: {tickformat: 'd'}
};

var popdata = new PopData();

function dataHasCountry(_cid){
    return (popdata.getrow(_cid, -1) !== undefined);
}

function getColor(_cid, _year, _method) {
    var value = getResult(_cid, _year, _method);
    var incomelevel = popdata.getstring(_cid, _year, "incomelevel");
    
    if (!isNaN(value)) {
        if (country.slice(0,1) == "$")
        {
            // use selector
            var selection = selections.get(country);
            if (selection === undefined){
                return  "rgba(0, 0, 0, 0.3)";
            }
            if (selection.fn(_cid, _year)){
                return colorScale(value);
            }
            else
            {
                return "rgba(0, 0, 0, 0.3)";
            }
        }
        else{
            return colorScale(value);
        }
    }
        else {
        return "rgba(0, 0, 0, 0.6)";
    }
}

function makeText2(_year, _iso, _outcome, _years_to_project)
{
    // accompanies makeText() (which does the instantaneous calculation)
    // as version that is specific to the projection.
    
    var end_year = getProjectionEnd(_year, _years_to_project)
    var projection = calcProjection(_year, _iso, _outcome, _years_to_project)
    var text = "";
    text = text 
        + "<h1 class='tooltip'> " +  countrycodes.get(_iso) + "</h1>"
        + "<br/><strong>Projection for " + year + " - " + end_year + "</strong>"
    
    
    if (projection.error){
        text = text 
        + "<br/> Projection unavailable: "
        + projection.error.join("<br>"); 
    }
    else{
        var revenues = getRevenue(_iso, _year, method);
        if (revenues === undefined)
        {
            // shouldn't happen as plotdata would give error
            text += "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No GRPC data available";
        }
        else{
            
            var theOutcome = outcomesMap.get(_outcome);
            var varText = theOutcome.isStockVar ? "Average" : "Cumulative";
            
            text = text 
            + "<br/><br/><strong>" + _year + "</strong>"
            + "<br/>Current Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["historical grpc"].toFixed(2)) + "</span>" 
            + "<br/>New Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["new grpc"].toFixed(2)) + "</span>"
            + "<br/>Increase in Gov. rev. per capita: <span class = 'ar'>" + (revenues["percentage increase"] * 100).toFixed(2) + "%</span>"
            + "<br><br>"
            + "<div class = 'cumulative'>"
            + "<strong>" + varText + " effect over the projected period:</strong>"
            
            projection.data.forEach(function(value, result){
              text += "<br/>" + result + ":<br/> <span class = 'ar'>" + d3.format(",")(value.toFixed(0)) + "</span>"; 
            })
            text += "</div>"
        }
}
    return text;
}

function makeText(_iso, _year) {
    var revenues = getRevenue(_iso, _year, method);
    if (revenues === undefined)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No GRPC data available";
    }
    var result = computeResult(_iso, _year, outcome, revenues["new grpc"], revenues["historical grpc"], governance);
    if (result.error)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": " + result.error.join("<br>");
    }
    var text = "";
    text = text + "<h1 class='tooltip'> " +  countrycodes.get(_iso) + "</h1>" +
    "<br/><strong>" + year + "</strong>" +
    "<br/>Current Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["historical grpc"].toFixed(2)) + "</span>" +
    "<br/>New Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["new grpc"].toFixed(2)) + "</span>" +
    "<br/>Increase in Gov. rev. per capita: <span class = 'ar'>" + (revenues["percentage increase"] * 100).toFixed(2) + "%</span>" 
    
    // 04/02/21 hide instantaenous effect values so as not to confuse with plot
    // 09/02/21 hide governance so we can use this more generally
    // 10/02/21 turn instantaneous effect back on
    
    +
    "<br/><br/><strong>" + outcomesMap.get(outcome).name + "</strong>" 
    +
    "<br/>(instantaneous effect)"
    +"<br/>Current % coverage: <span class = 'ar'>" + result.original.toFixed(2) + "</span>" +
    "<br/>New % coverage: <span class = 'ar'>" + result.improved.toFixed(2) + "</span>";

    if (result.hasOwnProperty("additional")) {
        result.additional.forEach(function(property) {
            text = text + "<br/>" + property.name + ":&nbsp&nbsp<span class = 'arb'>" + d3.format(",")(property.value.toFixed(0)) + "</span>";
        })
    }

    /*
    var govtext = "";
    result.gov.forEach(function (result, govmeasure) {
        govtext = govtext + result.desc + ": <span class = 'ar'>" + result.value.toFixed(2) + "</span><br/>"
    })

    text = text + "<br/><br/><strong>Governance</strong><br/>" + govtext;
    */

    return text;
}

function makeTextTarget(_year, _iso, _outcome, _target){
    if (_iso.slice(0,1) == "$")
    {
        return "No country selected";
    }
    var revenues = getRevenue(_iso, _year, method);
    if (revenues === undefined)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No GRPC data available";
    }
    var grpc_orig = revenues["historical grpc"];
    var result = computeTarget(_iso, _year, _outcome, _target, grpc_orig);
    if (result.error)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": " + result.error.join("<br>");
    }
    var grpc_add = result.grpc - grpc_orig;
    var grpc_inc = (result.grpc / grpc_orig - 1) * 100;
    // Handle apperance of negative zero
    grpc_inc = Math.max(grpc_inc, 0);
    var rev_add = revenues["historical total revenue"] * result.grpc / grpc_orig - revenues["historical total revenue"];
    var str =  
    "<strong>" + countrycodes.get(_iso) + "&nbsp;" + _year + "<\/strong><br/>"
    + "Absolute additional revenue:<span class = 'ar'>$" + d3.format(",")(rev_add.toFixed(0)) + "</span><br/>"
    + "Additional revenue per cap.:<span class = 'ar'>$" + d3.format(",")(grpc_add.toFixed(2)) + "</span><br/>"
    + "Increase as % of gov. rev. per cap.:<span class = 'ar'>" + grpc_inc.toFixed(2) + "%</span><br/>"

    if (result.hasOwnProperty("additional")) {
        result.additional.forEach(function(property) {
            str = str + "<br/>" + property.name + ":&nbsp&nbsp<span class = 'arb'>" + d3.format(",")(property.value.toFixed(0)) + "</span>";
        })
    }

    return str;
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

function getText(d, _bProjection = false) {
    if (d.id.slice(0, 2) == "$-") {
        return "";
    }

    if (_bProjection) {
        return makeText2(+year, d.id, outcome, +years_to_project);
    } else {
        return makeText(d.id, year)
    }
}

function getResult(_cid, _year, _method) {
        var revenues = getRevenue(_cid, _year, _method);
        if (revenues === undefined)
            {return NaN;}
        var result = computeResult(_cid, _year, outcome,
            revenues["new grpc"], revenues["historical grpc"], governance);
        if (result.error)
            {return NaN;}
        return result.improved;
}

function setupMenus(countries, outcomes) {
    function initMenus(countries, outcomes) {
        countries.sort(function (a, b) {
            if (a.name < b.name) //sort string ascending
                return -1;
            if (a.name > b.name)
                return 1;
            return 0; //default return value (no sorting)
        });

        // add selections to country list (just for the menus)
        var selection_countries = [];
        selections.forEach(function(selection, id) {selection_countries.push({id : id, name : selection.desc})});
        countries = selection_countries.concat(countries);

        d3.select('#countrylist')
            .on('change', function (d) {
                country = this.options[this.selectedIndex].value;
                set_outcome_target();
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
                return d.name;
            });

            d3.select('#multicountrylist')
            .on('change', function (d) {
                if (!(multiplecountries.includes(this.options[this.selectedIndex].value))){
                    multiplecountries.push(this.options[this.selectedIndex].value);
                    updateCountryFilters();
                }
            })
            .selectAll('option')
            .data(countries)
            .enter()
            .append('option')
            .attr('value', function (d) {
                return d.id;
            })
            .text(function (d) {
                return d.name;
            });

        var outcomes_options = d3.select("#outcomes")
            .selectAll("option")
            .data(outcomes)

            outcomes_options.enter()
            .append("option")
            .attr('value', function (d) {
                return d[0];
            })
            .text(function (d) {
                return d[1].name;
            })

            outcomes_options
            .attr('value', function (d) {
                return d[0];
            })
            .text(function (d) {
                return d[1].name;
            })


        // make sure all selections match initial values
        d3.select('#countrylist').property('value', country);
        d3.select('#outcomes').property('value', outcome);
        d3.select('#methodlist').property('value', method);
        d3.select('#prefix').property('value', prefix);
        d3.select('#yearslider').property('value', year);
        d3.select('#yearsProjectVal').property('value', years_to_project);
        d3.select('#govVal').property('value', governance);
        
        
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

        //!! refactor
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
        
        /*
        //!! remove
        d3.select("#plottype")
        .on("change", function(d){
            plottype = this.options[this.selectedIndex].value;
            updateplot();
            })
        */
    }

    initMenus(countries, outcomes);
    d3.select("#revenueVal").text(govRevenue);
    d3.select("#yearVal").text(year);


    d3.select("#revSlider").on("input", function (d) {
        govRevenue = this.value / 100.0;
        d3.select("#revenueVal").text((govRevenue * 100).toFixed(2) + " %");
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

    d3.select("#targetInput").on("input", function (d) {
        target = +this.value;
        d3.select(this).style('box-shadow', '0 0 0px #ffffff')
        d3.select(this).style('background-color', '#ffffff');
        mainUpdate();
    });


    /*
    d3.select("#yearSlider").on("input", function (d) {
        year = this.value;
        d3.select("#yearVal").text(year);
        mainUpdate();
    });
    
    d3.select("#yearsProjectSlider").on("input", function (d) {
        years_to_project = this.value;
        d3.select("#yearsProjectVal").text(years_to_project);
        mainUpdate();
    });
    */

    d3.selectAll("#outcomes").on("change", function (d) {
        outcome = this.options[this.selectedIndex].value
        updateLegend();
        set_outcome_target();
        mainUpdate();
        set_outcome_target();
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
    if (true){ // set true to show instantaneous box
        var text = getText(d, true);
        d3.select("#countrytext").
        html(text);
        d3.select("#countrydata")
            .style("display", text.length > 0 ? "inline-block" : "none");
    }
    colourCountries();
    updateplot();
    updatetarget();
}

function updateYears(_firstyear, _lastyear){
    year = _firstyear;
    years_to_project = _lastyear - _firstyear;
    set_outcome_target();
    mainUpdate();
}

function updateplot() {
    if (country.slice(0, 2) == "$-") {
        d3.select("#plotwrapper").style("display", "none");
        //d3.select("#ploterror").style("display", "none"); //!! remove
    } else {
        var plotdata = getProjectionData(+year, country, outcome, +years_to_project);
        console.log(plotdata);
        
        if (plotdata.error){
            d3.select("#plotwrapper").style("display", "none");
            //d3.select("#ploterrortext").html(plotdata.error.join("<br>")); //!! remove
            //d3.select("#ploterror").style("display", "inline-block"); //!! remove
            return;
        }
        
        var data = plotdata.data;
        var x_annotation = plotdata.start_of_effect;

        d3.select("#plotwrapper").style("display", "inline-block");
        //d3.select("#ploterror").style("display", "none"); //!! remove
       
        var plotdata = [];
        
        (data[0]).additional.forEach(function(property,i){
            var outcomedata = {
                x: data.map(a => a.year),
                y: data.map(a => a.additional[i].value),
                text: data.map(function(a){
                                var s = "";
                                a.gov.forEach(function(gov_result,k){
                                    s += gov_result.desc + " " 
                                        + gov_result.value.toFixed(2) + "<br>";
                                })
                                return s;
                               }),
                type: "scatter",
                name: property.name,
                meta: property.name, // make visible to hovertemplate
                visible : property.keyvariable ? true : "legendonly",
                hovertemplate : "%{meta}<br>%{x}:<b> %{y}</b><br>%{text}<extra></extra>",
            };
            plotdata.push(outcomedata);
        })
        
        var y_var_max = Math.max(plotdata.map(d => Math.max(d.y)));
        
        var theOutcome = outcomesMap.get(outcome);
        plotlayout.title = "Projection for " + countrycodes.get(country) + ": " + theOutcome.name;
        plotlayout.hovermode = "closest"
        plotlayout.annotations = [{
                x: x_annotation,
                y: 0,
                xref: 'x',
                yref: 'y',
                text: 'Start of effect',
                showarrow: true,
                arrowhead: 20,
                ax: 0,
                ay: +50
            }
          ]
        
        if (y_var_max < 1E-6){
            plotlayout.yaxis.range = [-1,1];
        }

        Plotly.newPlot('plot', plotdata, plotlayout);
    }
}

function updatetarget(){
    var text = makeTextTarget(+year, country, outcome, target);
    d3.select("#targetText")
    .html(text);
}

function download_csv(_year, _years_to_project, _countries, _outcome) {
    if (_countries.length < 1)
    {
        return ["No countries selected",];
    }
    var final_year = getProjectionEnd(_year, _years_to_project);
    var csvdata = getProjectionCSVData(_year, _countries, _outcome, _years_to_project);
    var button_title =  year + "-" + final_year + ".csv";
    if (_countries.length == 1)
    {
        button_title = _countries[0] + "_" + button_title;
    }

    if (csvdata.str)
    {
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvdata.str);
        hiddenElement.target = '_blank';
        hiddenElement.download = button_title;
        hiddenElement.click();
    }
    if (csvdata.errors){
        return csvdata.errors;
    }
    else{
        return null;
    }
}

function download_csv_plot(){
    download_csv(+year, +years_to_project, [country,], outcome);
}

function download_csv_multi(){
    // handle special selections
    var countries_to_export = multiplecountries.filter(d => d.slice(0,1) != "$");
    var special_selections = multiplecountries.filter(d => d.slice(0,2) == "$-")
    //console.log(special_selections);
    special_selections.forEach(function(_selection){
        var selection = selections.get(_selection);
        if (selection)
        {
            countrycodes.forEach(function(_v, _cid){
                if ( !(countries_to_export.includes(_cid)) && selection.fn(_cid, +year)){
                    countries_to_export.push(_cid);
                }
            });
        }
    });

    //console.log(multiplecountries,"\n",countries_to_export);
    var error = download_csv(+year, +years_to_project, countries_to_export.sort(), outcome);
    if (error){
        d3.select("#multicountryerror")
        .html(error.join("<br />"));
    }
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

    d3.select("#legend-label")
        .html(theOutcome.desc);
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
    
    popdata.nestdata(_popdata); // create the popdata object
    
    var theOutcome = outcomesMap.get(outcome)
    colorScale.domain(theOutcome.hasOwnProperty("fixedExtent") ? theOutcome.fixedExtent : theOutcome.extent);

    var countries = topojson.feature(countries, countries.objects.units).features;
    countries.forEach(function(d) {countrycodes.set(d.id, d.properties.name)});
    
    var popcountries = popdata.nesteddata.map(function(d) { return {id : d.key, name : d.values[0].values[0].countryname}});
    popcountries.forEach(function(d) {countrycodes.set(d.id, d.name)});
    
    c2 = new Set(countries.map( d => d.id));
    c1 = new Set(popdata.nesteddata.map(d=> d.key));
    
    /*
    let difference1 = new Set([...c2].filter(x => !c1.has(x))); // in countries, not popdata
    let difference2 = new Set([...c1].filter(x => !c2.has(x))); // in popdata, not countries
    */

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

    d3.select("#legend-label")
    .html(outcomesMap.get(outcome).desc);

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
    d3.select("#yearSlider")
        //.attr("min", popdata.firstyear) // min set manually to 1980
        .attr("max", popdata.lastyear)

    setupMenus(popcountries, outcomesList);
    spinner.stop();
    d3.select("#loading")
    .style("display", "none");

}

function getProjectionEnd(_year, _years_to_project){
    return Math.min(popdata.lastyear, _year + _years_to_project)
}

function updateCountryFilters(){
    var u = d3.select("#countryfilter").selectAll('button')
    .data(multiplecountries);

    function gethtml(d){
        // bit of a hack to get the selection names - simply add to existing map of ids and names
        var country_and_selection_codes = new Map(countrycodes);
        selections.forEach(function(d,k){country_and_selection_codes.set(k, d.short_desc)})
        var str = country_and_selection_codes.get(d);
        var s_html = '<i class="fa fa-close"></i> ' + str;
        return s_html;
    }

    function removecountry(d)
    {
        multiplecountries.splice(multiplecountries.indexOf(d), 1);
        updateCountryFilters()
    }

    // clear errors since something has changed
    d3.select("#multicountryerror")
    .html("");

    u.enter()
    .append("button")
    .attr("class", "btn")
    .html(gethtml)
    .on("click", removecountry)
  

    u.html(gethtml);

    u.exit().remove();

    var button = document.getElementById('multibutton')
    //button.disabled = (multiplecountries.length == 0); // give an error instead
}

function clear_multi(){
    multiplecountries = []
    updateCountryFilters();
}

function set_outcome_target(){
    // sets the target to the current value or failing that
    // default for the current outcome, 
    // e.g. to be called whenever the outcome changes

    var target_value = popdata.getvalue(country, +year, outcome);
    if (isNaN(target_value)){
        target_value = outcomesMap.get(outcome).target;
    }
    d3.select("#targetInput").property("value", target_value.toFixed(2))
    .style('box-shadow', '0 0 5px #ffdb8d')
    .style('background-color', '#ffdb8d');
    target = target_value;
}