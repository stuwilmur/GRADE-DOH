/* 
Pure mathematical implementation of Equal Earth for D3 v3
*/
    function equalEarthRaw(lambda, phi) {
        var A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796,
            M = Math.sqrt(3) / 2;
        var theta = Math.asin(M * Math.sin(phi)),
            theta2 = theta * theta,
            theta6 = theta2 * theta2 * theta2;
        return [
            lambda * Math.cos(theta) / (M * (A1 + 3 * A2 * theta2 + theta6 * (7 * A3 + 9 * A4 * theta2))),
            theta * (A1 + A2 * theta2 + theta6 * (A3 + A4 * theta2))
        ];
    }

    var projection = d3.geo.projection(equalEarthRaw)
        .scale(150)
        //.translate([width / 2, height / 2]);

    var path = d3.geo.path().projection(projection);