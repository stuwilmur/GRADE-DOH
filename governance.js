function L1(x0, _measure)
{
    return x0[_measure];
}

function D1(x1, x0, _measure)
{
    return (L1(x1, _measure) - L1(x0, _measure));
}

function LGOVREV_1(x0)
{
    return Math.log(x0.GRPERCAP);
}

function DLGOVREV_1(x1, x0) 
{
    return (LGOVREV_1(x1) - LGOVREV_1(x0)); //!! What about interpolating for GRPC?
}

var govMeasures = new Map([
    ["CORRUPTION", {
        desc: "Corruption",
        positive: true,
        fn : function(x1, x0) {
            -0.262062915863 
            - 0.268386527335 * L1(x0, "CORRUPTION") 
            + 0.0388009869267 * LGOVREV_1(x0) + FE
        }
    }],
    ["GOVEFFECT", {
        desc: "Government effectiveness",
        positive: true,
        fn : function(x1, x0) {
            -0.297756094448 
            - 0.289017172809 * L1(x0, "GOVEFFECT") 
            + 0.0445136292801 * LGOVREV_1(x0) + FE
        }
    }],
    ["POLSTAB", {
        desc: "Political stability",
        positive: true,
        fn : function(x1, x0) {
            -0.167147859521 
            - 0.243193314392 * L1(x0, "POLSTAB") 
            + 0.0241638211317 * LGOVREV_1(x0) + FE
        }
    }],
    ["REGQUALITY", {
        desc: "Regulatory quality",
        positive: true,
        fn : function(x1, x0) {
            -0.261581113717 
            - 0.0620541606802 * D1(x1, x0, "REGQUALITY") 
            - 0.237039319473 * L1(x0, "REGQUALITY") 
            + 0.0395925282597 * LGOVREV1(x0) 
            + FE
        }
    }],
    ["RULELAW", {
        desc: "Rule of law",
        positive: true,
        fn : function(x1, x0) {
            -0.189816187425 
            + 0.0362663179499 * D1(x1, x0, "RULELAW") 
            - 0.246288840943 * L1(x0, "RULELAW") 
            - 0.040001478273 * DLGOVREV_1(x1, x0) 
            + 0.0287195914492 * LGOVREV_1(x0) + FE
        }
    }],
    ["VOICE", {
        desc: "Voice and accountability",
        positive: true
    }],
]);

//!! TODO: don't pass in _d, compute from popdata.
function getGov(_type, _d, _gov) {
    var x = NaN
    if (_gov > -100) // Governance of -100 is a flag to use the endogenous model
    {
        // Exogenous governance model
        x = _d[_type] + (govMeasures.get(_type).positive == true ? _gov : -_gov);
    }
    else
    {
        x = 0; //!! TODO
    }
    var limited = Math.min(Math.max(-2.5, x), 2.5)
    return limited;
}