function heartRate() {
	d3.select("#sc").attr("class", "not_selected");
	d3.select("#s").attr("class", "not_selected");
	d3.select("#ht").attr("class", "selected");

	d3.select("#addSubject").style("display", "none");
	d3.select("#typeSubject").style("display", "none");
	d3.select("#typeChart").style("display", "block");
	d3.select("#span_immersion").style("display", "block")

	changeChart();
}


function loadHR_smallMultiple(grouped_db, initial_db) {
	var margin = { top: 60, right: 20, bottom: 40, left: 40 },
		width = 250 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

	// Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
	var svg = d3.select("#PrincipalPlot")
		.selectAll("uniqueChart")
		.data(grouped_db)
		.enter()
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleLinear()
		.domain(d3.extent(initial_db, function (d) { return d.time; }))
		.range([0, width]);

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.style("font-size", "11px")
		.call(d3.axisBottom(x).ticks(7));

	svg.append("text")
		.attr("transform",
			"translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
		.style("text-anchor", "middle")
		.text("Time(s)");

	var y = d3.scaleLinear()
		.domain([0, d3.max(initial_db, function (d) { return d.HeartRate; })])
		.range([height, 0]);

	svg.append("g")
		.style("font-size", "13px")
		.call(d3.axisLeft(y).ticks(7));

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - margin.left - 5)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.text("Heart Rate(bpm)");

	// Draw the line
	svg.append("path")
		.attr("class", "line")
		.attr("stroke", function (d) { return color(d.key) })
		.attr("d", function (d) {
			return d3.line()
				.x(function (d) { return x(d.time); })
				.y(function (d) { return y(d.HeartRate); })
				(d.values)
		})

	// Add titles
	svg.append("text")
		.attr("text-anchor", "start")
		.attr("y", -5)
		.attr("x", 0)
		.text(function (d) { return (d.key) })
		.style("fill", function (d) { return color(d.key) })

	svg.on("mouseover", function(d){
		d3.select(this).style("cursor", "pointer")
	})
	
	svg.on("mouseout", function(d){
		d3.select(this).style("cursor", "defoult")
	})

	svg.on("click", function (d) {   // we are inside the right chart
		d3.select("#LineChart").selectAll("svg").remove();

		allName_HT.forEach(function (name) {
			document.getElementById(name).checked = false;
		})

		document.getElementById((d.key)).checked = true;

		container = document.getElementsByClassName('container');

		for (var i = 0; i < container.length; i++) {
			if (container[i].firstChild.nodeValue.trim() !== 'ONLY IMMERSION')
				container[i].getElementsByClassName('checkmark')[0].style.backgroundColor = '#eee';
			if (container[i].firstChild.nodeValue.trim() === d.key)
				container[i].getElementsByClassName('checkmark')[0].style.backgroundColor = color(d.key);
		}

		d3.select("#addSubject").style("display", "block");
		lineChartElmnt = document.getElementById("LineChart");
		lineChartElmnt.scrollIntoView();
		addLine()
	});
}

function drowMorelineHR(db) {
	d3.select("#tooltip").remove();

	var margin = { top: 70, right: 160, bottom: 50, left: 300 },
		width = 2000 - margin.left - margin.right,
		height = 900 - margin.top - margin.bottom;

	var svg = d3.select("#LineChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	allDb = [];
	db.forEach(function (d) {
		d.forEach(function (d_in) {
			allDb.push(d_in);
		})
	})

	var xScale = d3.scaleLinear()
		.domain([0, d3.max(allDb, function (d) { return d.time; })])
		.range([0, width]);

	var yScale = d3.scaleLinear()
		.domain([0, d3.max(allDb, function (d) { return d.HeartRate; })])
		.range([height, 0]);

	var xAxis = d3.axisBottom()
		.scale(xScale);

	var yAxis = d3.axisLeft()
		.scale(yScale);

	var x = svg.append("g")
		.attr("transform", "translate(0," + (height) + ")")
		.style("font-size", "20px")
		.call(xAxis);

	svg.append("text")
		.attr("transform",
			"translate(" + (width / 2) + " ," + (height + 45) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Time(s)");

	var y = svg.append("g")
		.style("font-size", "20px")
		.call(yAxis)

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - 60)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Heart Rate(bpm)");

	var smallgroupByName_HR = d3.nest() 
		.key(function (d) { return d.Name; })
		.entries(allDb);

	var line = d3.line()
		.x(d => xScale(d.time))
		.y(d => yScale(d.HeartRate))

	// APPEND MULTIPLE LINES //
	var lines = svg.append('g')
		.attr('class', 'lines')

	glines = lines.selectAll('.line-group')
		.data(smallgroupByName_HR).enter()
		.append('g')
		.attr('class', 'line-group')

	glines
		.append('path')
		.attr('class', 'line')
		.attr('d', d => line(d.values))
		.attr("stroke", function (d) { return color(d.key) })

	tooltip = d3.select("#LineChart").append("div") // this is the tooltip
		.attr('id', 'tooltip')
		.attr("class", "tooltip")
		.style('position', 'absolute')
		.style("background-color", "white")
		.style("border-color", "black")
		.style('display', 'none')

	var mouseG = svg.append("g")
		.attr("class", "mouse-over-effects");

	mouseG.append("path") // this is the black vertical line to follow mouse
		.attr("class", "mouse-line")
		.style("stroke", "black")
		.style("stroke-width", "2px")
		.style("stroke-dasharray", "3,3")
		.style("opacity", "0");

	var mousePerLine = mouseG.selectAll('.mouse-per-line')
		.data(smallgroupByName_HR)
		.enter()
		.append("g")
		.attr("class", "mouse-per-line");

	mousePerLine.append("circle")
		.attr("r", 8.5)
		.style("stroke", function (d) { return color(d.key); })
		.style("fill", "none")
		.style("stroke-width", "1px")
		.style("opacity", "0");

	mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
		.attr('width', width)
		.attr('height', height)
		.attr('fill', 'none')
		.attr('pointer-events', 'all')
		.on('mouseout', function () { // on mouse out hide line, circles and tooltip
			d3.select(".mouse-line")
				.style("opacity", "0");
			d3.selectAll(".mouse-per-line circle")
				.style("opacity", "0");
			d3.selectAll("#tooltip")
				.style('display', 'none')
		})
		.on('mouseover', function () { // on mouse in show line, circles and tooltip
			d3.select(".mouse-line")
				.style("opacity", "1");
			d3.selectAll(".mouse-per-line circle")
				.style("opacity", "1");
			d3.selectAll("#tooltip")
				.style('display', 'block')
		})
		.on('mousemove', function () { // mouse moving over canvas
			mouse = d3.mouse(this);
			d3.select(".mouse-line")
				.attr("d", function () {
					var data = "M" + mouse[0] + "," + height;
					data += " " + mouse[0] + "," + 0;
					return data;
				})

			d3.selectAll(".mouse-per-line")
				.attr("transform", function (d, i) {
					var xDate = xScale.invert(mouse[0]),
						bisect = d3.bisector(function (d) { return d.time; }).left;
					idx = bisect(d.values, xDate);

					if (typeof d.values[idx] !== "undefined") {
						d3.select(this).select("circle")
							.attr("cx", xScale(d.values[idx].time))
							.attr("cy", yScale(d.values[idx].HeartRate))
					}
					return "translate(" + 0 + "," + 0 + ")";

				});
			updateTooltipContentHR(smallgroupByName_HR);
		});
}


function updateTooltipContentHR(res_nested) {

	sortingObj = []
	res_nested.map(d => {
		if (typeof d.values[idx] !== "undefined") {
			sortingObj.push({ key: d.values[idx].Name, hr: d.values[idx].HeartRate, t: d.values[idx].time })
		}
	})
	if (sortingObj.length !== 0) {
		sortingObj.sort(function (x, y) {
			return d3.descending(x.hr, y.hr);
		})
		var sortingArr = sortingObj.map(d => d.key)

		var res_nested1 = res_nested.slice().sort(function (a, b) {
			return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key) 
		})

		tooltip.html("At time: " + sortingObj[0].t)
			.style('display', 'block')
			.style("left", d3.event.pageX + "px")
			.style("top", d3.event.pageY + 10 + "px")
			.style('font-size', 11.5)
			.selectAll()
			.data(res_nested1).enter()
			.append('div')
			.style('color', d => {return color(d.key)})
			.style('font-size', 10)
			.html(d => {
				if (typeof d.values[idx] !== "undefined") {
					return d.key.substring(0, 3) + " " + d.key.slice(-3) + ": " + d.values[idx].HeartRate;
				}
			})
	}
	else {
		d3.selectAll("#tooltip")
			.style('display', 'none')
	}
}

function loadHR_boxPlot(initial_db) {
	d3.select("#addSubject").style("display", "none");
	d3.select("#immersion").style("display", "none")

	// set the dimensions and margins of the graph
	var margin = { top: 100, right: 40, bottom: 30, left: 60 },
		width = 2000 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3.select("#PrincipalPlot")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
	var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function (d) { return d.Name; })
		.rollup(function (d) {

			var min = d[0].HeartRate;
			var max = d[0].HeartRate;
			d.forEach(function (row) {
				if (min > row.HeartRate)
					min = row.HeartRate;

				if (max < row.HeartRate)
					max = row.HeartRate;
			})

			q1 = d3.quantile(d.map(function (g) { return g.HeartRate; }).sort(d3.ascending), .25)
			median = d3.quantile(d.map(function (g) { return g.HeartRate; }).sort(d3.ascending), .5)
			q3 = d3.quantile(d.map(function (g) { return g.HeartRate; }).sort(d3.ascending), .75)
			interQuantileRange = q3 - q1
			min = Math.max(min, q1 - 1.5 * interQuantileRange)
			max = Math.min(max, q3 + 1.5 * interQuantileRange)

			outliers = d.filter(g => g.HeartRate < min || g.HeartRate > max);

			return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, outliers: outliers })
		})
		.entries(initial_db)

	// Show the X scale
	var x = d3.scaleBand()
		.domain(allName_HT)
		.range([0, width])
		.paddingInner(1)
		.paddingOuter(.5)

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.style("font-size", "15px")
		.call(d3.axisBottom(x))

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - 60)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Heart Rate(bpm)");

	// Show the Y scale
	var y = d3.scaleLinear()
		.domain([0, d3.max(initial_db, function (d) { return d.HeartRate; })])
		.range([height, 0])

	svg.append("g").style("font-size", "20px").call(d3.axisLeft(y))

	// Show the main vertical line
	svg.selectAll("vertLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key)) })
		.attr("x2", function (d) { return (x(d.key)) })
		.attr("y1", function (d) { return (y(d.value.min)) })
		.attr("y2", function (d) { return (y(d.value.max)) })
		.attr("stroke", "black")
		.style("width", 40)

	// create a tooltip
	var mouseover = function (d) {
		Tooltip = d3.select("#PrincipalPlot")
			.append("div")
			.attr("class", "tooltip")
			.style('position', 'absolute')
			.style("border-color", color(d.key))
			.style("background-color", "white")
	}

	var mousemove = function (d) {
		Tooltip.html(d.key + "<br>Max: " + +d.value.max.toFixed(2) + "<br>Q3: " + +d.value.q3.toFixed(2) + "<br>Median: " + +d.value.median.toFixed(2) + "<br>Q1: " + +d.value.q1.toFixed(2) + "<br>Min: " + +d.value.min.toFixed(2))
			.style("left", (d3.mouse(this)[0]) + "px")
			.style("top", (d3.mouse(this)[1] + 50) + "px")
	}

	var mouseout = function (d) {
		Tooltip.remove();
	}

	// rectangle for the main box
	var boxWidth = 80
	svg.selectAll("boxes")
		.data(sumstat)
		.enter()
		.append("rect")
		.attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("y", function (d) { return (y(d.value.q3)) })
		.attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
		.attr("width", boxWidth)
		.style("stroke-width", "2")
		.style("stroke", function (d) { return color(d.key) })
		.style("fill", function (d) { return color(d.key) })
		.style("fill-opacity", "0.2")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout)


	// Show the median
	svg.selectAll("medianLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.median)) })
		.attr("y2", function (d) { return (y(d.value.median)) })
		.attr("stroke", function (d) { return color(d.key) })
		.style("stroke-width", "2")

	// Show the max
	svg.selectAll("maxLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.max)) })
		.attr("y2", function (d) { return (y(d.value.max)) })
		.attr("stroke", "black")
		.style("stroke-width", "2")

	// Show the min
	svg.selectAll("minLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.min)) })
		.attr("y2", function (d) { return (y(d.value.min)) })
		.attr("stroke", "black")
		.style("stroke-width", "2")

	var jitterWidth = 70
	sumstat.forEach(function (d) {
		svg.selectAll("outliers")
			.data(d.value.outliers)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return x(d.Name) - jitterWidth / 2 + Math.random() * jitterWidth })
			.attr("cy", function (d) { return y(d.HeartRate) })
			.attr("stroke", function (d) { return color(d.Name) })
			.style("stroke-width", "2")
			.style("fill", function (d) { return color(d.Name) })
			.style("fill-opacity", "0.2")
			.attr('r', 5.0)
	})
}