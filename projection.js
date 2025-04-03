const fixed_years_to_wait = 5;

function getProjectionData(_firstyear, _country, _outcome, _years_to_return, _revenue, _governance, _smooth) {
    // Takes a baseline year an increase in revenue, and calculates the corresponding % increase in grpc:
    // projects this by: allowing five years for increased revenue to act, where there is no effect;
    // applying the percentage increase for all remaining years (up to a total of years_to_project years). 
    
    var ret = { data: [], error: null, years_of_effect: 0 };
    var grpcPcIncrease = 0;
    let years_successful = 0;
    var years_to_wait = fixed_years_to_wait;
    var years_to_project = _years_to_return;
    
    let grpcPrototype = {
        "historical grpc": null,
        "improved grpc": null
    }
    
    let datarowPrototype = {
        "year": null,
        "additional": null,
        "special": null,
        "coverage" : null,
        "grpc": Object.create(grpcPrototype),
        "govObserved" : null,
        "populationResults" : null,
        "gov": null,
        "incomelevel": null,
        "region": null,
        "population": null,
    }

    if (_governance.model == "EXOGENOUS")
    {
        // This model uses smoothing, so we must always project for the
        // entire wait period to get the final values for the effects
        years_to_project = Math.max(years_to_project, years_to_wait);
    }

    if (_governance.model == "ENDOGENOUS")
    {
        // Forecast governance over the projection period
        years_to_wait = 0
        var startRevenue = getRevenue(_country, _firstyear, _revenue)
        if (startRevenue === undefined)
        {
            if (ret.error === null) { ret.error = []; }
            ret.error.push("GRPC not available for " + _firstyear);
            _governance.table = NaN;
        }
        else
        {
            var grpcIncreaseFactor = 1 + startRevenue["percentage increase"]
            _governance.table = forecastGovernance(_country, _firstyear, years_to_project + 1, grpcIncreaseFactor)
        }
    }

    let firstRevenueError = true;

    for (let y = _firstyear; y <= popdata.lastyear && ((y - _firstyear) <= years_to_project); y++) 
    {
        let historical_grpc = NaN
        let grpc = NaN
        let revenueOK = true

        var revenues = getRevenue(_country, y, _revenue);
        if (revenues === undefined) {
            revenueOK = false
            if (firstRevenueError)
            {
                // This is the first revenue error, so add it to the errors list,
                // and toggle the flag so that no subsequent errors are recorded
                firstRevenueError = false
                if (ret.error === null) { ret.error = []; }
                ret.error.push("GRPC not available for " + y);
            }
        }

        if (revenueOK)
        {
            historical_grpc = revenues['historical grpc']
            if (y == _firstyear) {
                grpcPcIncrease = revenues["percentage increase"];
            }
            
            if ((y - _firstyear) < years_to_wait) {
                grpc = revenues["historical grpc"];
            } else {
                grpc = revenues["historical grpc"] * (1 + grpcPcIncrease);
                ret.years_of_effect += 1;
            }
        }

        if (ret.error === null)
        {
            var computed = computeResult(_country, y, _outcome, grpc, revenues["historical grpc"], _governance, 1E-6);
            if (computed.error) {
                ret.error = computed.error;
            }
        }

        let grpcrow = Object.create(grpcPrototype)
        let datarow = Object.create(datarowPrototype)

        grpcrow['historical grpc'] = historical_grpc
        grpcrow['improved grpc'] = grpc
        datarow.grpc = grpcrow

        datarow.year = +y
        datarow.govObserved = getobservedgovernance(_country, y);
        datarow.populationResults = getPopulationResults(_country, y, _outcome);
        
        if (ret.error === null)
        {
            datarow.additional = computed.additional
            datarow.special = computed.special
            datarow.coverage = computed.coverage
            datarow.gov = computed.gov
            datarow.incomelevel = computed.incomelevel
            datarow.region = computed.region
            datarow.population = computed.population
            years_successful++;
        }
        else
        {
            // Get a blank set of additional/special results (set to NaN)
            datarow.additional = computeAdditionalResults(_country, y, _outcome, NaN, NaN, NaN)
            datarow.special = computeSpecialResults(_country, y, _outcome, NaN, NaN, NaN)
            if (computed == undefined || computed.coverage == undefined)
            {
                // Just create a blank coverage entry
                datarow.coverage = coverageObject(_outcome, NaN, NaN)
            }
            else
            {
                // Use the computed coverage
                datarow.coverage = computed.coverage;
            }
            // Try and compute the governance despite the error being present
            datarow.gov = computegovernance(_country, y, _governance, grpc)
            // Fill in income level, region and population directly from the population data
            datarow.incomelevel = popdata.getstring(_country, y, 'incomelevel')
            datarow.region = popdata.getstring(_country, y, 'region')
            datarow.population = popdata.getvalue(_country, y, "Population, total");
        }

        ret.data.push(datarow);
    }

    if (_smooth && _governance.model == "EXOGENOUS" && (years_successful > years_to_wait))
    {
        // Smooth all effects between the starting year (no effect)
        // and the start of effect using linear interpolation
        years_to_smooth = Math.min(years_to_wait, _years_to_return + 1)

        // Work on a temporary copy...
        // Note: slice may be shorter than length specified if projection stopped early due to error
        datacopy = ret.data.slice(0, _years_to_return + 1); 

        for (let i = 1; i < years_to_smooth; i++)
        {
            for (const property_index in ret.data[i].additional)
            {
                const start_value = ret.data[0].additional[property_index].value
                const end_value = ret.data[years_to_wait].additional[property_index].value
                const interpolated_value = start_value + i * (end_value - start_value) / years_to_wait 
                datacopy[i].additional[property_index].value = interpolated_value;
            }
        }
        // ...and use it to replace the data already in place
        ret.data = datacopy
    }

    ret.start_of_effect = Math.min(popdata.lastyear, _firstyear + years_to_wait);
    return (ret)
}

function quote(string)
{
    return `"${string}"`
}

function getProjectionCSVData(_year, _countries, _outcomes, _years_to_project, _revenue, _governance, _smooth)
{
    var header = `country,iso,year,"income level",region,"total population"`;
    var ret = {str : null, errors : null};
    var headerDone = false;
    for (let iCountry = 0; iCountry < _countries.length; iCountry++) 
    {
        let body = "";
        let _country = _countries[iCountry];
        let data = null;

        _outcomes.forEach(function (thisOutcome)
        {
            let projectionData = getProjectionData(_year, _country, thisOutcome, _years_to_project, _revenue, _governance, _smooth);

            if (projectionData.error) {
                if (ret.errors === null){
                    ret.errors = []
                }
                ret.errors.push(countrycodes.get(_country) + ": " + projectionData.error);
            }

            if (data === null)
            {
                data = projectionData.data;
            }
            else
            {
                projectionData.data.forEach(function(row, index)
                {
                    data[index].additional.push(...row.additional)
                    data[index].special.push(...row.special)
                    data[index].coverage = data[index].coverage.concat(row.coverage);
                })
            }
        })
        
        if(!headerDone){
            headerDone = true;

            data[0].populationResults.forEach(function (property) {
                header += "," + quote(property.name);
            });

            for (const property in data[0].grpc) {
                header += "," + quote(property);
            }

            data[0].coverage.forEach(function (property) {
                header += "," + quote(property.name);
            });

            data[0].additional.forEach(function (property) {
                header += "," + quote(property.name);
            });

            data[0].special.forEach(function (property) {
                header += "," + quote(property.name);
            });

            data[0].govObserved.forEach(function (property) {
                header += "," + quote(property.desc);
            });

            data[0].gov.forEach(function (property) {
                header += "," + quote(property.desc);
            });

            header += "\n";
            ret.str = header;
        }

        data.forEach(function (datarow) {
            let row = "";
            body += countrycodes.get(_country).replace(","," -") + "," + _country + "," + datarow.year + "," + datarow.incomelevel + "," + datarow.region + "," + datarow.population + ",";

            datarow.populationResults.forEach(function (property) {
                body += property.value + ",";
            });

            for (const property in datarow.grpc) {
                body += datarow.grpc[property] + ",";
            }

            datarow.coverage.forEach(function (property) {
                body += property.value + ",";
            });

            datarow.additional.forEach(function (property) {
                body += property.value + ",";
            });

            datarow.special.forEach(function (property) {
                body += property.value + ",";
            });

            datarow.govObserved.forEach(function (property) {
                body += property.value + ",";
            });

            datarow.gov.forEach(function (property) {
                body += property.value + ",";
            });

            body += row + "\n";
        });
        ret.str += body;
    };
    return ret;
}

function calcProjection(_year, _country, _outcome, _years_to_project, _revenue, _governance, _smooth)
{
    // calculate the total [final] values of projected effects for flow [stock] variables
    var ret = {data : null, error : null, effect_description : null};
    var plotdata = getProjectionData(_year, _country, _outcome, _years_to_project, _revenue, _governance, _smooth);
    
    if (plotdata.error){
        ret.error = plotdata.error;
        return ret;
    }
    
     var theOutcome = outcomesMap.get(outcome);
    
     var totals = new Map();
     var final_values = new Map();
     plotdata.data.forEach(function(d){
         d.additional.forEach(function(result){
             if (totals.has(result.name)){
                 if (d.year >= plotdata.start_of_effect) {
                     totEffectPeriod = totals.get(result.name).effect + result.value
                     finalEffect = result.value
                 } 
                 else {
                     totEffectPeriod = 0
                     finalEffect = 0
                 }
                 final_values.set(result.name, {"effect" : finalEffect})
                 totals.set(result.name, {"projection" : totals.get(result.name).projection + result.value, "effect" : totEffectPeriod} )
             }
             else{
                totEffectPeriod = d.year >= plotdata.start_of_effect ? result.value : 0
                finalEffect = d.year >= plotdata.start_of_effect ? result.value : 0
                totals.set(result.name, {"projection" : result.value, "effect" : totEffectPeriod});
                final_values.set(result.name, {"effect" : finalEffect})
             }
         })
     })
    
    if (theOutcome.isStockVar){

        // Calculate average over the effect period (unused for now)
        var averages = new Map();
        totals.forEach( function(value, result){
            var result_avg_effect = plotdata.years_of_effect > 0 ? value.effect / plotdata.years_of_effect : 0;
            var result_avg_projection = value.projection / plotdata.data.length;
            averages.set(result, {"projection" : result_avg_projection, "effect" : result_avg_effect});            
        })

        ret.data = final_values;
    }
    else{
        ret.data = totals;   
    }

    ret.start_of_effect = plotdata.start_of_effect;
    ret.effect_description = theOutcome.isStockVar ? "Final" : "Cumulative"
    
    return ret;
}
