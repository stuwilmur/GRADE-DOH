const years_to_wait = 5;

function getProjectionData(_firstyear, _country, _outcome, _years_to_project, _method) {
    // Takes a baseline year an increase in revenue, and calculates the corresponding % increase in grpc:
    // projects this by: allowing five years for increased revenue to act, where there is no effect;
    // applying the percentage increase for all remaining years (up to a total of years_to_project years). 
    
    var ret = { data: [], error: null, years_of_effect: 0 };
    var grpcPcIncrease = 0;
    for (y = _firstyear; y < popdata.lastyear && ((y - _firstyear) <= _years_to_project); y++) {
        var revenues = getRevenue(_country, y, _method);
        if (revenues === undefined) {
            if (ret.error === null) { ret.error = []; }
            ret.error.push("GRPC not available for " + y);
            return ret;
        }
        if (y == _firstyear) {
            grpcPcIncrease = revenues["percentage increase"];
            grpc = revenues["historical grpc"];
        } else if ((y - _firstyear) < years_to_wait) {
            grpc = revenues["historical grpc"];
        } else {
            grpc = revenues["historical grpc"] * (1 + grpcPcIncrease);
            ret.years_of_effect += 1;
        }

        var computed = computeResult(_country, y, _outcome, grpc, revenues["historical grpc"], governance, 1E-6);
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

    ret.start_of_effect = Math.min(popdata.lastyear, _firstyear + years_to_wait);
    return (ret);
}

function getProjectionCSVData(_year, _countries, _outcome, _years_to_project, _method)
{
    var header = "country,iso,year";
    var ret = {str : null, errors : null};
    var headerDone = false;
    for (i = 0; i < _countries.length; i++) 
    {
        var body = "";
        var _country = _countries[i];
        var plotdata = getProjectionData(_year, _country, _outcome, _years_to_project, _method);

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

            header += "\n";
            ret.str = header;
        }

        data.forEach(function (datarow) {
            var row = "";
            body += countrycodes.get(_country) + "," + _country + "," + datarow.year + ",";

            for (const property in datarow.grpc) {
                body += datarow.grpc[property] + ",";
            }

            datarow.additional.forEach(function (property) {
                body += property.value + ",";
            });
            body += row + "\n";
        });
        ret.str += body;
    };
    return ret;
}

function calcProjection(_year, _country, _outcome, _years_to_project, _method)
{
    // calculate the totals of projected effects for flow variables, and the
    // averages for stock variables.
    var ret = {data : null, error : null};
    var plotdata = getProjectionData(_year, _country, _outcome, _years_to_project, _method);
    
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
