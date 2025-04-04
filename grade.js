var version = "GRADE v3.15.7"
var date = "2025/03/10"
var subheight = 100;
var legendCells = 11;
var transitionTime = 500;
var legendLinear;
var countrycodes = new Map();
var numGovernanceSteps = 200;
var maxGovernance = 2;

// inputs & initial values
var govRevenue = 0;
var enteredGrpc = 0;
var absGovRev = 0;
var absGovRevSlider = 0;
var pcGovRev = 0;
var year = 2002;
var years_to_project = 10;
var governance = 0;
var governanceModel = "ENDOGENOUS"
var target = 100;
var country = "$-ALL";
var method = "absolute";
var file_method = "absolute";
var prefix = "M";
var plottype = "population";
var outcome = "SANITBASIC";
var govtype = "GOVEFFECT";
var multiplecountries = ["$-ALL"];
var smooth = true;
var limitgovernance = false;
var startingYearOfExtensions = 2024;

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
    xaxis: {tickformat: 'd'},
};

var config = {
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      height: null,
      width: null,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    }
  };

var popdata = new PopData();
var revdata = new PopData();
revdata.nestdata("");

function dataHasCountry(_cid){
    return (popdata.getrow(_cid, -1) !== undefined);
}

function getRevenueInputs(){
    // utility function to bundle the various revenue variables into an object
    e = 
    {
        govRevenue : govRevenue,
        absGovRev : absGovRev,
        pcGovRev : pcGovRev,
        method : method,
        file_method : file_method
    }

    return e;
}

function getGovernanceInputs(){
    // utility function to bundle the various governance model variables into an object
    e =
    {
        value : governance,
        model : governanceModel,
        table : null,
    }

    return e;
}

function getColor(_cid, _year, _revenue, _governance) {

    var value;
    if (allIndicatorsSelected()){
	var revenues = getRevenue(_cid, _year, _revenue);
        value = revenues === undefined ? NaN : revenues["new grpc"];
    }
    else {
	value = getResult(_cid, _year, _revenue, _governance);
    }
        
    if (!isNaN(value)) {
        if (multipleCountriesSelected())
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

function makeText2(_year, _iso, _outcome, _years_to_project, _revenue, _governance, _smooth)
{
    // accompanies makeText() (which does the instantaneous calculation)
    // as version that is specific to the projection.
    
    var end_year = getProjectionEnd(_year, _years_to_project)
    var projection = calcProjection(_year, _iso, _outcome, _years_to_project, _revenue, _governance, _smooth)
    var text = "";
    text = text 
        + "<h1 class='tooltip'> " +  countrycodes.get(_iso) + "</h1>"
        + "<br/><strong>Projection for " + _year + " - " + end_year + "</strong>"
    
    
    if (projection.error){
        text = text 
        + "<br/> Projection unavailable: "
        + projection.error.join("<br>"); 
    }
    else{
        var revenues = getRevenue(_iso, _year, _revenue);
        if (revenues === undefined)
        {
            // shouldn't happen as plotdata would give error
            text += "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No GRPC data available";
        }
        else{
            
            var varText = projection.effect_description;
            
            text = text 
            + "<br/><br/><strong>" + _year + "</strong>"
            + "<br/>Current Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["historical grpc"].toFixed(2)) + "</span>" 
            + "<br/>New Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["new grpc"].toFixed(2)) + "</span>"
            + "<br/>Increase in Gov. rev. per capita: <span class = 'ar'>" + (revenues["percentage increase"] * 100).toFixed(2) + "%</span>"
            + "<br><br>"
            + "<div class = 'cumulative'>"
            + "<strong>" + varText + " effect, after start of effect in " + projection.start_of_effect + ":</strong>"
            
            projection.data.forEach(function(value, result){
              text += "<br/>" + result + ":<br/> <span class = 'ar'>" + d3.format(",")(value.effect.toFixed(0)) + "</span>";
            })
            text += "</div>"
        }
}
    return text;
}

function makeText(_iso, _year, _revenue, _governance) {
    var revenues = getRevenue(_iso, _year, _revenue);
    if (revenues === undefined)
    {
        return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": No GRPC data available";
    }
    var result;
    var coverageDescriptor="";
    var dp=0;

    // Only compute the results if an indicator is selected
    if (!allIndicatorsSelected()){
        result = computeResult(_iso, _year, outcome, revenues["new grpc"], revenues["historical grpc"], _governance);
	coverageDescriptor = outcomesMap.get(outcome).isPercentage ? "% coverage" : "coverage ratio";
	dp = outcomesMap.get(outcome).dp;
        if (result.error)
        {
            return "<strong>" + countrycodes.get(_iso) + "<\/strong>" + ": " + result.error.join("<br>");
        }
    }
    var text = "";
    text = text + "<h1 class='tooltip'> " +  countrycodes.get(_iso) + "</h1>" +
    "<br/><strong>" + _year + "</strong>" +
    "<br/>Current Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["historical grpc"].toFixed(2)) + "</span>" +
    "<br/>New Gov. rev. per capita: <span class = 'ar'>$" + d3.format(",")(revenues["new grpc"].toFixed(2)) + "</span>" +
	"<br/>Increase in Gov. rev. per capita: <span class = 'ar'>" + (revenues["percentage increase"] * 100).toFixed(2) + "%</span>";
    if (allIndicatorsSelected()){
        // No single indicator selected - text is complete
        return text;
    }
    text +=
    "<br/><br/><strong>" + outcomesMap.get(outcome).name + "</strong>" 
    +
    "<br/>(instantaneous effect)"
    +"<br/>Current " + coverageDescriptor + ": <span class = 'ar'>" + result.original.toFixed(dp) + "</span>" +
    "<br/>New " + coverageDescriptor + ": <span class = 'ar'>" + result.improved.toFixed(dp) + "</span>";

    if (result.hasOwnProperty("additional")) {
        result.additional.forEach(function(property) {
            text = text + "<br/>" + property.name + ":&nbsp&nbsp<span class = 'arb'>" + d3.format(",")(property.value.toFixed(0)) + "</span>";
        })
    }

    if (result.hasOwnProperty("special")) {
        result.special.forEach(function(property) {
            text = text + "<br/>" + property.name + ":&nbsp&nbsp<span class = 'arb'>" + d3.format(",")(property.value.toFixed(0)) + "</span>";
        })
    }

    return text;
}

function makeTextTarget(_year, _iso, _outcome, _target, _revenue){
    if (allIndicatorsSelected())
    {
        return "No outcome selected";
    }
    if (isCountrySpecialSelection(_iso))
    {
        return "No country selected";
    }
    var revenues = getRevenue(_iso, _year, _revenue);
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

    if (result.hasOwnProperty("special")) {
        result.special.forEach(function(property) {
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

function getText(_d, _bProjection, _revenue, _year, _governance, _smooth) {
    if (isCountrySpecialSelection(_d.id)) {
        return "";
    }

    if (_bProjection) {
        return makeText2(_year, _d.id, outcome, +years_to_project, _revenue, _governance, _smooth);
    } else {
        return makeText(_d.id, _year, _revenue, _governance)
    }
}

function getResult(_cid, _year, _revenue, _governance) {
        var revenues = getRevenue(_cid, _year, _revenue);
        if (revenues === undefined)
            {return NaN;}
        var result = computeResult(_cid, _year, outcome,
            revenues["new grpc"], revenues["historical grpc"], _governance);
        if (result.error)
            {return NaN;}
        return result.improved;
}

function setupMenus(_countries, _outcomes) {
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
        d3.select('#filemethod').property('value', file_method);
        d3.select('#prefix').property('value', prefix);
        d3.select('#yearslider').property('value', year);
        d3.select('#yearsProjectVal').property('value', years_to_project);
        d3.select('#govVal').property('value', governance);
        updateCountryFilters();

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
                if (method == "file"){
                    d3.select("#revenueFileInput")
                        .style("display", "block")
                    d3.select("#revenueStandardInput")
                        .style("display", "none")
                }
                else{
                    d3.select("#revenueFileInput")
                        .style("display", "none")
                    d3.select("#revenueStandardInput")
                        .style("display", "block")
                }
                mainUpdate();
            })

        d3.select("#prefix")
            .on("change", function (d) {
                prefix = this.options[this.selectedIndex].value;
                var sliderVar = document.getElementById('absRevSlider').value;
                var prefixValue = getPrefixValue(prefix);
                absGovRev = str2Num(sliderVar) * prefixValue;
                d3.select("#absRevenueVal").text("$" + Math.round(absGovRev / prefixValue) + getPrefix(prefix));
                mainUpdate();
            })

        d3.select("#filemethod")
        .on("change", function (d) {
            file_method = this.options[this.selectedIndex].value;
            mainUpdate();
        })
    }

    initMenus(_countries, _outcomes);
    d3.select("#revenueVal").text(govRevenue);
    d3.select("#yearVal").text(year);

    d3.select("#versiondate").text(version + " " + date);


    d3.select("#revSlider").on("input", function (d) {
        govRevenue = this.value / 100.0;
        d3.select("#revenueVal").text((govRevenue * 100).toFixed(2) + " %");
        mainUpdate();
    });

    d3.select("#absRevSlider").on("input", function (d) {
        absGovRevSlider = str2Num(this.value);
        absGovRev = absGovRevSlider * getPrefixValue(prefix);
        d3.select("#absRevenueVal").text("$" + d3.format(",")(Math.round(absGovRev / getPrefixValue(prefix))) + getPrefix(prefix));
        mainUpdate();
    });

    d3.select("#pcRevSlider").on("input", function (d) {
        pcGovRev = str2Num(this.value);
        d3.select("#perCapitaRevenueVal").text("$" + d3.format(",")(Math.round(pcGovRev)));
        mainUpdate();
    });

    d3.select("#grpcSlider").on("input", function (d) {
        enteredGrpc = this.value * 1;
        d3.select("#grpcVal").text("$" + d3.format(",")(enteredGrpc));
        mainUpdate();
    });

    d3.select("#govSlider").on("input", function (d) {
        governance = Math.round((this.value / numGovernanceSteps * maxGovernance - maxGovernance) * 100) / 100;
        d3.select("#govVal").text((governance <= 0 ? "" : "+") + governance);
        mainUpdate();
    });

    d3.select("#govSlider")
    .attr("max",numGovernanceSteps * maxGovernance)
    .attr("min",0)
    .attr("value", numGovernanceSteps * maxGovernance / 2)

    d3.select("#targetInput").on("input", function (d) {
        target = +this.value;
        d3.select(this).style('box-shadow', '0 0 0px #ffffff')
        d3.select(this).style('background-color', '#ffffff');
        mainUpdate();
    });

    d3.selectAll("#outcomes").on("change", function (d) {
        outcome = this.options[this.selectedIndex].value
        updateLegend();
        set_outcome_target();
        mainUpdate();
        set_outcome_target();
    });

    d3.selectAll(".colourscheme").on("input", function (d) {
        ccolor = this.value;
        //updateLegend();
        mainUpdate();
    });

    d3.selectAll("input[name='governance model']").on("change", function(){
        governanceModel = this.value;

        // Only show the "smooth" checkbox for the exogenous model
        document.getElementById("smooth").style.display =  governanceModel == "EXOGENOUS" ? "block" : "none";
        
        // Disable the governance slider if using the endogenous model
        document.getElementById('govSlider').disabled = (governanceModel == "ENDOGENOUS");
        document.getElementById('governancepanel').style.opacity =  governanceModel == "ENDOGENOUS" ? 0.5 : 1.0;
        // Disable the target SDG controls if using the endogenous model
        document.getElementById('targetInput').disabled = (governanceModel == "ENDOGENOUS");
        document.getElementById('targetpanel').style.opacity =  governanceModel == "ENDOGENOUS" ? 0.5 : 1.0;
        mainUpdate();
    });

    d3.selectAll("input[name='smooth']").on("change", function(){
        smooth = this.checked;
        mainUpdate();
    });

    d3.selectAll("input[name='limit']").on("change", function(){
        limitgovernance = this.checked;
        mainUpdate();
    });

    d3.selectAll("input[name='Plot type']").on("change", function(){
        plottype = this.value;
        mainUpdate();
    });

    fileElem = document.getElementById("fileElem");

    fileElem.addEventListener("change", handleRevenueCsv, false);

    // Retire the exogenous model (governance specified) and hide the
    // associated controls and the target feature
    document.getElementById("gov controls").style.display =  "none"
    document.getElementById("gov quality").style.display = "none"

    function convertPropsToUpperCase(d) {
        Object.keys(d).forEach(function(origProp) {
          var upperCaseProp = origProp.toLocaleUpperCase().trim()
          // if the uppercase and the original property name differ
          // save the value associated with the original prop
          // into the uppercase prop and delete the original one
          if (upperCaseProp !== origProp) {
            d[upperCaseProp] = d[origProp];
            delete d[origProp];
          }
        });
        return d;
      }
    
    function handleRevenueCsv() {
        
        const fileList = this.files;
        var fr = new FileReader();

        function typeAndSetRevenue(d) {
    
            var e = {}

            d = convertPropsToUpperCase(d)
            
            e.year   = +d.YEAR;
            e.REVENUE = str2Num(d.REVENUE);
            e.ISO = d.ISO;
            
            return e;
        }

        fr.onload = function(e) {
            var data = d3.csv.parse(e.target.result, typeAndSetRevenue);
            revdata.nestdata(data);
            updateCountries();
        };

        fr.readAsText(fileList[0]);

        document.getElementById("fileName").textContent = fileList[0].name;
    }
}

function colourCountries() {
    svg.selectAll('path.countries').transition()
        .duration(transitionTime)
        .attr('fill', function (d) {
            return getColor(d.id, +year, getRevenueInputs(), getGovernanceInputs());
        })
}

function updateCountries() {
    var d = {
        "id": country
    };
    if (!allIndicatorsSelected()){
	// Indicator selected - display the country-specific results
        var text = getText(d, true, getRevenueInputs(), +year, getGovernanceInputs(), smooth);
        d3.select("#countrytext").
        html(text);
        d3.select("#countrydata")
            .style("display", text.length > 0 ? "inline-block" : "none");
    } else {
        // Hide the country-specific results
        d3.select("#countrydata").style("display", "none");
    }
    colourCountries();
    updateplot();
    updatePictogram();
    updatetarget();
}

function updateYears(_firstyear, _lastyear){
    year = _firstyear;
    years_to_project = _lastyear - _firstyear;
    set_outcome_target();
    mainUpdate();
}

function buildOutcomeDataSeries(data, resultToPlot, property, i, linetype)
{

    var spaces = "          ";
    var outcomedata = {
        x: data.map(a => a.year),
        y: data.map(a => a[resultToPlot][i].value),
        text: data.map(function(a){
            var s = "";
            a.gov.forEach(function(gov_result,k){
                s += gov_result.desc + " " 
                  + gov_result.value.toFixed(2) + "<br>";
             })
             return s;
         }),
         type: "scatter",
	 line: {dash : linetype},
         name: property.name + spaces, // hack to fix cutoff legend text in Plotly
         meta: property.name, // make visible to hovertemplate
         visible : property.keyvariable ? true : "legendonly",
         hovertemplate : "%{meta}<br>%{x}:<b> %{y}</b><br>%{text}<extra></extra>",
         };
    return outcomedata;
}

function convertPictogramDataToCsvString(data){
    var str = "";
    data.forEach(function(item){
	    str += item.name + ","
	});
    str = str.slice(0, str.length - 1) + "\n";
    data.forEach(function(item){
	    str += item.value + ","
	})
    str = str.slice(0, str.length - 1);

    return str;
}

function download_csv_pictogram(){
    let dataObject = getPictogramReadyData();
    let data = dataObject.csvData;
    let csvdata = convertPictogramDataToCsvString(data);
    let finalYear = +year + years_to_project;

    var button_title =  country + "_" + year + "-" + finalYear + ".csv";
    if (csvdata)
	{
	    var hiddenElement = document.createElement('a');
	    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvdata);
	    hiddenElement.target = '_blank';
	    hiddenElement.download = button_title;
	    hiddenElement.click();
	}
}

function updatePictogram(){
    // Hide the pictogram if no country is selected, or if an outcome is selected
    if (multipleCountriesSelected() || !allIndicatorsSelected()) {
            d3.select("#pictogram-wrapper").style("display", "none");
    }
    else {
        // Show the pictogram
        d3.select("#pictogram-wrapper").style("display", "inline-block");
    }

    var data = getPictogramReadyData();
    var layout = {yaxis:{automargin:true}};

    Plotly.newPlot('pictogram', data.plotData, layout);    

    var errorText = getErrorTextFromPictogramData(data.error);
    let finalYear = +year + years_to_project;
    var text = countrycodes.get(country) + `: final effects in ${finalYear}`;
    if (errorText.length > 0){
	text += ": " + errorText;
    }
    d3.select("#pictogram-errors").html(text);
}

function getErrorTextFromPictogramData(errors){
    return errors.filter(e => e !== null && e.length > 0).length > 0 ? "Unable to calculate some results (e.g. due to missing data)" : "";
}

function getPictogramReadyData()
{
    var projectionData = getPictogramProjectionData();
    return convertProjectionDataToPictogramData(projectionData);
    }

function convertProjectionDataToPictogramData(data){

    var plotObjectList = [];
    var csvData = [];
    var errorList = [];

    data.forEach(outcomeData => { 
	    errorList.push(outcomeData.data.error);
	});

    var categories = [];
    var finalResults = [];
    var barColour = d3.scale.linear().
        domain([0, 1E5]).
	range(["#dee5f8", "#e09900"]).
	interpolate(d3.interpolateLab);

    data.forEach(function(outcomeData, outcomeIndex){
            var thisOutcomeDataSeries = outcomeData.data.data;
            var finalResultThisOutcomeDataSeries = thisOutcomeDataSeries[thisOutcomeDataSeries.length - 1];
            const value = finalResultThisOutcomeDataSeries.additional[0].value.toFixed(0);
            finalResults.push(value);
            populationName = finalResultThisOutcomeDataSeries.additional[0].populationName;
	    categories.push(finalResultThisOutcomeDataSeries.additional[0].name);
            csvData.push({
       	                value : value,
			name : finalResultThisOutcomeDataSeries.additional[0].name,
			});
        });

    categories = categories.reverse();
    finalResults = finalResults.reverse();

        var plotObject = {
	    name: populationName, 
	    y: categories, 
	    x: finalResults,
	    marker:{color:finalResults.map(barColour)},
	    type: 'bar', 
	    orientation:'h',
	    hoverlabel: {namelength :-1},
  	    text: finalResults.map(String),
            textposition: 'auto',
	};
        plotObjectList.push(plotObject);

    return {
	plotData: plotObjectList,
	csvData: csvData, 
        error: errorList,
	    };
}



function getPictogramProjectionData()
{
    var projectionData = [];

    keysOfOutcomesToShow = [
			    "U5MSURV",
			    "UPPERSCHOOL",
			    "LOWERSCHOOL",
			    "PRIMARYSCHOOL",
			    "Stunting prevalence (% of population)",
			    "Access to electricity (% of population)",
			    "WATERBASIC",
			    "SANITBASIC",
			    "Access to clean fuels and technologies for cooking (% of population)"
			    ];

    keysOfOutcomesToShow.forEach(function (outcomeName){
            var outcomeObject = outcomesMap.get(outcomeName);
            var thisOutcomeProjectionData = getProjectionData(+year, country, outcomeName, +years_to_project, getRevenueInputs(), getGovernanceInputs(), smooth);
	    projectionData.push({outcome:outcomeObject, data:thisOutcomeProjectionData});
	});

    return projectionData;
}

function updateplot() {
    // Hide the plot if all indicators are selected
    if (allIndicatorsSelected()){
        d3.select("#plotwrapper").style("display", "none");
        return;
    }

    // Hide the plot if no country is selected
    if (multipleCountriesSelected()) {
        d3.select("#plotwrapper").style("display", "none");
    } else {
        // Show the plot
        let plotdata = getProjectionData(+year, country, outcome, +years_to_project, getRevenueInputs(), getGovernanceInputs(), smooth);
        
        if (plotdata.error){
            d3.select("#plotwrapper").style("display", "none");
            return;
        }
        
        var data = plotdata.data;

	// call out if base coverage reaches 100%
	let outcomeObject = outcomesMap.get(outcome);
	d3.select("#plot-errors").html("");
	if (data.some(d => hasCoverageValueReachedSaturation(d.coverage[0].value, outcomeObject))){
	    d3.select("#plot-errors").html(getCoverageSaturationWarningText(outcomeObject))
	}

        var dataFromObservation = data.filter(x => x.year <= startingYearOfExtensions)
        var dataExtended = data.filter(x => x.year >= startingYearOfExtensions)
        var x_annotation = plotdata.start_of_effect;

        d3.select("#plotwrapper").style("display", "inline-block");
       
        plotdata = [];
        const resultToPlot = plottype == "population" ? 'additional' : 'coverage';

        (data[0])[resultToPlot].forEach(function(property,i){
	    plotdata.push(buildOutcomeDataSeries(dataFromObservation, resultToPlot, property, i, "line"));
            var propertyExtended = {...property};
            propertyExtended.name += ": Extended data";
	    plotdata.push(buildOutcomeDataSeries(dataExtended, resultToPlot, propertyExtended, i, "dash"));
            
        })
        
        var y_var_max = d3.max(plotdata.map(d => d3.max(d.y)));
        
        var theOutcome = outcomesMap.get(outcome);
	var dp = theOutcome.dp;
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

        if (plottype == 'coverage')
        {
            plotlayout.yaxis = {hoverformat: `,.${dp}f`, tickformat : `,.${dp-2}f`};
        }
        else
        {
            plotlayout.yaxis = {hoverformat: ',.0f', tickformat : ',.0f'};
        }

        if (plottype == "coverage")
        {
            plotlayout.yaxis.range = theOutcome.fixedExtent;
        }
        
        if (y_var_max < 1E-6){
            plotlayout.yaxis.range = [-1,1];
        }

        Plotly.newPlot('plot', plotdata, plotlayout, config);
    }
}

function updatetarget(){
    var text = makeTextTarget(+year, country, outcome, target, getRevenueInputs());
    d3.select("#targetText")
    .html(text);
}

function download_csv(_year, _years_to_project, _countries, _outcomes, _revenue, _governance, _smooth) {
    
    if (_countries.length < 1)
    {
        return ["No countries selected",];
    }
    var final_year = getProjectionEnd(_year, _years_to_project);

    
    let countries
    if (_revenue.method == "file")
    { 
        let csvCountries = revdata.getcountries();
	countries = _countries.filter(iso => csvCountries.includes(iso));
	if (countries.length < 1)
	{
	    return ["CSV file has no revenue data for selected countries",];
	}
    }
    else
    {
        countries = _countries;
    }

    var csvdata = getProjectionCSVData(_year, countries, _outcomes, _years_to_project, _revenue, _governance, _smooth);
    
    var button_title =  _year + "-" + final_year + ".csv";
    if (countries.length == 1)
    {
        button_title = countries[0] + "_" + button_title;
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
    download_csv(+year, +years_to_project, [country,], [outcome,], getRevenueInputs(), getGovernanceInputs(), smooth);
}

function download_csv_multi(){
    // handle special selections
    var countries_to_export = multiplecountries.filter(d => !isCountrySpecialSelection(d));
    var special_selections = multiplecountries.filter(d => isCountrySpecialSelection(d));

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

    // handle selected or all outcomes
    let outcomes = []
    if (!allIndicatorsSelected())
    {
        outcomes.push(outcome)
    }
    else
    {
	// Build a list of all outcomes from the list - excepting the "All indicators" entry
        outcomesList.forEach(function (o){
                var outcomeName = o[0];
		if (outcomeName != "$-ALL"){
                    outcomes.push(outcomeName)
		}
        })
    }

    var error = download_csv(+year, +years_to_project, countries_to_export.sort(), outcomes, getRevenueInputs(), getGovernanceInputs(), smooth);
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

function loaded(error, _countries, _popdata, _gdpdef) {

    initDeflator(_gdpdef);
    initModal();
    
    popdata.nestdata(_popdata); // create the popdata object
    
    var theOutcome = outcomesMap.get(outcome)
    colorScale.domain(theOutcome.hasOwnProperty("fixedExtent") ? theOutcome.fixedExtent : theOutcome.extent);

    var _countries = topojson.feature(_countries, _countries.objects.units).features;
    _countries.forEach(function(d) {countrycodes.set(d.id, d.properties.name)});
    
    var popcountries = popdata.nesteddata.map(function(d) { return {id : d.key, name : d.values[0].values[0].countryname}});
    popcountries.forEach(function(d) {countrycodes.set(d.id, d.name)});
    
    c2 = new Set(_countries.map( d => d.id));
    c1 = new Set(popdata.nesteddata.map(d=> d.key));

    svg.selectAll('path.countries')
        .data(_countries)
        .enter()
        .append('path')
        .attr('class', 'countries')
        .attr('d', path)
        .on("click", clicked)
        .attr('fill', function (d, i) {
            return getColor(d.id, year, getRevenueInputs(), getGovernanceInputs());
        })
        .call(d3.helper.tooltip(
            function (d, i) {
                return getText(d, false, getRevenueInputs(), +year, getGovernanceInputs(), false);
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

    d3.select("#yearSlider")
        // min set manually to 1980
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
}

function clear_multi(){
    multiplecountries = []
    updateCountryFilters();
}

function set_outcome_target(){
    // sets the target to the current value or failing that
    // default for the current outcome, 
    // e.g. to be called whenever the outcome changes

    // If all indicators are selected or no country is selected, disable the target input
    if (allIndicatorsSelected() || multipleCountriesSelected()){
        d3.select("#targetInput").property("value", 100)
            .property("disabled", true);
        return;
    }

    var target_value = popdata.getvalue(country, +year, outcome);
    if (isNaN(target_value)){
        target_value = outcomesMap.get(outcome).target;
    }

    var dp = outcomesMap.get(outcome).dp;
    d3.select("#targetInput").property("value", target_value.toFixed(dp))
	.property('disabled', false)
        .style('box-shadow', '0 0 5px #ffdb8d')
        .style('background-color', '#ffdb8d');
    target = target_value;
    d3.select("#targetLabel").text(outcomesMap.get(outcome).isPercentage ? '%' : '');
}

function str2Num(str){
    str = str.replace(/[^\d\.\-\+E]/g, ""); // You might also include + if you want them to be able to type it
    return parseFloat(str);
}

function allIndicatorsSelected(){
    return outcome == "$-ALL";
}

function multipleCountriesSelected(){
    return isCountrySpecialSelection(country);
}

function isCountrySpecialSelection(_country){
    return _country.slice(0,2) == "$-";
}
