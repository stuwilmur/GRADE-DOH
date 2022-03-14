function D1(x1, x0)
{
    return (x1 - x0);
}

function LOG(x0)
{
    return Math.log(x0);
}

function DLGOVREV_1(x1, x0) 
{
    return D1(LOG(x1), LOG(x0));
}

var govMeasures = new Map([
    ["CORRUPTION", {
        desc: "Corruption",
        positive: true,
        fn : function(x1, x0, r1, r0, fe) {
            f = -0.262062915863 
                - 0.268386527335 * x0 
                + 0.0388009869267 * LOG(r0) 
                + fe;
            return f;
        }
    }],
    ["GOVEFFECT", {
        desc: "Government effectiveness",
        positive: true,
        fn : function(x1, x0, r1, r0, fe) {
            f = -0.297756094448 
                - 0.289017172809 * x0 
                + 0.0445136292801 * LOG(r0) 
                + fe;
            return f;
        }
    }],
    ["POLSTAB", {
        desc: "Political stability",
        positive: true,
        fn : function(x1, x0, r1, r0, fe) {
            f = -0.167147859521 
                - 0.243193314392 * x0 
                + 0.0241638211317 * LOG(r0) 
                + fe;
            return f;
        }
    }],
    ["REGQUALITY", {
        desc: "Regulatory quality",
        positive: true,
        fn : function(x1, x0, r1, r0, fe) {
            f = -0.261581113717 
                - 0.0620541606802 * D1(x1, x0) 
                - 0.237039319473 * x0 
                + 0.0395925282597 * LOG(r0) 
                + fe
            return f;
        }
    }],
    ["RULELAW", {
        desc: "Rule of law",
        positive: true,
        fn : function(x1, x0, r1, r0, fe) {
            f = -0.189816187425 
                + 0.0362663179499 * D1(x1, x0) 
                - 0.246288840943 * x0 
                - 0.040001478273 * DLGOVREV_1(r1, r0) 
                + 0.0287195914492 * LOG(r0) 
                + fe;
            return f;
        }
    }],
    ["VOICE", {
        desc: "Voice and accountability",
        positive: true,
        fn : function(x1, x0, r1, r0, fe) {
            return x1; 
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
    else if (_gov.model == null)
    {
        var pop = popdata.getrow(_iso, _year);
        if (!pop) return NaN;
        x = pop[_type]
    }
    else // ENDOGENOUS
    {
        current_gov_measure = popdata.getvalue(_iso, _year, _type, true);
        previous_gov_measure = popdata.getvalue(_iso, _year - 1, _type, true);
        current_grpc = _grpc;
        previous_grpc = popdata.getvalue(_iso, _year - 1, "GRPERCAP", true);
        fixed_effect = fixdata.getvalue(_iso, _year - 1, _type, true)
        x = current_gov_measure + govMeasures.get(_type).fn(current_gov_measure, 
                                                            previous_gov_measure,
                                                            current_grpc, 
                                                            previous_grpc,
                                                            fixed_effect,)
    }
    // Limit all measures to the range [-2.5, 2.5]
    var limited = Math.min(Math.max(-2.5, x), 2.5)
    return limited;
}