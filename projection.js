const fixed_years_to_wait = 5;

function getProjectionData(_firstyear, _country, _outcome, _years_to_return, _revenue, _governance) {
    // Takes a baseline year an increase in revenue, and calculates the corresponding % increase in grpc:
    // projects this by: allowing five years for increased revenue to act, where there is no effect;
    // applying the percentage increase for all remaining years (up to a total of years_to_project years). 
    
    var ret = { data: [], error: null, years_of_effect: 0 };
    var grpcPcIncrease = 0;
    var years_to_wait = fixed_years_to_wait;
    var years_to_project = _years_to_return

    if (_governance.model == "EXOGENOUS")
    {
        // This model uses smoothing, so we must always project for the
        // entire wait period to get the final values for the effects
        years_to_project = Math.max(years_to_project, years_to_wait);
    }

    if (_governance.model == "ENDOGENOUS")
    {
        years_to_wait = 0
        var startRevenue = getRevenue(_country, _firstyear, _revenue)
        if (startRevenue === undefined)
        {
            if (ret.error === null) { ret.error = []; }
            ret.error.push("GRPC not available for " + _firstyear);
            return ret;
        }
        var grpcIncreaseFactor = 1 + startRevenue["percentage increase"]
        _governance.table = forecastGovernance(_country, _firstyear, years_to_project + 1, grpcIncreaseFactor)
    }

    for (y = _firstyear; y <= popdata.lastyear && ((y - _firstyear) <= years_to_project); y++) {
        var revenues = getRevenue(_country, y, _revenue);
        if (revenues === undefined) {
            if (ret.error === null) { ret.error = []; }
            ret.error.push("GRPC not available for " + y);
            return ret;
        }
        if (y == _firstyear) {
            grpcPcIncrease = revenues["percentage increase"];
        }
        
        if ((y - _firstyear) < years_to_wait) {
            grpc = revenues["historical grpc"];
        } else {
            grpc = revenues["historical grpc"] * (1 + grpcPcIncrease);
            ret.years_of_effect += 1;
        }

        var computed = computeResult(_country, y, _outcome, grpc, revenues["historical grpc"], _governance, 1E-6);
        if (computed.error) {
            if (ret.error === null) { ret.error = []; }
            ret.error = ret.error.concat(computed.error);
            return ret;
        }

        ret.data.push({
            "year": +y,
            "additional": computed.additional,
            "grpc": {
                "historical grpc": revenues["historical grpc"],
                "improved grpc": grpc
            },
            "gov": computed.gov,
        });
    }

    /* TODO: return projected data up to year where there is error (replace returns with breaks above)
    Only do the smoothing if there is years to wait of data, otherwise error and don't return data
    i.e. ret.data should have length of at least years_to_wait + 1 (check)
    //*/

    if (_governance.model == "EXOGENOUS")
    {
        // Smooth all effects between the starting year (no effect)
        // and the start of effect using linear interpolation
        years_to_smooth = Math.min(years_to_wait, _years_to_return + 1)

        // Work on a temporary copy...
        // Note: slice may be shorter than length specified if projection stopped early due to error
        datacopy = ret.data.slice(0, _years_to_return + 1); 

        for (i = 1; i < years_to_smooth; i++)
        {
            for (const property_index in ret.data[i].additional)
            {
                start_value = ret.data[0].additional[property_index].value
                end_value = ret.data[years_to_wait].additional[property_index].value
                interpolated_value = start_value + i * (end_value - start_value) / years_to_wait 
                datacopy[i].additional[property_index].value = interpolated_value;
            }
        }
        // ...and use it to replace the data already in place
        ret.data = datacopy
    }

    ret.start_of_effect = Math.min(popdata.lastyear, _firstyear + years_to_wait);
    return (ret)
}

function getProjectionCSVData(_year, _countries, _outcome, _years_to_project, _revenue, _governance)
{
    var header = "country,iso,year";
    var ret = {str : null, errors : null};
    var headerDone = false;
    for (iCountry = 0; iCountry < _countries.length; iCountry++) 
    {
        var body = "";
        var _country = _countries[iCountry];
        var plotdata = getProjectionData(_year, _country, _outcome, _years_to_project, _revenue, _governance);

        if (plotdata.error) {
            if (ret.errors === null){
                ret.errors = []
            }
            ret.errors.push(countrycodes.get(_country) + ": " + plotdata.error);
            continue;
        }

        var data = plotdata.data;
        
        if(!headerDone){
            headerDone = true;
            for (const property in data[0].grpc) {
                header += "," + property;
            }

            data[0].additional.forEach(function (property) {
                header += "," + property.name;
            });

            data[0].gov.forEach(function (property) {
                header += "," + property.desc;
            });

            header += "\n";
            ret.str = header;
        }

        data.forEach(function (datarow) {
            var row = "";
            body += countrycodes.get(_country).replace(","," -") + "," + _country + "," + datarow.year + ",";

            for (const property in datarow.grpc) {
                body += datarow.grpc[property] + ",";
            }

            datarow.additional.forEach(function (property) {
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

function calcProjection(_year, _country, _outcome, _years_to_project, _revenue, _governance)
{
    // calculate the totals of projected effects for flow variables, and the
    // averages for stock variables.
    var ret = {data : null, error : null};
    var plotdata = getProjectionData(_year, _country, _outcome, _years_to_project, _revenue, _governance);
    
    if (plotdata.error){
        ret.error = plotdata.error;
        return ret;
    }
    
     var theOutcome = outcomesMap.get(outcome);
    
     var totals = new Map();
     plotdata.data.forEach(function(d){
         d.additional.forEach(function(result){
             if (totals.has(result.name)){
                 totProjectionPeriod = totals.get(result.name).projection + result.value
                 if (d.year >= plotdata.start_of_effect) {
                     totEffectPeriod = totals.get(result.name).effect + result.value
                 } 
                 else {
                     totEffectPeriod = 0
                 }
                 totals.set(result.name, {"projection" : totals.get(result.name).projection + result.value, "effect" : totEffectPeriod} )
             }
             else{
                totEffectPeriod = d.year >= plotdata.start_of_effect ? result.value : 0
                 totals.set(result.name, {"projection" : result.value, "effect" : totEffectPeriod});
             }
         })
     })
    
    if (theOutcome.isStockVar){
        var averages = new Map();
        totals.forEach( function(value, result){
            var result_avg_effect = plotdata.years_of_effect > 0 ? value.effect / plotdata.years_of_effect : 0;
            var result_avg_projection = value.projection / plotdata.data.length;
            averages.set(result, {"projection" : result_avg_projection, "effect" : result_avg_effect});            
        })
        ret.data = averages;
    }
    else{
        ret.data = totals;   
    }

    ret.start_of_effect = plotdata.start_of_effect;
    
    return ret;
}
