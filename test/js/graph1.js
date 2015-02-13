    	d3.csv("data/crossindex.csv", function(error, data) {


		var margin = {top: 0, right: 0, bottom: 60, left: 40},
			width = 960 - margin.left - margin.right,
			height = 500 - margin.top - margin.bottom;
		

		var xMax = d3.max(data, function(d) { return + d.hindex; })+0.2,
			xMin = d3.min(data, function(d) { return + d.hindex; })-0.1,
			yMax = d3.max(data, function(d) { return + d.incomeIdx; })+0.5,
			yMin = d3.min(data, function(d) { return + d.incomeIdx; })-0.5;
		
		//Define scales
		var x = d3.scale.linear()
			.domain([xMin, xMax])
			.range([0, width]);
			
		var y = d3.scale.linear()
			.domain([yMin, yMax])
			.range([height, 0]);
			
		// setup fill color
		var cValue = function(d) { return d.country;},
		    color = d3.scale.category10();

		//Define X axis
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickSize(-height)
			.tickFormat(d3.format(".3n"));
		
		//Define Y axis
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(10)
			.tickSize( -width)
			.tickFormat(d3.format(".3n"));
		
		var svg = d3.select("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top  + ")")
			.call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 10]).on("zoom", zoom));

		
		svg.append("rect")
			.attr("width", width)
			.attr("height", height);
		
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
	        .append("text")
	          .attr("class", "label")
	          .attr("x", width - 10)
	          .attr("y", 30)
	          .style("text-anchor", "end")
	          .text("Happiness index");			
		
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
	        .append("text")
	          .attr("class", "label")
	          .attr("transform", "rotate(-90)")
	          .attr("y", 10)
	          .attr("x", -20)
	          .attr("dy", ".71em")
	          .style("text-anchor", "end")
	          .text("Income Index");			

		  // add the tooltip area to the webpage
		  var tooltip = d3.select("body").append("div")
		      .attr("class", "tooltip")
		      .style("opacity", 0);

		  // load data
		  d3.csv("data/crossindex.csv", function(error, data) {

				svg.selectAll("circle")
					.data(data)
					.enter()
					.append("circle")
			        .attr("class","circle")
					.attr("transform", function(d, i) {
						return "translate("+x(d.hindex)+","+y(d.incomeIdx)+")";
					})
		            .attr("r", function(d) {
		                return d.relidx *5 ;
		            })  
					.attr("opacity","0.8")
		            .style("opacity", .6)
		            .on("mouseover", function(d) {
			                tooltip.transition()
			                     .duration(200)
			                     .style("opacity", .9);

							var tooltipHtml = "";

							tooltipHtml += '<table class="graphTooltip"><thead><tr><th>'+ d.name + '</th><th></th></tr></thead>';
			                tooltipHtml += '<tbody>';
			                tooltipHtml += '<tr><td class="bordered">Happiness Index </td><td>' +d.hindex   +'</td></tr>';
			                tooltipHtml += '<tr><td class="bordered">Income Index </td><td>'    +d.incomeIdx+'</td></tr>';
			                tooltipHtml += '<tr><td class="bordered">Religious Index </td><td>' +d.relidx+'</td></tr>';
                			tooltipHtml += '</tbody></table>';
			                tooltip.html(tooltipHtml)
			                     .style("left", (d3.event.pageX + 5) + "px")
			                     .style("top", (d3.event.pageY - 28) + "px");

			                d3.select(this)
			                  .classed("active", true ) // should then accept fill from CSS

		            })
		            .on("mouseout", function(d) {
		                tooltip.transition()
		                     .duration(500)
		                     .style("opacity", 0);
		                d3.select(this)
		                  .classed("active", false ) // should then accept fill from CSS     
		            })		            		            
		            .style("fill", function(d) { return color(cValue(d));}) 		
		  });		

		
		function zoom() {
		  svg.select(".x.axis").call(xAxis);
		  svg.select(".y.axis").call(yAxis);
          svg.selectAll("circle")			
            .attr("transform", function(d, i) {
				return "translate("+x(d.hindex)+","+y(d.incomeIdx)+")";
			})
            .attr("r", function(d) {
                return d.relidx *5 ;
            }) ;
		}    
	});