class PopData {
    constructor()
    {}
    nestdata(_csvdata) {
        this.nesteddata = d3.nest()
            .key(function (d) {
                return d.ISO;
            })
            .key(function (d) {
                return d.year;
            })
            .entries(_csvdata);
        
        this.firstyear = d3.min(_csvdata, d => d.year);
        this.lastyear = d3.max(_csvdata, d => d.year);
    }

    getvalue(_iso, _year, _var, interp=false) {
        var row = this.getrow(_iso, _year);
        if (!row) 
        {
            return NaN;
        } 
        else 
        {
            if (isNaN(row[_var]) || row[_var] === 0) 
            {
                if (interp)
                {
                    var series = this.getseries(_iso, _var);
                    var seriesFiltered = removeblanks(series);
                    var f = linearInterpolator(seriesFiltered, false);
                    return f(_year);
                }
                else 
                {
                    return NaN;
                }
            }
            else 
            {
                return row[_var];
            }
        }
    }
    
    getstring(_iso, _year, _var){
        var row = this.getrow(_iso, _year);
        if (!row)
            {
                return NaN;
            }
        return row[_var];
    }

    getrow(_iso, _year=-1) {
        var objIso = this.nesteddata.filter(function (d) {
            return d.key == _iso
        });
        if (objIso.length > 0) {
            if (_year == -1) {
                return objIso[0].values.map(function(d){return d.values[0]});
            } else {
                var objIsoYear = objIso[0].values.filter(function (d) {
                    return d.key == _year
                })
                if (objIsoYear.length > 0) {
                    return objIsoYear[0].values[0];
                }
            }
        }
    }

    getseries(_iso, _var){
        var series = this.getrow(_iso, -1);
        if (!series) {return NaN};
        return series.map(function(d){return [d.year, d[_var]];})
    }

    getcountries(){
        return this.nesteddata.map(x=>x.key)
    }
}

function removeblanks(_s){
    // given array s remove NaNs and zeros
    return _s.filter(function(d){return !isNaN(d[1]) && (d[1] !== 0)});
}