var govMeasures = new Map([
    ["CORRUPTION", {
        desc: "Corruption",
        positive: true,
        fn: function (_corruption_prev, _grpc_prev, _fixed_effect, _residual)
        {
            var x = _corruption_prev
                    -0.262062915863 
                    - 0.268386527335 * _corruption_prev 
                    + 0.0388009869267 * Math.log(_grpc_prev)
                    + _fixed_effect
                    + _residual;
            return x;
        }
    }],
    ["GOVEFFECT", {
        desc: "Government effectiveness",
        positive: true,
    }],
    ["POLSTAB", {
        desc: "Political stability",
        positive: true,
    }],
    ["REGQUALITY", {
        desc: "Regulatory quality",
        positive: true,
    }],
    ["RULELAW", {
        desc: "Rule of law",
        positive: true,
    }],
    ["VOICE", {
        desc: "Voice and accountability",
        positive: true,
    }],
]);

function getGov(_type, _iso, _year, _gov, _grpc = 0) {
    var x = NaN
    if (_gov.model == "EXOGENOUS")
    {
        var pop = popdata.getrow(_iso, _year);
        if (!pop) return NaN;
        // Exogenous governance model
        x = pop[_type] + (govMeasures.get(_type).positive == true ? _gov.value : -_gov.value);
    }
    else if (_gov.model == null || (_gov.model == "ENDOGENOUS" && _gov.table == null))
    {
        /* 
         * Just use the true value from the governance dataset. This method
         * is also used if the endogenous model is selected, but no table
         * has been supplied, which means that the function is not called
         * from a projection
         */
        var pop = popdata.getrow(_iso, _year);
        if (!pop) return NaN;
        x = pop[_type]
    }
    else // ENDOGENOUS - use table lookup
    {
        if (_gov.table.has(_year))
        {
            if (_gov.table.get(_year).has(_type))
            {
                x = _gov.table.get(_year).get(_type);
            }
        }
    }
    // Limit all measures to the range [-2.5, 2.5]
    var limited = Math.min(Math.max(-2.5, x), 2.5)
    return limited;
}

function forecastGovernance(_iso, _startYear, _yearsToForecast, _grpcMultiplier)
{
    var table = new Map()
    for (i = 0; i < (_yearsToForecast - 1); i++)
    {
        var year = _startYear + i;
        var pop = popdata.getrow(_iso, year);
        if (!pop) return NaN;
        
        var grpcOrig;
        var grpcOrig_prev;
        var grpcImproved;
        var grpcImproved_prev;
        var gov = new Map();
        var gov_prev;
        var govImproved = new Map();
        var govImproved_prev;
        
        if (i == 0)
        {
            // Start with fixed values on first iteration
            grpcOrig = popdata.getvalue(_iso, year, "GRPERCAP", true)
            grpcImproved = grpcOrig * _grpcMultiplier

            if (true)
            {
                var measure = "CORRUPTION"
                gov.set(measure, pop[measure])
                govImproved.set(measure, pop[measure])
            }
        }
        else
        {
            grpcOrig = popdata.getvalue(_iso, year, "GRPERCAP", true)
            grpcImproved = grpcOrig * _grpcMultiplier

            if (true)
            {
                var measure = "CORRUPTION"
                var residual;

                gov.set(measure, pop[measure])
                var fixedEffect = fixdata.getvalue(_iso, year, measure, true);
                var measureEquationForecast = govMeasures.get(measure).fn(gov_prev.get(measure), 
                                                                          grpcOrig_prev,
                                                                          fixedEffect,
                                                                          0)
                residual = pop[measure] - measureEquationForecast;
                var measureWithIncreasedGovRev = govMeasures.get(measure).fn(govImproved_prev.get(measure),
                                                                                grpcImproved_prev,
                                                                                fixedEffect,
                                                                                residual)
                govImproved.set(measure, measureWithIncreasedGovRev)
            }
        }
        // Store results
        table.set(year, govImproved)

        // Advance
        grpcOrig_prev = grpcOrig;
        grpcImproved_prev = grpcImproved;
        govImproved_prev = govImproved;
        gov_prev = gov;
    }

    return (table)
}