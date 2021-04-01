var gdpDefByYear = new Map;

function typeAndSetDeflator(d) {
    
    var e = {}
    
    e.YEAR   = +d.YEAR;
    e.GDPDEF = +d.GDPDEF;
    
    return e;
}

function initDeflator(_gdpdef){
    gdpDefByYear = d3.nest().key(d=> d.YEAR).entries(_gdpdef);
}

function deflate(_amount, _yearIn, _yearOut = 2010){
    var defIn   = gdpDefByYear.filter(d=> d.key == _yearIn)
    var defOut  = gdpDefByYear.filter(d=> d.key == _yearOut)
    if (defIn === undefined || _amount < 0 || defOut === undefined){
        return NaN
    }
    defIn = defIn[0].values[0].GDPDEF;
    defOut = defOut[0].values[0].GDPDEF;
    return defOut / defIn * _amount;
}

function updateDeflator(){
    var amount = +document.getElementById("deflatorAmount").value;
    var year = document.getElementById("deflatorYear").value;
    var result = deflate(amount, year);
    document.getElementById("deflatorResult").value = result.toFixed(2);
}