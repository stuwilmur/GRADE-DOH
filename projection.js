const years_to_wait = 5;

function getprojecteddata(_firstyear, _country, _outcome, _years_to_project) {
    // Takes a baseline year an increase in revenue, and calculates the corresponding % increase in grpc:
    // projects this by: allowing five years for increased revenue to act, where there is no effect;
    // applying the percentage increase for all remaining years (up to a total of years_to_project years). 
    
    var ret = { data: [], error: null, years_of_effect: 0 };
    var grpcPcIncrease = 0;
    for (y = _firstyear; y < popdata.lastyear && ((y - _firstyear) <= _years_to_project); y++) {
        var revenues = getRevenue(_country, y, method);
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

        var computed = computeResult(_country, y, _outcome, grpc, revenues["historical grpc"], governance);
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

function getplotcsvdata(_year, _country, _outcome, _years_to_project)
{
    var plotdata = getprojecteddata(_year, _country, _outcome, _years_to_project);
    
    if (plotdata.error){
        return undefined;
    }
    
    var data = plotdata.data;
    
    var header = "country,iso,year";
    
    for (const property in data[0].grpc){
        header += "," + property;
    }
    
    data[0].additional.forEach(function(property){
        header += "," + property.name;
    })
    
    header += "\n";
    
    var body = "";
    data.forEach(function(datarow){
        var row = "";
        body += countrycodes.get(_country) + "," + _country + "," + datarow.year + ","
        
        for (const property in datarow.grpc){
            body += datarow.grpc[property] + ",";        
        }
        
        datarow.additional.forEach(function(property){
            body += property.value + ",";
        })
        body += row + "\n";
    })
    return header + body;
}

function calcprojection(_year, _country, _outcome, _years_to_project)
{
    // calculate the totals of projected effects for flow variables, and the
    // averages for stock variables.
    var ret = {data : null, error : null};
    var plotdata = getprojecteddata(_year, _country, _outcome, _years_to_project);
    
    if (plotdata.error){
        ret.error = plotdata.error;
        return ret;
    }
    
     var theOutcome = outcomesMap.get(outcome);
    
     var totals = new Map();
     plotdata.data.forEach(function(d){
         d.additional.forEach(function(result){
             if (totals.has(result.name)){
                 totals.set(result.name, totals.get(result.name) + result.value )
             }
             else{
                 totals.set(result.name, result.value);
             }
         })
     })
    
    if (theOutcome.isStockVar){
        var averages = new Map();
        totals.forEach( function(value, result){
            var result_avg = plotdata.years_of_effect > 0 ? value / plotdata.years_of_effect : 0;
            averages.set(result, result_avg);            
        })
        ret.data = averages;
    }
    else{
        ret.data = totals;   
    }
    
    return ret;
}
