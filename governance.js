var govMeasures = new Map([
    ["CORRUPTION", {
        desc: "Corruption",
        positive: true,
        fn: function (_corruption, 
                      _corruption_prev,
                      _corruption_lagged2, 
                      _grpc, 
                      _grpc_prev, 
                      _fixed_effect, 
                      _residual)
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
        fn: function (_goveffect,
                      _goveffect_prev,
                      _goveffect_lagged2,
                      _grpc, 
                      _grpc_prev, 
                      _fixed_effect, 
                      _residual)
        {
            var x = _goveffect_prev
                    -0.297756094448
                    - 0.289017172809 * _goveffect_prev 
                    + 0.0445136292801 * Math.log(_grpc_prev)
                    + _fixed_effect
                    + _residual;
            return x;
        }
    }],
    ["POLSTAB", {
        desc: "Political stability",
        positive: true,
        fn: function (_polstab, 
                      _polstab_prev, 
                      _polstab_lagged2,
                      _grpc, 
                      _grpc_prev,
                      _fixed_effect, 
                      _residual)
        {
            var x = _polstab_prev
                    -0.167147859521
                    - 0.243193314392 * _polstab_prev 
                    + 0.0241638211317 * Math.log(_grpc_prev)
                    + _fixed_effect
                    + _residual;
            return x;
        }
    }],
    ["REGQUALITY", {
        desc: "Regulatory quality",
        positive: true,
        fn: function (_regquality, 
                      _regquality_prev,
                      _regquality_lagged2, 
                      _grpc, 
                      _grpc_prev,
                      _fixed_effect, 
                      _residual)
        {
            if (_regquality_lagged2 > 0)
            {
                var x = _regquality_prev
                        - 0.261581113717 
                        - 0.0620541606802 * (_regquality_prev - _regquality_lagged2) 
                        - 0.237039319473 * _regquality_prev 
                        + 0.0395925282597 * Math.log(_grpc_prev)
                        + _fixed_effect
                        + _residual;
                return x;
            }
            else
            {
                // We don't yet have a value for the second lag of regulatory quality:
                // set the return value unchanged
                return _regquality;
            }
        }
    }],
    ["RULELAW", {
        desc: "Rule of law",
        positive: true,
        fn: function (_rulelaw, 
                      _rulelaw_prev,
                      _rulelaw_lagged2,
                      _grpc, 
                      _grpc_prev,
                      _fixed_effect, 
                      _residual)
        {
            if (_rulelaw_lagged2 > 0)
            {
                var x = _rulelaw_prev 
                        -0.189816187425 
                        + 0.0362663179499 * (Math.log(_grpc) - Math.log(_grpc_prev))
                        - 0.246288840943 * _rulelaw_prev 
                        - 0.040001478273 * (Math.log(_rulelaw_prev) - Math.log(_rulelaw_lagged2)) 
                        + 0.0287195914492 * Math.log(_grpc_prev)
                        + _fixed_effect
                        + _residual;
                return x;
            }
            else
            {
                // We don't yet have a value for the second lag of rule of law:
                // set the return value unchanged
                return _rulelaw;
            }
        }
    }],
    ["VOICE", {
        desc: "Voice and accountability",
        positive: true,
        fn: function (_voice, 
                      _voice_prev,
                      _voice_lagged2, 
                      _grpc, 
                      _grpc_prev, 
                      _fixed_effect, 
                      _residual)
        {
            var x = _voice;
            return x;
        }
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

    var grpcOrig_prev;
    var grpcImproved_prev;

    var gov_prev = null;
    var gov_lagged2 = null;
    var govImproved_prev = null;
    var govImproved_lagged2 = null;

    for (i = 0; i < (_yearsToForecast - 1); i++)
    {
        var year = _startYear + i;
        
        var pop = popdata.getrow(_iso, year);
        if (!pop) return NaN;
        
        var grpcOrig;
        var grpcImproved;

        var gov = new Map();
        var govImproved = new Map();
        
        if (i == 0)
        {
            // Start with fixed values on first iteration
            grpcOrig = popdata.getvalue(_iso, year, "GRPERCAP", true)
            grpcImproved = grpcOrig * _grpcMultiplier

            govMeasures.forEach(function(value, measure) {
                gov.set(measure, pop[measure])
                govImproved.set(measure, pop[measure])
            });
        }
        else
        {
            grpcOrig = popdata.getvalue(_iso, year, "GRPERCAP", true)
            grpcImproved = grpcOrig * _grpcMultiplier

            govMeasures.forEach(function(value, measure) {
                var residual;

                // Forecast with original GRPC
                gov.set(measure, pop[measure])
                var fixedEffect = fixdata.getvalue(_iso, year, measure, true);
                // On timestep 1, pass -1 for the unavailable second lagged meausre
                var measure_lagged2 = gov_lagged2 == null ? -1 : gov_lagged2.get(measure);
                var measureEquationForecast = govMeasures.get(measure).fn(pop[measure],
                                                                          gov_prev.get(measure),
                                                                          measure_lagged2,
                                                                          grpcOrig, 
                                                                          grpcOrig_prev,
                                                                          fixedEffect,
                                                                          0);
                // Compute the residual
                residual = pop[measure] - measureEquationForecast;

                // Forecast with improved GRPC and apply the residual
                // On timestep 1, pass -1 for the unavailable second lagged meausre
                var measureImproved_lagged2 = govImproved_lagged2 == null ? -1 : govImproved_lagged2.get(measure)
                var measureWithIncreasedGovRev = govMeasures.get(measure).fn(pop[measure],
                                                                             govImproved_prev.get(measure),
                                                                             measureImproved_lagged2,
                                                                             grpcImproved,
                                                                             grpcImproved_prev,
                                                                             fixedEffect,
                                                                             residual)
                govImproved.set(measure, measureWithIncreasedGovRev)
            });
        }
        // Store results
        table.set(year, govImproved)

        // Timestepping
        grpcOrig_prev = grpcOrig;
        grpcImproved_prev = grpcImproved;

        govImproved_lagged2 = govImproved_prev;
        govImproved_prev = govImproved;

        gov_lagged2 = gov_prev;
        gov_prev = gov;
    }

    return (table)
}