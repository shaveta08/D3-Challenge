var width = 1000;
var height = 700;

var svg = d3
	.select("#scatter")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var margins = {
	left: 100,
	right: 100,
	top: 100,
	bottom: 100,
};

var chartWidth = width - margins.left - margins.right;
var chartHeight = height - margins.top - margins.bottom;

var chartGroup = svg
	.append("g")
	.attr("transform", `translate(${margins.left},${margins.top})`);

var Xselected = "poverty";
var Yselected = "healthcare";

function selectXscale(data, Xselected) {
	var xnewscale = d3
		.scaleLinear()
		.domain([
			d3.min(data, (item) => item[Xselected]),
			d3.max(data, (item) => item[Xselected]),
		])
		.range([0, chartWidth]);
	return xnewscale;
}
function selectYscale(data, Yselected) {
	var ynewscale = d3
		.scaleLinear()
		.domain([
			d3.min(data, (item) => item[Yselected]),
			d3.max(data, (item) => item[Yselected]),
		])
		.range([chartHeight, 0]);
	return ynewscale;
}

function renderXAxes(newXScale, xaxis) {
	var bottomAxis = d3.axisBottom(newXScale);

	xaxis.transition().duration(1000).call(bottomAxis);

	return xaxis;
}

function renderYAxes(newYScale, yaxis) {
	var leftAxis = d3.axisLeft(newYScale);

	yaxis.transition().duration(1000).call(leftAxis);

	return yaxis;
}

function renderXCircles(circleGroup, newScale, Xselected) {
	circleGroup
		.transition()
		.duration(1000)
		.attr("cx", (d) => newScale(d[Xselected]));

	return circleGroup;
}

function renderXText(textGroup, newScale, Xselected) {
	textGroup
		.transition()
		.duration(1000)
		.attr("x", (d) => newScale(d[Xselected]));

	return textGroup;
}

function renderYCircles(circleGroup, newScale, Yselected) {
	circleGroup
		.transition()
		.duration(1000)
		.attr("cy", (d) => newScale(d[Yselected]));

	return circleGroup;
}

function renderYText(textGroup, newScale, Yselected) {
	textGroup
		.transition()
		.duration(1000)
		.attr("y", (d) => newScale(d[Yselected]));

	return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(Xselected, Yselected, circleGroup) {
	var label_x;
	var label_y;

	if (Xselected === "poverty") {
		label_x = "poverty:";
	} else if (Xselected === "age") {
		label_x = "age:";
	} else label_x = "household:";

	if (Yselected === "obesity") {
		label_y = "obesity:";
	} else if (Yselected === "smokes") {
		label_y = "smokes:";
	} else if (Yselected === "healthcare") {
		label_y = "healthCare:";
	}
	var toolTip = d3
		.tip()
		.attr("class", "tooltip")
		.offset([80, -60])
		.html(function (d) {
			return `${d.state}<br>${label_x} ${d[Xselected]} <br>${label_y} ${d[Yselected]} `;
		});

	circleGroup.call(toolTip);

	circleGroup
		.on("mouseover", function (data) {
			toolTip.show(data);
		})
		// onmouseout event
		.on("mouseout", function (data, index) {
			toolTip.hide(data);
		});

	return circleGroup;
}
d3.csv("./assets/data/data.csv").then(function (data) {
	console.log(data);

	// Correct the data in the dataset.
	data.forEach((item) => {
		item.age = +item.age;
		item.healthcare = +item.healthcare;
		item.income = +item.income;
		item.obesity = +item.obesity;
		item.poverty = +item.poverty;
		item.smokes = +item.smokes;
	});

	// Creating default xscale and yscale with selected xaxis.
	var xscale = selectXscale(data, Xselected);

	var yscale = selectYscale(data, Yselected);

	//creating the x and y axis
	var xaxis_ = d3.axisBottom(xscale);
	var yaxis_ = d3.axisLeft(yscale);

	// attach the axis to the group.
	var xaxis = chartGroup
		.append("g")
		.attr("transform", `translate(0,${chartHeight})`)
		.call(xaxis_);
	var yaxis = chartGroup.append("g").call(yaxis_);

	var circleGroup = chartGroup
		.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("color", "pink")
		.attr("cx", (item) => xscale(item[Xselected]))
		.attr("cy", (item) => yscale(item[Yselected]))
		.attr("r", "10")
		.attr("fill", "pink");

	var textGroup_ = chartGroup.append("g");

	var textGroup = textGroup_
		.selectAll("text")
		.data(data)
		.enter()
		.append("text")
		.text(function (item) {
			return item.abbr;
		})
		.attr("x", (item) => xscale(item[Xselected]))
		.attr("y", (item) => yscale(item[Yselected]))
		.attr("font-family", "sans-serif")
		.attr("font-size", "10px")
		.attr("fill", "black")
		.attr("text-anchor", "middle");

	var labelGroup = chartGroup
		.append("g")
		.attr("transform", `translate(${chartWidth / 2},${chartHeight + 20})`);

	var Xpoverty = labelGroup
		.append("text")
		.text(" In Poverty(%)")
		.attr("x", 0)
		.attr("y", 20)
		.attr("value", "poverty")
		.classed("active", true);

	var XAge = labelGroup
		.append("text")
		.text(" Age(Median)")
		.attr("x", 0)
		.attr("y", 50)
		.attr("value", "age")
		.classed("inactive", true);

	var Xhousehold_income = labelGroup
		.append("text")
		.text(" Household Income(Median)")
		.attr("x", 0)
		.attr("y", 80)
		.attr("value", "income")
		.classed("inactive", true);

	var labelGroupY = chartGroup.append("g").attr("transform", "rotate(-90)");
	var YObese = labelGroupY
		.append("text")
		.text(" Obese(%)")
		.attr("x", -250)
		.attr("y", -100)
		.attr("value", "obesity")
		.attr("dy", "1em")
		.classed("inactive", true);
	var YSmokes = labelGroupY
		.append("text")
		.text(" Smokes(%)")
		.attr("x", -250)
		.attr("y", -80)
		.attr("value", "smokes")
		.attr("dy", "1em")
		.classed("inactive", true);
	var YHealthcare = labelGroupY
		.append("text")
		.text(" HealthCare(%)")
		.attr("x", -250)
		.attr("y", -60)
		.attr("value", "healthcare")
		.attr("dy", "1em")
		.classed("active", true);

	circleGroup = updateToolTip(Xselected, Yselected, circleGroup);

	labelGroup.selectAll("text").on("click", function () {
		var value = d3.select(this).attr("value");
		if (value != Xselected) {
			console.log(value);
			Xselected = value;
			var xscale = selectXscale(data, Xselected);
			xaxis = renderXAxes(xscale, xaxis);

			circleGroup = renderXCircles(circleGroup, xscale, Xselected);
			TextGroup = renderXText(textGroup, xscale, Xselected);
			circleGroup = updateToolTip(Xselected, Yselected, circleGroup);
			// changes classes to change bold text
			if (Xselected === "poverty") {
				Xpoverty.classed("active", true).classed("inactive", false);
				Xhousehold_income.classed("active", false).classed("inactive", true);
				XAge.classed("active", false).classed("inactive", true);
			} else if (Xselected === "income") {
				Xpoverty.classed("active", false).classed("inactive", true);
				Xhousehold_income.classed("active", true).classed("inactive", false);
				XAge.classed("active", false).classed("inactive", true);
			} else {
				Xpoverty.classed("active", false).classed("inactive", true);
				Xhousehold_income.classed("active", false).classed("inactive", true);
				XAge.classed("active", true).classed("inactive", false);
			}
		}
	});
	labelGroupY.selectAll("text").on("click", function () {
		var value = d3.select(this).attr("value");
		if (value != Xselected) {
			console.log(value);
			Yselected = value;
			var yscale = selectYscale(data, Yselected);
			yaxis = renderYAxes(yscale, yaxis);

			circleGroup = renderYCircles(circleGroup, yscale, Yselected);
			TextGroup = renderYText(textGroup, yscale, Yselected);
			circleGroup = updateToolTip(Xselected, Yselected, circleGroup);
			// changes classes to change bold text
			if (Yselected === "obesity") {
				YObese.classed("active", true).classed("inactive", false);
				YSmokes.classed("active", false).classed("inactive", true);
				YHealthcare.classed("active", false).classed("inactive", true);
			} else if (Yselected === "smokes") {
				YObese.classed("active", false).classed("inactive", true);
				YSmokes.classed("active", true).classed("inactive", false);
				YHealthcare.classed("active", false).classed("inactive", true);
			} else {
				YObese.classed("active", false).classed("inactive", true);
				YSmokes.classed("active", false).classed("inactive", true);
				YHealthcare.classed("active", true).classed("inactive", false);
			}
		}
	});
});
