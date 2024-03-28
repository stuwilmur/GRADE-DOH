// **** add or update outcomes here ****
var outcomesList = [
        ["WATERBASIC",
        {
            name: "Basic water (SDG 6)",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "The percentage of the population drinking water from an improved source, provided collection time is not more than 30 minutes for a round trip.",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: true,
            target: 100,
            coeffs : new Map(
                [
                    [1, 0.002777],
                    [12, -8.16E-05],
                    [14, 0.000788],
                    [15, 0.001012],
                    [2, -154.0232],
                    [22, 108.3361],
                    [24, 247.8044]
                ]),
            fn : function(_grpc, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                var l = this.coeffs;
                var res = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 12) * g("POLSTAB") + C(l, 14) * g("RULELAW") +
                C(l, 15) * g("GOVEFFECT")) * (_grpc - (C(l, 2) + C(l, 22) * g("POLSTAB") + C(l, 24) *
                g("RULELAW")))));
                return res;
                },
            inv_fn : function(_target, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov);
                var l = this.coeffs;
                var A = -(C(l, 1) + C(l, 12) * g("POLSTAB") + C(l, 14) * g("RULELAW") +
                C(l, 15) * g("GOVEFFECT"));
                var B = (C(l, 2) + C(l, 22) * g("POLSTAB") + C(l, 24) * g("RULELAW"));
                var res = Math.log(100.0 / _target - 1.0) / A + B;
                return res; 
            },
        }],
		["WATERSAFE",
        {
            name: "Safe water (SDG 6)",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: `The percentage of the population using drinking water from an 
            improved source that is accessible on premises, available when needed 
            and free from faecal and priority chemical contamination.`,
            isStockVar : true,
            isInterpolated : false,
            isPercentage: true,
            target: 100,
            coeffs : new Map(
                [
                    [1, 0.002115],
                    [11, 0.001616],
                    [14, 0.001642],
                    [15, -0.001307],
                    [16, -0.000999],
                    [2, 593.1014],
                    [21, -228.0095],
                    [22, 57.83624],
                    [23, -270.4070],
                    [25, 143.7995],
                    [26, 168.7410]
                ]),
            fn :    function(_grpc, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                var l = this.coeffs;
                var res = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") + 0 * g("POLSTAB") + 0 *
                g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) * g("VOICE")) *
                (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") + C(l, 23) *
                g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")))));
                return res;
            },
            inv_fn :   function(_target, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov);
                var l = this.coeffs;
                var A = -(C(l, 1) + C(l, 11) * g("CORRUPTION") + 0 * g("POLSTAB") + 0 *
                g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) * g("VOICE"))
                var B = (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") + C(l, 23) *
                g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE"))
                var res = Math.log(100.0 / _target - 1.0) / A + B;
                return res; 
            },
        }],
        ["SANITBASIC",
        {
            name: "Basic sanitation (SDG 6)",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: `The percentage of the population using at least improved 
            sanitation facilities that are not shared with other households.`,
            isStockVar : true,
            isInterpolated : false,
            isPercentage: true,
            target: 100,
            coeffs : new Map(
                [
                    [1, 0.002240],
                    [11, -0.001308],
                    [12, -0.000341],
                    [13, 0.000955],
                    [14, 0.000705],
                    [15, 0.000796],
                    [16, -0.000470],
                    [2, 233.9464],
                    [21, 235.0595],
                    [22, 75.44795],
                    [23, -434.4536],
                    [25, -351.7824],
                    [26, 254.2561]
                ]),
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                var l = this.coeffs;
                res = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") + C(l, 12) * g("POLSTAB") +
                C(l, 13) * g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) *
                g("VOICE")) * (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") +
                C(l, 23) * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")))));
                return res;
            },
            inv_fn : function(_target, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov);
                var l = this.coeffs;
                var A = -(C(l, 1) + C(l, 11) * g("CORRUPTION") + C(l, 12) * g("POLSTAB") +
                C(l, 13) * g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) *
                g("VOICE"))
                var B = (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") +
                C(l, 23) * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE"))
                var res = Math.log(100.0 / _target - 1.0) / A + B;
                return res;
            }
        }],
		["SANITSAFE",
        {
            name: "Safe sanitation (SDG 6)",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: `The percentage of the population using improved sanitation 
            facilities that are not shared with other households and where 
            excreta are safely disposed of in situ or transported and treated 
            offsite.`,
            isStockVar : true,
            isInterpolated : false,
            isPercentage: true,
            target: 100,
            coeffs : new Map(
                [
                    [1, 7.29E-05],
                    [11, -5.98E-05],
                    [13, 0.000101],
                    [16, -1.99E-05],
                    [2, 4264.142],
                    [21, 11489.15],
                    [23, -3922.251],
                    [24, -16243.73],
                    [25, -4314.271],
                    [26, 2870.706]
                ]),
            fn :    function(_grpc, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                var l = this.coeffs;
                var res = 100 / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") + 0 * g("POLSTAB") + C(l, 13) *
                g("REGQUALITY") + 0 * g("RULELAW") + 0 * g("GOVEFFECT") + C(l, 16) * g("VOICE")) *
                (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + 0 * g("POLSTAB") + C(l, 23) *
                g("REGQUALITY") + C(l, 24) * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")))));
                return res;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                var l = this.coeffs;
                var A = -(C(l, 1) + C(l, 11) * g("CORRUPTION") + 0 * g("POLSTAB") + C(l, 13) *
                g("REGQUALITY") + 0 * g("RULELAW") + 0 * g("GOVEFFECT") + C(l, 16) * g("VOICE"))
                var B = (C(l, 2) + C(l, 21) * g("CORRUPTION") + 0 * g("POLSTAB") + C(l, 23) *
                g("REGQUALITY") + C(l, 24) * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE"))
                var res = Math.log(100.0 / _target - 1.0) / A + B;
                return res;
            },
        }],
        ["U5MSURV",
        {
            name: "Under-5 survival (SDG 3)",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100], 
            desc: "Under-5 survival",
            isStockVar : false,
            isInterpolated : false,
            isPercentage: true,
            target: 99.9, // upper limit of mortality of 1 in 1000
            coeffs : new Map(
                [
                    [1, 0.000487660315618],
                    [12, -0.0000292129327268],
                    [15, -0.0000889823437485],
                    [16, 0.0000441671186032],
                    [2, 5986.3033303],
                    [21, 295.792385161],
                    [22, -218.908408761],
                    [23, -307.070582687],
                    [25, -1800.65834264],
                    [26, 389.563410216]
         
                ]),
            fn : function(_grpc, _iso, _year, _gov) {
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                var l = this.coeffs;
                var res = 100 / (1 + Math.exp(-(C(l, 1) + 0 * g("CORRUPTION") + C(l, 12) * g("POLSTAB") 
                + 0 * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) * g("VOICE")) 
                * (_grpc - (-C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") + C(l, 23) 
                * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")))));
                return res;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                var l = this.coeffs;
                var A = -(C(l, 1) + 0 * g("CORRUPTION") + C(l, 12) * g("POLSTAB") 
                + 0 * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 15) * g("GOVEFFECT") + C(l, 16) * g("VOICE"))
                var B = (-C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") + C(l, 23) 
                * g("REGQUALITY") + 0 * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE"))
                var res = Math.log(100.0 / _target - 1.0) / A + B;
                return res;
            },
         }],
        ["MMRSURV",
        {
            name: "Maternal survival (SDG 3)",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 100],
            desc: "Maternal survival",
            isStockVar : false,
            isInterpolated : false,
            isPercentage: true,
            target: 100,
            coeffs : new Map(
                [
                     [1, 0.00162428846511],
                     [11, 0.000480954347841],
                     [12, -0.000245303543036],
                     [14, -0.000993435385523],
                     [15, 0.000635303615423],
                     [16, 0.000368281180655],
                     [2, -1708.97971425],
                     [21, 854.424918802],
                     [22, -328.239576261],
                     [23, -193.518329888],
                     [24, -1354.51903559],
                     [25, 488.294796998],
                     [26, 451.468766258]
                ]),
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                var l = this.coeffs;
                var res = 95 + (100 - 95) / (1 + Math.exp(-(C(l, 1) + C(l, 11) * g("CORRUPTION") 
                + C(l, 12) * g("POLSTAB") + 0 * g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") 
                + C(l, 16) * g("VOICE")) * (_grpc - (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") 
                + C(l, 23) * g("REGQUALITY") + C(l, 24) * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE")))));
                return res;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                var l = this.coeffs;
                var A = -(C(l, 1) + C(l, 11) * g("CORRUPTION") 
                + C(l, 12) * g("POLSTAB") + 0 * g("REGQUALITY") + C(l, 14) * g("RULELAW") + C(l, 15) * g("GOVEFFECT") 
                + C(l, 16) * g("VOICE"))
                var B = (C(l, 2) + C(l, 21) * g("CORRUPTION") + C(l, 22) * g("POLSTAB") 
                + C(l, 23) * g("REGQUALITY") + C(l, 24) * g("RULELAW") + C(l, 25) * g("GOVEFFECT") + C(l, 26) * g("VOICE"))
                var res = Math.log((100.0 - 95.0) / (_target - 95) - 1) / A + B;
                return res;
            },
         }],
         ["PRIMARYSCHOOL",
        {
            name: "Primary school attendance",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 1],
            desc: "Proportion of primary-school-age children who attend primary school",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: false,
            target: 1,
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                const result =
                1.0 /
                (1.0 +
                Math.exp(
                -(
                    0.589328646943 +
                    0.124605780877 * g("CORRUPTION") -
                    0.022521406946 * g("POLSTAB") -
                    0.0395534844738 * g("REGQUALITY") -
                    0.0897099747213 * g("RULELAW") +
                    0.155803357829 * g("GOVEFFECT") +
                    0.168729825949 * g("VOICE")
                ) *
                    (Math.log(_grpc) -
                    (2.19330330895 +
                        1.5612672242 * g("CORRUPTION") -
                        0.763089270327 * g("POLSTAB") -
                        0.749356781002 * g("RULELAW") +
                        1.67274041346 * g("VOICE"))),
                ));
                return result;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                const A = -(
                    0.589328646943 +
                    0.124605780877 * g("CORRUPTION") -
                    0.022521406946 * g("POLSTAB") -
                    0.0395534844738 * g("REGQUALITY") -
                    0.0897099747213 * g("RULELAW") +
                    0.155803357829 * g("GOVEFFECT") +
                    0.168729825949 * g("VOICE")
                  );
                  const B =
                    2.19330330895 +
                    1.5612672242 * g("CORRUPTION") -
                    0.763089270327 * g("POLSTAB") -
                    0.749356781002 * g("RULELAW") +
                    1.67274041346 * g("VOICE");
                  const result = Math.exp(Math.log(1.0 / _target - 1.0) / A + B);
                  return result;
            },
         }],
         ["LOWERSCHOOL",
        {
            name: "Lower-secondary school attendance",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 1],
            desc: "Proportion of lower-school-age children who attend lower school",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: false,
            target: 1,
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                const result =
                1.0 /
                (1.0 +
                Math.exp(
                    -(
                    0.679930922743 +
                    0.11304679055 * g("CORRUPTION") -
                    0.0707268839476 * g("RULELAW") +
                    0.223730449682 * g("GOVEFFECT") +
                    0.109364715484 * g("VOICE")
                    ) *
                    (Math.log(_grpc) -
                        (3.85500426861 +
                        0.753438911315 * g("CORRUPTION") -
                        0.254913022991 * g("POLSTAB") +
                        0.104173700723 * g("REGQUALITY") -
                        0.516714762024 * g("RULELAW") +
                        0.709822881619 * g("GOVEFFECT") +
                        0.497976176438 * g("VOICE"))),
                ));
                return result;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                const A = -(
                    0.679930922743 +
                    0.11304679055 * g("CORRUPTION") -
                    0.0707268839476 * g("RULELAW") +
                    0.223730449682 * g("GOVEFFECT") +
                    0.109364715484 * g("VOICE")
                  );
                const B =
                3.85500426861 +
                0.753438911315 * g("CORRUPTION") -
                0.254913022991 * g("POLSTAB") +
                0.104173700723 * g("REGQUALITY") -
                0.516714762024 * g("RULELAW") +
                0.709822881619 * g("GOVEFFECT") +
                0.497976176438 * g("VOICE");
                const result = Math.exp(Math.log(1.0 / _target - 1.0) / A + B);
                return result;
            },
         }],
         ["UPPERSCHOOL",
        {
            name: "Upper-secondary school attendance",
            loCol: "#dee5f8",
            hiCol: "#e09900",
            fixedExtent: [0, 1],
            desc: "Proportion of upper-school-age children who attend upper school",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: false,
            target: 1,
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                const result =
                1.0 /
                (1.0 +
                Math.exp(
                    -(
                    0.469760642832 -
                    0.0249360651581 * g("POLSTAB") +
                    0.123301081621 * g("REGQUALITY")
                    ) *
                    (Math.log(_grpc) -
                        (5.22968033236 +
                        0.236802808614 * g("CORRUPTION") -
                        0.14616763297 * g("POLSTAB") -
                        0.287536755867 * g("VOICE"))),
                ));
                return result;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                const A = -(
                    0.469760642832 -
                    0.0249360651581 * g("POLSTAB") +
                    0.123301081621 * g("REGQUALITY")
                  );
                const B =
                5.22968033236 +
                0.236802808614 * g("CORRUPTION") -
                0.14616763297 * g("POLSTAB") -
                0.287536755867 * g("VOICE");
                const result = Math.exp(Math.log(1.0 / _target - 1.0) / A + B);
                return result;
            },
         }],
         ["INVPRIMARYTEACHERS",
        {
            name: "Primary school teacher ratio",
            
            loCol: "#dee5f8",
	    hiCol: "#e09900",            
	    fixedExtent: [0.005, 0.1],
            desc: "Number of primary school teachers per lower school-age child",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: false,
            target: 10,
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                const result = 
		1.0 / 
		  (1.0 + 
		  Math.exp(
		   	-(0.235464224795 - 
			0.00905813072628 * g("POLSTAB") + 
			0.033709633743 * g("RULELAW") -
			0.0218140639331 * g("VOICE")) * 
			(Math.log(_grpc) - 
			(19.7561871646 + 
			0.678880371607 * g("POLSTAB") -
			0.450545238623 * g("REGQUALITY") -
			2.02637551438 * g("RULELAW") + 
			0.41977998279 * g("GOVEFFECT") +
			1.13267641272 * g("VOICE")))
			));
                	return result;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                const A = -(
			0.235464224795 - 
			0.00905813072628 * g("POLSTAB") + 
			0.033709633743 * g("RULELAW") -
			0.0218140639331 * g("VOICE")
                  );
                const B =
                19.7561871646 + 
		0.678880371607 * g("POLSTAB") -
		0.450545238623 * g("REGQUALITY") -
		2.02637551438 * g("RULELAW") + 
		0.41977998279 * g("GOVEFFECT") +
		1.13267641272 * G("VOICE")
                const result = Math.exp(Math.log(1.0 / _target - 1.0) / A + B);
                return result;
            },
         }],
         ["INVLOWERTEACHERS",
        {
            name: "Lower school teacher ratio",
            
            loCol: "#dee5f8",
	    hiCol: "#e09900",            
	    fixedExtent: [0.005, 0.1],
            desc: "Number of lower school teachers per lower school-age child",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: false,
            target: 10,
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                const result = 
		1.0 / 
		(1.0 + 
		Math.exp(
			-(
			0.249125249935 - 
			0.0380480729266 * g("REGQUALITY") -
			0.0232115856432 * g("RULELAW") + 
			0.024632796074 * g("GOVEFFECT") + 
			0.052699249015 * g("VOICE")) * 
			(Math.log(_grpc) - 
				(18.3150008653 - 
				0.450794543557 * g("CORRUPTION") + 
				0.377434867789 * g("POLSTAB")
				+1.67273746972 * g("REGQUALITY") - 
				2.26693766319 * g("VOICE")))
			 ));
                return result;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                const A = -(
			0.249125249935 - 
			0.0380480729266 * g("REGQUALITY") -
			0.0232115856432 * g("RULELAW") + 
			0.024632796074 * g("GOVEFFECT") + 
			0.052699249015 * g("VOICE")
                  );
                const B =
                18.3150008653 - 
		0.450794543557 * g("CORRUPTION") + 
		0.377434867789 * g("POLSTAB") +
		1.67273746972 * g("REGQUALITY") - 
		2.26693766319 * g("VOICE");
                const result = Math.exp(Math.log(1.0 / _target - 1.0) / A + B);
                return result;
            },
         }],
         ["INVUPPERTEACHERS",
        {
            name: "Upper school teacher ratio",
            
            loCol: "#dee5f8",
	    hiCol: "#e09900",            
	    fixedExtent: [0.005, 0.1],
            desc: "Number of upper school teachers per upper school-age child",
            isStockVar : true,
            isInterpolated : false,
            isPercentage: false,
            target: 10,
            fn :    function(_grpc, _iso, _year, _gov) { 
                g = _type => getGov(_type, _iso, _year, _gov, _grpc);
                const result 
		= 1.0 /
		(1.0 + 
		Math.exp(
			-(0.298043732869 + 
			0.0412424811223 * g("CORRUPTION") + 
			0.00859565812208 * g("POLSTAB") - 
			0.0777401202 * g("RULELAW") -
			0.0207754476388 * g("GOVEFFECT")
			+0.0673886052541 * g("VOICE")) *
			(Math.log(_grpc) - 
				(17.0358391075 - 
				1.18785253583 * g("CORRUPTION") +
				1.65861596332 * g("RULELAW") + 
				0.85305123799*g("GOVEFFECT") - 
				2.0226464466 * g("VOICE")))
			));
                return result;
            },
            inv_fn : function(_target, _iso, _year, _gov){
                g = _type => getGov(_type, _iso, _year, _gov);
                const A = -(0.298043732869 + 
			0.0412424811223 * g("CORRUPTION") + 
			0.00859565812208 * g("POLSTAB") - 
			0.0777401202 * g("RULELAW")-
			0.0207754476388 * g("GOVEFFECT")
			+0.0673886052541 * g("VOICE")
                  );
                const B =
                17.0358391075 - 
		1.18785253583 * g("CORRUPTION") +
		1.65861596332 * g("RULELAW") + 
		0.85305123799*g("GOVEFFECT") - 
		2.0226464466 * g("VOICE");
                const result = Math.exp(Math.log(1.0 / _target - 1.0) / A + B);
                return result;
            },
         }],
];

var outcomesMap = new Map(outcomesList);

function C(_coeffs, index) {
    return _coeffs.get(index);
}

function computegovernance(_iso, _year, _gov, _grpc) {
    var ret = new Map();
    govMeasures.forEach(function (measure, govtype) {
        var gov_value = getGov(govtype, _iso, _year, _gov, _grpc);
        ret.set(govtype, {
            desc: measure.desc,
            value: gov_value,
            delta: gov_value - getGov(govtype, _iso, _year, {model: null}, _grpc)
        });
    })
    return ret;
}

function getobservedgovernance(_iso, _year) {
    var ret = new Map();
    govMeasures.forEach(function (measure, govtype) {
        var gov_value = popdata.getvalue(_iso, _year, govtype)
        ret.set(govtype, {
            desc: `historical ${measure.desc}`,
            value: gov_value,
        });
    })
    return ret;
}

function compute(_iso, _year, _outcome, _grpc, _gov) {
    return outcomesMap.get(_outcome).fn(_grpc, _iso, _year, _gov);
}

function compute_inv(_iso, _year, _outcome, _target, _gov) {
    var pop = popdata.getrow(_iso, _year);
    if (!pop) return NaN;

    return outcomesMap.get(_outcome).inv_fn(_target, _iso, _year, _gov);
}

function computeTarget(_iso, _year, _outcome, _target, _grpcOrig)
{
    // n.b. this calculation ignores changes in governance

    var fitted = compute(_iso, _year, _outcome, _grpcOrig, {model: null})
    var bInterp = (outcomesMap.get(_outcome)).isInterpolated;
    var original = popdata.getvalue(_iso, _year, _outcome, bInterp);
    var residual = original - fitted;
    var limit = (outcomesMap.get(_outcome)).target
    if (original > limit){
        limit = 100;
    }

    if (original > _target){
        return {error : ["Target value (" + _target + "%) is less than original (" + original.toFixed(2) + "%)",]};
    }
    if (_target < 0 || _target > limit){
        return {error : ["Target value (" + _target + "%) is outside limits",]};
    }
    // treat zero as "no data"
    if (original === 0 || isNaN(original)){
        var outcome_name = (outcomesMap.get(_outcome)).name;
        return {error : [outcome_name + " not available for " + _year]};
    }  

    // n.b. outcome = f(grpc) + residual => grpc = f^-1(outcome - residual)
    var target_grpc = compute_inv(_iso, _year, _outcome, _target - residual, {model: null});
    if (isNaN(target_grpc) || !isFinite(target_grpc)){
        var outcome_name = (outcomesMap.get(_outcome)).name;
        var errs = ["Unable to calculate " + outcome_name + ": target may be out of achievable range"];
        return {error : errs};
    }
    return {
        error : null,
        grpc : target_grpc,
        additional : computeAdditionalResults(_iso, _year, _outcome, target, original),
        special : computeSpecialResults(_iso, _year, _outcome, target, original, (target_grpc - _grpcOrig))
    };
}

function computeAdditionalResults(_iso, _year, _outcome, improved, original){
    var popTotal = popdata.getvalue(_iso, _year, "Population, total");
    var popU5 = popdata.getvalue(_iso, _year, "Pop < 5");
    var popFemale15_49 = popdata.getvalue(_iso, _year, "Number of females aged 15-49");
    var popChildrenSurvive1 = popdata.getvalue(_iso, _year, "Children survive to 1 year");
    var popBirths = popdata.getvalue(_iso, _year, "Number of births")
    var popChildrenSurvive5 = popdata.getvalue(_iso, _year, "Number of children surviving to five");
    let outcomeName = outcomesMap.get(_outcome).name

    var additional = [];

    if (_outcome == "SANITBASIC" || _outcome == "SANITSAFE" || _outcome == "WATERBASIC" || _outcome == "WATERSAFE") {
        additional.push({name : "People with increased access to " + outcomeName,  value : (improved - original) / 100 * popTotal, keyvariable : true});
        additional.push({name : "Children < 5 with increased access to " + outcomeName, value : (improved - original) / 100 * popU5, keyvariable : true});
        additional.push({name : "Females 15-49 with increased access to " + outcomeName, value: (improved - original) / 100 * popFemale15_49, keyvariable : true});
    } else if (_outcome == "IMUNISATION") {
        additional.push({name : "Number of infants immunised", value : (improved - original) / 100 * popChildrenSurvive1, keyvariable : true})
    } else if (_outcome == "SCHOOLPERC") {
        additional.push({name : "Additional child school years", value : 17 * (improved - original) / 100 * popChildrenSurvive5, keyvariable : true})
    } else if (_outcome == "U5MSURV"){
        additional.push({name : "Under-5 five deaths averted", value : (improved - original) / 100 * popBirths, keyvariable : true})
        additional.push({name : "Under-5 deaths", value : (1 - original / 100) * popBirths, keyvariable : false})
        additional.push({name : "Under-5 deaths with additional revenue", value : (1 - improved / 100) * popBirths, keyvariable : false})
    } else if (_outcome == "MMRSURV"){
        additional.push({name : "Maternal deaths averted", value : (improved - original) / 100 * popBirths, keyvariable : true})
        additional.push({name : "Maternal deaths", value : (1 - original / 100) * popBirths, keyvariable : false})
        additional.push({name : "Maternal deaths with additional revenue", value : (1 - improved / 100) * popBirths, keyvariable : false})
    } else if (_outcome == "PRIMARYSCHOOL"){
        additional.push({name : "Additional children in primary education, both sexes (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, primary education, both sexes (number)"), keyvariable:true})
        additional.push({name : "Additional children in primary education, female (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, primary education, female (number)"), keyvariable:true})
        additional.push({name : "Additional children in primary education, male (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, primary education, male (number)"), keyvariable:true})
    } else if (_outcome == "LOWERSCHOOL"){
        additional.push({name : "Additional children in lower secondary education, both sexes (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, lower secondary education, both sexes (number)"), keyvariable:true})
        additional.push({name : "Additional children in lower secondary education, female (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, lower secondary education, female (number)"), keyvariable:true})
        additional.push({name : "Additional children in lower secondary education, male (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, lower secondary education, male (number)"), keyvariable:true})
    } else if (_outcome == "UPPERSCHOOL"){
        additional.push({name : "Additional children in upper secondary education, both sexes (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, upper secondary education, both sexes (number)"), keyvariable:true})
        additional.push({name : "Additional children in upper secondary education, female (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, upper secondary education, female (number)"), keyvariable:true})
        additional.push({name : "Additional children in upper secondary education, male (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, upper secondary education, male (number)"), keyvariable:true})
    } else if (_outcome == "INVPRIMARYTEACHERS"){
	additional.push({name : "Additional primary-school teachers (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, primary education, both sexes (number)"), keyvariable:true})
    } else if (_outcome == "INVLOWERTEACHERS"){
	additional.push({name : "Additional lower-school teachers (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, lower secondary education, both sexes (number)"), keyvariable:true})
    } else if (_outcome == "INVUPPERTEACHERS"){
	additional.push({name : "Additional lower-school teachers (number)", value: (improved - original) * popdata.getvalue(_iso, _year, "School age population, upper secondary education, both sexes (number)"), keyvariable:true})
    }

    return additional;
}

function computeSpecialResults(_iso, _year, _outcome, _improved, _original, _additionalGrpc)
{
    var special_results = [];

    var popBirths = popdata.getvalue(_iso, _year, "Number of births")
    var popTotal = popdata.getvalue(_iso, _year, "Population, total");

    if (_outcome == "U5MSURV")
    {
        var livesSaved = Math.round((_improved - _original) / 100 * popBirths)
        var costPerLife = livesSaved > 0 ? popTotal * _additionalGrpc / livesSaved : NaN 
        special_results.push({name : "Cost per under-5 life saved", value : costPerLife})
    }
    else if (_outcome == "MMRSURV")
    {
        var livesSaved = Math.round((_improved - _original) / 100 * popBirths)
        var costPerLife = livesSaved > 0 ? popTotal * _additionalGrpc / livesSaved : NaN 
        special_results.push({name : "Cost per maternal life saved", value : costPerLife})
    }

    return special_results;
}

function getPopulationResults(_iso, _year, _outcome)
{
    results = [];
    if (_outcome == "PRIMARYSCHOOL"){
        results.push({name : "School age population, primary education, both sexes (number)", value: popdata.getvalue(_iso, _year, "School age population, primary education, both sexes (number)")})
        results.push({name : "School age population, primary education, female (number)", value: popdata.getvalue(_iso, _year, "School age population, primary education, female (number)")})
        results.push({name : "School age population, primary education, male (number)", value: popdata.getvalue(_iso, _year, "School age population, primary education, male (number)")})
    } else if (_outcome == "LOWERSCHOOL"){
        results.push({name : "School age population, lower secondary education, both sexes (number)", value: popdata.getvalue(_iso, _year, "School age population, lower secondary education, both sexes (number)")})
        results.push({name : "School age population, lower secondary education, female (number)", value: popdata.getvalue(_iso, _year, "School age population, lower secondary education, female (number)")})
        results.push({name : "School age population, lower secondary education, male (number)", value: popdata.getvalue(_iso, _year, "School age population, lower secondary education, male (number)")})
    } else if (_outcome == "UPPERSCHOOL"){
        results.push({name : "School age population, upper secondary education, both sexes (number)", value: popdata.getvalue(_iso, _year, "School age population, upper secondary education, both sexes (number)")})
        results.push({name : "School age population, upper secondary education, female (number)", value: popdata.getvalue(_iso, _year, "School age population, upper secondary education, female (number)")})
        results.push({name : "School age population, upper secondary education, male (number)", value: popdata.getvalue(_iso, _year, "School age population, upper secondary education, male (number)")})
    }
    return results;
}

function coverageObject(_outcome, _original, _improved)
{
    var outcome_name = (outcomesMap.get(_outcome)).name;
    return [
        {name:`historical ${outcome_name} coverage`, value: _original, keyvariable : true},
        {name: `improved ${outcome_name} coverage`, value : _improved, keyvariable : true}
    ];
}

function computeResult(_iso, _year, _outcome, _grpc, _grpcOrig, _govImprovement, _epsilon = 0) {
 
    var fitted = compute(_iso, _year, _outcome, _grpcOrig, {model : null})
    var bInterp = (outcomesMap.get(_outcome)).isInterpolated;
    var original = popdata.getvalue(_iso, _year, _outcome, bInterp);
    var outcome_name = (outcomesMap.get(_outcome)).name;
    
    // treat zero as "no data"
    if (original === 0 || isNaN(original)){
        return {error : [outcome_name + " not available for " + _year]};
    }
    var improved = compute(_iso, _year, _outcome, _grpc, _govImprovement)
    if (isNaN(improved)){
        var outcome_name = (outcomesMap.get(_outcome)).name;
        var errs = ["Unable to calculate " + outcome_name + ", " + _year];
        // temporary hack to check governance values
        var govresults = computegovernance(_iso, _year, _govImprovement, _grpc);
        var hasNan = false
        govresults.forEach(function(v){
            hasNan = hasNan || isNaN(v);
        })
        if (hasNan){
            errs.push("Governance measures data unavailable");
        }
        return {error : errs};
    }
    var govresults = computegovernance(_iso, _year, _govImprovement, _grpc)
    var residual = original - fitted;
    var limit = (outcomesMap.get(_outcome)).target
    if (original > limit ){
        limit = 100;
    }
    improved = Math.min(Math.max(improved + residual, 0), limit);
    if (Math.abs(improved - original) < _epsilon){
        improved = original;
    }

    var ret = {
        "error" : null,
        "original": original,
        "improved": improved,
        "fitted": fitted,
        "population": popdata.getvalue(_iso, _year, "Population, total"),
        "additional": computeAdditionalResults(_iso, _year, _outcome, improved, original),
        "special": computeSpecialResults(_iso, _year, _outcome, improved, original, (_grpc - _grpcOrig)),
        "gov": govresults,
        "incomelevel" : popdata.getstring(_iso, _year, 'incomelevel'),
        "region": popdata.getstring(_iso, _year, 'region'),
        "coverage" : coverageObject(_outcome, original, improved),
    };
    return ret;
}

function convertNumber(s){
    // utility function; as +() but ensures null strings convert to NaN
    if (!s){
        return NaN;
    }
    else
        return +s;
}

function typeAndSetPopulation(d) {
    
    var e = {}
    
    e.CORRUPTION    =convertNumber(d["Control of Corruption: Estimate"])
    e.Country 	    =d["countryname"]                                      
    e.GOVEFFECT 	=convertNumber(d["Government Effectiveness: Estimate"])
    e.GRPERCAP 	    =convertNumber(d["Government revenue per capita (constant 2015 USD)"])
    e.IMUNISATION	=convertNumber(d["Immunization, DPT (% of children ages 12-23 months)"])
    e.ISO 	        =d["countrycode"]
    e.POLSTAB 	    =convertNumber(d["Political Stability and Absence of Violence/Terrorism: Estimate"])
    e.REGQUALITY	=convertNumber(d["Regulatory Quality: Estimate"])
    e.RULELAW 	    =convertNumber(d["Rule of Law: Estimate"])
    e.SANITBASIC 	=convertNumber(d["People using at least basic sanitation services (% of population)"])
    e.SANITSAFE 	=convertNumber(d["People using safely managed sanitation services (% of population)"])
    e.SCHOOLPERC 	=convertNumber(d["School percent"])
    e.VOICE 	    =convertNumber(d["Voice and Accountability: Estimate"])
    e.WATERBASIC 	=convertNumber(d["People using at least basic drinking water services (% of population)"])
    e.WATERSAFE 	=convertNumber(d["People using safely managed drinking water services (% of population)"])
    e.U5MSURV 	    =convertNumber(d["U5 survival %"])
    e.MMRSURV 	    =convertNumber(d["Maternal survival rate %"])
    
    e["Population, total"]                      =convertNumber(d["Pop total"])
    e["Pop < 5"]                                =convertNumber(d["Pop<5"])
    e["Number of females aged 15-49"]           =convertNumber(d["Female Pop15-49"])
    e["Children survive to 1 year"]             =convertNumber(d["Number of infants surviving to 1yr"])
    e["Number of births"]                       =convertNumber(d["Number of births"])
    e["countrycode"]                            = d["countrycode"]
    e["countryname"]                            = d["countryname"]
    e["year"]                                   =convertNumber(d["year"])
    e["incomelevel"]                            = d["incomelevel"]
    e["Number of children surviving to five"]   =convertNumber(d["Number of children surviving to five "])
    e["region"]                                 =d["region"]
    e.PRIMARYSCHOOL                             = convertNumber(d["In school: Primary school"]);
    e.LOWERSCHOOL                               = convertNumber(d["In school: Lower school"]);
    e.UPPERSCHOOL                               = convertNumber(d["In school: Upper school"]);
    e["School age population, primary education, both sexes (number)"]          = convertNumber(d["School age population, primary education, both sexes (number)"]          );
    e["School age population, primary education, female (number)"]              = convertNumber(d["School age population, primary education, female (number)"]);
    e["School age population, primary education, male (number)"]                = convertNumber(d["School age population, primary education, male (number)"]);
    e["School age population, lower secondary education, both sexes (number)"]  = convertNumber(d["School age population, lower secondary education, both sexes (number)"]);
    e["School age population, lower secondary education, female (number)"]      = convertNumber(d["School age population, lower secondary education, female (number)"]);
    e["School age population, lower secondary education, male (number)"]        = convertNumber(d["School age population, lower secondary education, male (number)"]);
    e["School age population, upper secondary education, both sexes (number)"]  = convertNumber(d["School age population, upper secondary education, both sexes (number)"]);
    e["School age population, upper secondary education, female (number)"]      = convertNumber(d["School age population, upper secondary education, female (number)"]);
    e["School age population, upper secondary education, male (number)"]        = convertNumber(d["School age population, upper secondary education, male (number)"]);
    e["INVPRIMARYTEACHERS"] = convertNumber(d["INVPRIMARYTEACHERS"]);
    e["PRIMARYTEACHERS"]    = convertNumber(d["PRIMARYTEACHERS"]);
    e["INVLOWERTEACHERS"]   = convertNumber(d["INVLOWERTEACHERS"]);
    e["LOWERTEACHERS"]      = convertNumber(d["LOWERTEACHERS"]);
    e["INVUPPERTEACHERS"]   = convertNumber(d["INVUPPERTEACHERS"]);
    e["UPPERTEACHERS"]      = convertNumber(d["UPPERTEACHERS"]);

    return e;
}

function typeAndSetFixedEffects(d){
    
    var e = {}

    e["countryname"]    = d["countryname"]
    e["year"]           = convertNumber(d["year"])
    e["ISO"]            = d["countrycode"]
    e["CORRUPTION"]     = convertNumber(d["eqgmmcoruption_efct"])
    e["GOVEFFECT"]      = convertNumber(d["eqgmmgoveff_efct"])
    e["POLSTAB"]        = convertNumber(d["eqgmmpolstab_efct"])
    e["REGQUALITY"]     = convertNumber(d["eqgmmregqual_efct"])
    e["RULELAW"]        = convertNumber(d["eqgmmrulelaw_efct"])

    return e;
}

function getRevenue(_iso, _year, _revenue) {
    var ret;    
    var grpercap = popdata.getvalue(_iso, _year, "GRPERCAP", true);
    var total_population = popdata.getvalue(_iso, _year, "Population, total");
    
    if (isNaN(grpercap) || grpercap == 0) {
        return undefined;
    }

    var method_to_use = _revenue.method;
    if (_revenue.method == "file")
    {
        method_to_use = _revenue.file_method;
    }
    
    if (method_to_use == "percentage") {
        var proportion_increase_grpc
        if (_revenue.method == "file"){
            proportion_increase_grpc = revdata.getvalue(_iso, _year, "REVENUE") / 100.0;
            if (isNaN(proportion_increase_grpc))
            {
                proportion_increase_grpc = 0
            }
        }
        else{
            proportion_increase_grpc = _revenue.govRevenue;
        }
        var newAbsRev = (grpercap * (proportion_increase_grpc)) * total_population;
        var additionalPerCapita = grpercap * proportion_increase_grpc;
        ret = {
            "percentage increase": proportion_increase_grpc,
            "new absolute revenue": newAbsRev,
            "additional revenue per capita": additionalPerCapita,
            "new grpc": grpercap + additionalPerCapita,
            "historical grpc": grpercap,
            "historical total revenue" : grpercap * total_population
        };
    } else if (method_to_use == "pc") {
        var additional_revenue_per_capita_dollars;
        if (_revenue.method == "file"){
            additional_revenue_per_capita_dollars =  revdata.getvalue(_iso, _year, "REVENUE"); 
            if (isNaN(additional_revenue_per_capita_dollars))
            {
                additional_revenue_per_capita_dollars = 0
            }
        }
        else{
            additional_revenue_per_capita_dollars = _revenue.pcGovRev;
        }
        var newGRPC = grpercap + additional_revenue_per_capita_dollars;
        var newGovRev = newGRPC / grpercap - 1;
        var newAbsRev = (grpercap * (newGovRev)) * total_population;
        ret = {
            "percentage increase": newGovRev,
            "new absolute revenue": newAbsRev,
            "additional revenue per capita": additional_revenue_per_capita_dollars,
            "new grpc": newGRPC,
            "historical grpc": grpercap,
            "historical total revenue" : grpercap * total_population
        };
    }
    else { // method "absolute"

        var additional_revenue_dollars
        if (_revenue.method == "file"){
            additional_revenue_dollars = revdata.getvalue(_iso, _year, "REVENUE")  
            if (isNaN(additional_revenue_dollars))
            {
                additional_revenue_dollars = 0
            }
        }
        else{
            additional_revenue_dollars = _revenue.absGovRev;
        }
        var newGRPC = grpercap + additional_revenue_dollars / total_population;
        var newGovRev = newGRPC / grpercap - 1;
        var additionalPerCapita = additional_revenue_dollars / total_population;
        ret = {
            "percentage increase": newGovRev,
            "new absolute revenue": additional_revenue_dollars,
            "additional revenue per capita": additionalPerCapita,
            "new grpc": newGRPC,
            "historical grpc": grpercap,
            "historical total revenue" : grpercap * total_population
        };
    }

    return ret;
}
