function subject() {
	d3.select("#sc").attr("class", "not_selected");
	d3.select("#s").attr("class", "selected");
	d3.select("#ht").attr("class", "not_selected");

	d3.select("#span_immersion").style("display", "none")
	d3.select("#addSubject").style("display", "none");
	d3.select("#typeSubject").style("display", "block");
	d3.select("#typeChart").style("display", "block");

	changeData();
}

function changeData() {
	d3.select("#PrincipalPlot").selectAll("svg").remove();
	d3.select("#LineChart").selectAll("svg").remove();

	if(typeof Tooltip !== "undefined")
		Tooltip.style('display', 'none')

	var type = document.getElementById('typeOfChart').value;
	dataFile = document.getElementById('dataset').value;
	d3.csv("SUBJECT/" + dataFile + ".csv", function (subject_db) {
		subject_db.forEach(function (d) {
			d.time = +d.time;
			d.SkinResponse = +d.SkinResponse;
			d.HeartRate = +d.HeartRate;
		})

		if (type === "lineChart")
			loadSubject(subject_db);
		else
			loadSubject_boxPlot(subject_db);
	});
}

function loadSubject(subject_db) {
	var margin = { top: 100, right: 150, bottom: 40, left: 150 },
		width = 2000 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom;

	var svg = d3.select("#LineChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleLinear()
		.domain(d3.extent(subject_db, function (d) { return d.time; }))
		.range([0, width]);
	var y0 = d3.scaleLinear()
		.domain([0, d3.max(subject_db, function (d) { return d.HeartRate; })])
		.range([height, 0]);
	var y1 = d3.scaleLinear()
		.domain([0, d3.max(subject_db, function (d) { return d.SkinResponse; })])
		.range([height, 0]);

	var HR = d3.line()
		.x(function (d) { return x(d.time); })
		.y(function (d) { return y0(d.HeartRate); });

	var SC = d3.line()
		.x(function (d) { return x(d.time); })
		.y(function (d) { return y1(d.SkinResponse); });

	immersionTime.forEach(function (d) {
		if (d.Id === dataFile) {
			svg.append("line")
				.attr("x1", x(d.Start))
				.attr("y1", y0(d3.max(subject_db, function (d) { return d.HeartRate; })))
				.attr("x2", x(d.Start))
				.attr("y2", y0(0))
				.style("stroke", "black")
				.style("stroke-width", "3px")

			svg.append("line")
				.attr("x1", x(d.End))
				.attr("y1", y0(d3.max(subject_db, function (d) { return d.HeartRate; })))
				.attr("x2", x(d.End))
				.attr("y2", y0(0))
				.style("stroke", "black")
				.style("stroke-width", "3px")

			svg.append("text")
				.attr("x", x(d.Start) - 20)
				.attr("y", y0(d3.max(subject_db, function (d) { return d.HeartRate; })) - 10)
				.text("Start")
				.style("font-size", "20px");


			svg.append("text")
				.attr("x", x(d.End) - 20)
				.attr("y", y0(d3.max(subject_db, function (d) { return d.HeartRate; })) - 10)
				.text("End")
				.style("font-size", "20px");
		}
	})

	svg.append("path")
		.data(subject_db)
		.attr("class", "line")
		.style("stroke", "steelblue")
		.attr("d", HR(subject_db));

	svg.append("path")
		.data(subject_db)
		.attr("class", "line")
		.style("stroke", "red")
		.attr("d", SC(subject_db));

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.style("font-size", "20px")
		.call(d3.axisBottom().scale(x));

	svg.append("text")             
		.attr("transform",
			  "translate(" + (width/2) + " ," + (height + 40) + ")")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Time(s)");

	svg.append("g")
		.style("fill", "steelblue")
		.style("font-size", "20px")
		.call(d3.axisLeft().scale(y0));

	svg.append("g")
		.attr("transform", "translate(" + width + " ,0)")
		.style("fill", "red")
		.style("font-size", "20px")
		.call(d3.axisRight().scale(y1));

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - 60)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Heart Rate(bpm)")
		.style("fill", "steelblue");

	svg.append("text")
		.attr("transform", "rotate(-270)")
		.attr("y", - (width + 60))
		.attr("x", 0 + (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Skin Response(uS)")
		.style("fill", "red");

	var bisect = d3.bisector(function (d) { return d.time; }).left;

	// Create the circle that travels along the curve of chart
	var focus_HT = svg.append('g')
		.append('circle')
		.style("fill", "none")
		.attr("stroke", "black")
		.attr('r', 8.5)
		.style("opacity", 0)

	var focus_SC = svg.append('g')
		.append('circle')
		.style("fill", "none")
		.attr("stroke", "black")
		.attr('r', 8.5)
		.style("opacity", 0)
	
	svg.append("path") // this is the black vertical line to follow mouse
		.attr("class", "mouse-line")
		.style("stroke", "black")
		.style("stroke-width", "2px")
		.style("stroke-dasharray", "3,3")
		.style("opacity", "0");

	Tooltip = d3.select("#LineChart")
		.append("div")
		.attr("class", "tooltip")
		.style('position', 'absolute')
		.style("border-color", color(dataFile))
		.style("background-color", "white")
		.style('display', 'none')

	svg.append('rect')
		.style("fill", "none")
		.style("pointer-events", "all")
		.attr('width', width)
		.attr('height', height)
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);

	// create a tooltip
	function mouseover() {
		focus_HT.style("opacity", 1)
		focus_SC.style("opacity", 1)
		d3.select(".mouse-line")
			.style("opacity", "1");
		Tooltip.style('display', 'block')
	}

	function mousemove(d) {
		mouse = d3.mouse(this);

		// recover coordinate we need
		var x0 = x.invert(mouse[0]);
		var i = bisect(subject_db, x0);
		selectedData = subject_db[i]

		d3.select(".mouse-line")
				.attr("d", function () {
					var data = "M" + mouse[0] + "," + height;
					data += " " + mouse[0] + "," + 0;
					return data;
				})

		focus_SC
			.attr("cx", x(selectedData.time))
			.attr("cy", y1(selectedData.SkinResponse))

		focus_HT
			.attr("cx", x(selectedData.time))
			.attr("cy", y0(selectedData.HeartRate))

		Tooltip.html("At time: " + selectedData.time +
					"<br>Heart Rate: " + selectedData.HeartRate +
					"<br>Skin Response: " + selectedData.SkinResponse)
			.style("left", d3.event.pageX + "px")
			.style("top", d3.event.pageY + 10 + "px")
	}

	function mouseout() {
		Tooltip.style('display', 'none')
		focus_HT.style("opacity", 0)
		focus_SC.style("opacity", 0)
		d3.select(".mouse-line")
			.style("opacity", "0");
	}
}


function loadSubject_boxPlot(subject_db) {
	immersionTime.forEach(function (d) {
		if (d.Id === dataFile) {
			start = d.Start;
			end = d.End
		}
	})

	subject_immersion = [];

	subject_db.forEach(function (d, i) {
		if (i < start) {
			subject_immersion.push({
				time: +d.time,
				HeartRate: +d.HeartRate,
				SkinResponse: +d.SkinResponse,
				when: "BeforeImmersion"
			})
		}
		else if (i > end) {
			subject_immersion.push({
				time: d.time,
				HeartRate: d.HeartRate,
				SkinResponse: d.SkinResponse,
				when: "AfterImmersion"
			})
		}
		else {
			subject_immersion.push({
				time: d.time,
				HeartRate: d.HeartRate,
				SkinResponse: d.SkinResponse,
				when: "DuringImmersion"
			})
		}
	})

	createSC_BoxPlot(subject_immersion);
	createHT_BoxPlot(subject_immersion);
}

function createSC_BoxPlot(subject_immersion) {
	var margin = { top: 100, right: 50, bottom: 40, left: 100 },
		width = 1000 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom;

	var svg_skinResponse = d3.select("#LineChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Show the X scale
	var x = d3.scaleBand()
		.domain(["BeforeImmersion", "DuringImmersion", "AfterImmersion"])
		.range([0, width])
		.paddingInner(1)
		.paddingOuter(.5)

	svg_skinResponse.append("g")
		.attr("transform", "translate(0," + height + ")")
		.style("font-size", "15px")
		.call(d3.axisBottom(x))

	// Show the Y scale
	var y = d3.scaleLinear()
		.domain([0, d3.max(subject_immersion, function (d) { return d.SkinResponse; })])
		.range([height, 0])

	svg_skinResponse.append("g").style("font-size", "20px").call(d3.axisLeft(y))

	// Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
	var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function (d) { return d.when; })
		.rollup(function (d) {

			var min = d[0].SkinResponse;
			var max = d[0].SkinResponse;
			var value = 0;
			var count = 0;
			d.forEach(function (row) {
				value += row.SkinResponse;
				count++;
				if (min > row.SkinResponse)
					min = row.SkinResponse;

				if (max < row.SkinResponse)
					max = row.SkinResponse;
			})

			mean = value/count;
			q1 = d3.quantile(d.map(function (g) { return g.SkinResponse; }).sort(d3.ascending), .25)
			median = d3.quantile(d.map(function (g) { return g.SkinResponse; }).sort(d3.ascending), .5)
			q3 = d3.quantile(d.map(function (g) { return g.SkinResponse; }).sort(d3.ascending), .75)
			interQuantileRange = q3 - q1
			min = Math.max(min, q1 - 1.5 * interQuantileRange)
			max = Math.min(max, q3 + 1.5 * interQuantileRange)

			outliers = d.filter(g => g.SkinResponse < min || g.SkinResponse > max);
			return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, outliers: outliers, mean: mean})
		})
		.entries(subject_immersion)

	// Show the main vertical line
	svg_skinResponse.selectAll("vertLines")
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
	var mouseover = function () {
		Tooltip = d3.select("#LineChart")
			.append("div")
			.attr("class", "tooltip")
			.style('position', 'absolute')
			.style("border-color", color(dataFile))
			.style("background-color", "white")
	}

	var mousemove = function (d) {
		if(+d.value.mean.toFixed(2) >= +d.value.median.toFixed(2))
			Tooltip.html(d.key + "<br>Max: " + +d.value.max.toFixed(2) + "<br>Q3: " + +d.value.q3.toFixed(2) + "<br>Mean: " + +d.value.mean.toFixed(2) + "<br>Median: " + +d.value.median.toFixed(2) + "<br>Q1: " + +d.value.q1.toFixed(2) + "<br>Min: " + +d.value.min.toFixed(2))
				.style("left", (d3.mouse(this)[0]) + "px")
				.style("top", (d3.mouse(this)[1] + 30) + "px")
		else if(+d.value.mean.toFixed(2) < +d.value.median.toFixed(2))
			Tooltip.html(d.key + "<br>Max: " + +d.value.max.toFixed(2) + "<br>Q3: " + +d.value.q3.toFixed(2) + "<br>Median: " + +d.value.median.toFixed(2) + "<br>Mean: " + +d.value.mean.toFixed(2) + "<br>Q1: " + +d.value.q1.toFixed(2) + "<br>Min: " + +d.value.min.toFixed(2))
				.style("left", (d3.mouse(this)[0]) + "px")
				.style("top", (d3.mouse(this)[1] + 30) + "px")
	}

	var mouseout = function () {
		Tooltip.remove();
	}

	// rectangle for the main box
	var boxWidth = 80
	svg_skinResponse.selectAll("boxes")
		.data(sumstat)
		.enter()
		.append("rect")
		.attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("y", function (d) { return (y(d.value.q3)) })
		.attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
		.attr("width", boxWidth)
		.attr("stroke", function (d) { return color(dataFile) })
		.style("stroke-width", "2")
		.style("fill", function (d) { return color(dataFile) })
		.style("fill-opacity", "0.2")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout)

	// Show the median
	svg_skinResponse.selectAll("medianLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.median)) })
		.attr("y2", function (d) { return (y(d.value.median)) })
		.attr("stroke", function (d) { return color(dataFile) })
		.style("stroke-width", "2")

	// Show the max
	svg_skinResponse.selectAll("maxLines")
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
	svg_skinResponse.selectAll("minLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.min)) })
		.attr("y2", function (d) { return (y(d.value.min)) })
		.attr("stroke", "black")
		.style("stroke-width", "2")
		
	svg_skinResponse.selectAll("meanCircle")
		.data(sumstat)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.key) })
		.attr("cy", function (d) { return (y(d.value.mean)) })
		.attr("stroke", function (d) { return color(dataFile) })
		.style("stroke-width", "2")
		.style("fill", function (d) { return color(dataFile) })
		.attr('r', 5.0)

	var jitterWidth = 70

	sumstat.forEach(function (d) {
		svg_skinResponse.selectAll("outliers")
			.data(d.value.outliers)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return x(d.when) - jitterWidth / 2 + Math.random() * jitterWidth })
			.attr("cy", function (d) { return y(d.SkinResponse) })
			.attr("stroke", function (d) { return color(dataFile) })
			.style("stroke-width", "2")
			.style("fill", function (d) { return color(dataFile) })
			.style("fill-opacity", "0.2")
			.attr('r', 5.0)
	})

	svg_skinResponse.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - 70)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Skin Response(uS)");
}

function createHT_BoxPlot(subject_immersion) {
	var margin = { top: 100, right: 10, bottom: 40, left: 200 },
		width = 1000 - margin.left - margin.right,
		height = 800 - margin.top - margin.bottom;

	var svg_heartRate = d3.select("#LineChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Show the X scale
	var x = d3.scaleBand()
		.domain(["BeforeImmersion", "DuringImmersion", "AfterImmersion"])
		.range([0, width])
		.paddingInner(1)
		.paddingOuter(.5)

	svg_heartRate.append("g")
		.attr("transform", "translate(0," + height + ")")
		.style("font-size", "15px")
		.call(d3.axisBottom(x))

	// Show the Y scale
	var y = d3.scaleLinear()
		.domain([0, d3.max(subject_immersion, function (d) { return d.HeartRate; })])
		.range([height, 0])

	svg_heartRate.append("g").style("font-size", "20px").call(d3.axisLeft(y))

	// Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
	var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
		.key(function (d) { return d.when; })
		.rollup(function (d) {

			var min = d[0].HeartRate;
			var max = d[0].HeartRate;
			var value = 0;
			var count = 0;
			d.forEach(function (row) {
				value += row.HeartRate;
				count++;
				if (min > row.HeartRate)
					min = row.HeartRate;

				if (max < row.HeartRate)
					max = row.HeartRate;
			})

			mean = value/count;
			q1 = d3.quantile(d.map(function (g) { return g.HeartRate; }).sort(d3.ascending), .25)
			median = d3.quantile(d.map(function (g) { return g.HeartRate; }).sort(d3.ascending), .5)
			q3 = d3.quantile(d.map(function (g) { return g.HeartRate; }).sort(d3.ascending), .75)
			interQuantileRange = q3 - q1
			min = Math.max(min, q1 - 1.5 * interQuantileRange)
			max = Math.min(max, q3 + 1.5 * interQuantileRange)

			outliers = d.filter(g => g.HeartRate < min || g.HeartRate > max);
			return ({ q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, outliers: outliers, mean: mean })
		})
		.entries(subject_immersion)

	// Show the main vertical line
	svg_heartRate.selectAll("vertLines")
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
	var mouseover = function () {
		Tooltip = d3.select("#LineChart")
		.append("div")
		.attr("class", "tooltip")
		.style('position', 'absolute')
		.style("border-color", color(dataFile))
		.style("background-color", "white")
	}

	var mousemove = function (d) {
		if(+d.value.mean.toFixed(2) >= +d.value.median.toFixed(2))
			Tooltip.html(d.key + "<br>Max: " + +d.value.max.toFixed(2) + "<br>Q3: " + +d.value.q3.toFixed(2) + "<br>Mean: " + +d.value.mean.toFixed(2) + "<br>Median: " + +d.value.median.toFixed(2) + "<br>Q1: " + +d.value.q1.toFixed(2) + "<br>Min: " + +d.value.min.toFixed(2))
				.style("left", (d3.mouse(this)[0] + 1100) + "px")
				.style("top", (d3.mouse(this)[1] + 30) + "px")

		else if(+d.value.mean.toFixed(2) < +d.value.median.toFixed(2))
			Tooltip.html(d.key + "<br>Max: " + +d.value.max.toFixed(2) + "<br>Q3: " + +d.value.q3.toFixed(2) + "<br>Median: " + +d.value.median.toFixed(2) + "<br>Mean: " + +d.value.mean.toFixed(2) + "<br>Q1: " + +d.value.q1.toFixed(2) + "<br>Min: " + +d.value.min.toFixed(2))
				.style("left", (d3.mouse(this)[0] + 1100) + "px")
				.style("top", (d3.mouse(this)[1] + 30) + "px")
	}

	var mouseout = function () {
		Tooltip.remove();
	}

	// rectangle for the main box
	var boxWidth = 80
	svg_heartRate.selectAll("boxes")
		.data(sumstat)
		.enter()
		.append("rect")
		.attr("x", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("y", function (d) { return (y(d.value.q3)) })
		.attr("height", function (d) { return (y(d.value.q1) - y(d.value.q3)) })
		.attr("width", boxWidth)
		.attr("stroke", function (d) { return color(dataFile) })
		.style("stroke-width", "2")
		.style("fill", function (d) { return color(dataFile) })
		.style("fill-opacity", "0.2")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseout", mouseout)

	// Show the median
	svg_heartRate.selectAll("medianLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.median)) })
		.attr("y2", function (d) { return (y(d.value.median)) })
		.attr("stroke", function (d) { return color(dataFile) })
		.style("stroke-width", "2")

	// Show the max
	svg_heartRate.selectAll("maxLines")
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
	svg_heartRate.selectAll("minLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", function (d) { return (x(d.key) - boxWidth / 2) })
		.attr("x2", function (d) { return (x(d.key) + boxWidth / 2) })
		.attr("y1", function (d) { return (y(d.value.min)) })
		.attr("y2", function (d) { return (y(d.value.min)) })
		.attr("stroke", "black")
		.style("stroke-width", "2")

	svg_heartRate.selectAll("meanCircle")
		.data(sumstat)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.key) })
		.attr("cy", function (d) { return (y(d.value.mean)) })
		.attr("stroke", function (d) { return color(dataFile) })
		.style("stroke-width", "2")
		.style("fill", function (d) { return color(dataFile) })
		.attr('r', 5.0)

	var jitterWidth = 70

	sumstat.forEach(function (d) {
		svg_heartRate.selectAll("outliers")
			.data(d.value.outliers)
			.enter()
			.append("circle")
			.attr("cx", function (d) { return x(d.when) - jitterWidth / 2 + Math.random() * jitterWidth })
			.attr("cy", function (d) { return y(d.HeartRate) })
			.attr("stroke", function (d) { return color(dataFile) })
			.style("stroke-width", "2")
			.style("fill", function (d) { return color(dataFile) })
			.style("fill-opacity", "0.2")
			.attr('r', 5.0)
	})

	svg_heartRate.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 0 - 70)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("font-size", "20px")
		.text("Heart Rate(bpm)");
}