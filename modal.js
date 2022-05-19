function initModal(){

    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // Get the input for the amount
    var amount = document.getElementById("deflatorAmount")

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
    modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
    modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
    }

    var years = gdpDefByYear.map(d=> d.values[0].YEAR);
    years = years.sort(d=>-d);
    // set up the year selectors
    d3.selectAll('#deflatorYearIn,#deflatorYearOut')
            .on('change', function (d) {
                updateDeflator();
            })
            .selectAll('option')
            .data(years)
            .enter()
            .append('option')
            .attr('value', function (d) {
                return d;
            })
            .text(function (d) {
                return d;
            });

    amount.oninput = updateDeflator;
}