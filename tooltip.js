//tooltip based in an example from Roger Veciana: http://bl.ocks.org/rveciana/5181105

d3.helper = {};

d3.helper.tooltip = function (accessor, enabler) {
  return function (selection) {
    var tooltipDiv;
    var bodyNode = d3.select('body').node();
    selection
      .on('mouseover', function (d, i) {
        // Clean up lost tooltips
        d3.select('body').selectAll('div.tooltip').remove();
        // Append tooltip
        tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
        var absoluteMousePos = d3.mouse(bodyNode);
        const displayStyle = enabler() ? 'block' : 'none';
        tooltipDiv
          .style('left', absoluteMousePos[0] + 10 + 'px')
          .style('top', absoluteMousePos[1] - 15 + 'px')
          .style('position', 'absolute')
          .style('z-index', 1001)
          .style('pointer-events', 'none')
          .style('display', displayStyle);
      })
      .on('mousemove', function (d, i) {
        // Move tooltip
        var absoluteMousePos = d3.mouse(bodyNode);
        tooltipDiv
          .style('left', absoluteMousePos[0] + 10 + 'px')
          .style('top', absoluteMousePos[1] - 15 + 'px');
        var tooltipText = accessor(d, i) || '';
        tooltipDiv.html(tooltipText);
      })
      .on('mouseout', function (d, i) {
        // Remove tooltip
        tooltipDiv.remove();
      });
  };
};
