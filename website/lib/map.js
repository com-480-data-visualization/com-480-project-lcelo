class MapPlot {

	makeColorbar(svg, color_scale, top_left, colorbar_size, format) {

		const scaleClass=d3.scaleLinear;

		const value_to_svg = scaleClass()
			.domain(color_scale.domain())
			.range([colorbar_size[1], 0]);

		const range01_to_color = d3.scaleLinear()
			.domain([0, 1])
			.range(color_scale.range())
			.interpolate(color_scale.interpolate());

		// Axis numbers
		const colorbar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(format))

		const colorbar_g = this.svg.append("g")
			.attr("id", "colorbar")
			.attr("transform", "translate(" + top_left[0] + ', ' + top_left[1] + ")")
			.call(colorbar_axis);

		// Create the gradient
		function range01(steps) {
			return Array.from(Array(steps), (elem, index) => index / (steps-1));
		}

		const svg_defs = this.svg.append("defs");

		const gradient = svg_defs.append('linearGradient')
			.attr('id', 'colorbar-gradient')
			.attr('x1', '0%') // bottom
			.attr('y1', '100%')
			.attr('x2', '0%') // to top
			.attr('y2', '0%')
			.attr('spreadMethod', 'pad');

		gradient.selectAll('stop')
			.data(range01(10))
			.enter()
			.append('stop')
				.attr('offset', d => Math.round(100*d) + '%')
				.attr('stop-color', d => range01_to_color(d))
				.attr('stop-opacity', 1);

		// create the colorful rect
		colorbar_g.append('rect')
			.attr('id', 'colorbar-area')
			.attr('width', colorbar_size[0])
			.attr('height', colorbar_size[1])
			.style('fill', 'url(#colorbar-gradient)')
			.style('stroke', 'black')
			.style('stroke-width', '1px')
	}


	constructor(svg_element_id) {
		this.svg = d3.select('#' + svg_element_id);

		// may be useful for calculating scales
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;

		// D3 Projection
		// similar to scales
		const projection = d3.geoNaturalEarth1()
			.rotate([0, 0])
			.center([8.3, 46.8]) // WorldSpace: Latitude and longitude of center of switzerland
			.scale(13000)
			.translate([this.svg_width / 2, this.svg_height / 2]) // SVG space
			.precision(.1);

		// path generator to convert JSON to SVG paths
		const path_generator = d3.geoPath()
			.projection(projection);

		//Three color map, one per category
		const color_scale_cases = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(0,0,255)"])
			.domain([0, 5418])
			.interpolate(d3.interpolateRgb);

		const color_scale_cases_d = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(0,0,255)"])
			.domain([0,1.0246656522783695])
			.interpolate(d3.interpolateRgb);

		const color_scale_death = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(255,0,0)"])
			.domain([0, 401])
			.interpolate(d3.interpolateRgb);

		const color_scale_death_d = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(255,0,0)"])
			.domain([0,0.09735582705756163])
			.interpolate(d3.interpolateRgb);

		const color_scale_recov = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(0,255,0)"])
			.domain([0, 1075])
			.interpolate(d3.interpolateRgb);

		const color_scale_recov_d = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(0,255,0)"])
			.domain([0,0.4573185952930134])
			.interpolate(d3.interpolateRgb);

		//Get the data
		const cases_promise = d3.json("data/switzerland/covid19_cases_switzerland_openzh_clean.json").then((data) => {
				return data
			});

	const cases_densities_promise = d3.json("data/switzerland/covid19_cases_switzerland_openzh_clean_densities.json").then((data) => {
			return data
		});

		const death_promise = d3.json("data/switzerland/covid19_fatalities_switzerland_openzh_clean.json").then((data) => {
			return data
		});

		const death_densities_promise = d3.json("data/switzerland/covid19_fatalities_switzerland_openzh_clean_densities.json").then((data) => {
				return data
			});

		const recov_promise = d3.json("data/switzerland/covid19_released_switzerland_openzh_clean.json").then((data) => {
			return data
		});

		const recov_densities_promise = d3.json("data/switzerland/covid19_released_switzerland_openzh_clean_densities.json").then((data) => {
			return data
		});

		const map_promise = d3.json("data/map/ch-cantons.json").then((topojson_raw) => {
			const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.cantons);
			return canton_paths.features;
		});


		Promise.all([cases_promise, cases_densities_promise, death_promise, death_densities_promise, recov_promise, recov_densities_promise, map_promise]).then((results) => {
			let cases_data = results[0];
			let cases_data_d = results[1];
			let death_data = results[2];
			let death_data_d = results[3];
			let recov_data = results[4];
			let recov_data_d = results[5];
			let map_data = results[6];

			console.log(recov_data_d);

			//add the data as a property of the canton
			map_data.forEach(canton => {
				canton.properties.cases = cases_data[canton.id];
				canton.properties.casesD = cases_data_d[canton.id];
				canton.properties.deaths = death_data[canton.id];
				canton.properties.deathsD = death_data_d[canton.id];
				canton.properties.recovs = recov_data[canton.id];
				canton.properties.recovsD = recov_data_d[canton.id];
			});

			/*this.svg.append("circle").attr("cx",20).attr("cy",50).attr("r", 6).style("fill", "#ffbaba")
			this.svg.append("circle").attr("cx",20).attr("cy",70).attr("r", 6).style("fill", "#ff7b7b")
			this.svg.append("circle").attr("cx",20).attr("cy",90).attr("r", 6).style("fill", "#e71414")


			this.svg.append("text").attr("x", 40).attr("y", 50).text("Less than 0.6% Infected").style("font-size", "15px").attr("alignment-baseline","middle")
			this.svg.append("text").attr("x", 40).attr("y", 70).text("Between 0.6 and 0.8% Infected").style("font-size", "15px").attr("alignment-baseline","middle")
			this.svg.append("text").attr("x", 40).attr("y", 90).text("More than 0.8% infected").style("font-size", "15px").attr("alignment-baseline","middle")*/

			var case_b = true; //if data is cases
			var death_b = false; //if data is death
			var rel_b = false; //if relative data

			//---------- LINE CHART ----------//
			// set the dimensions and margins of the graph
			var chart_margin = {top: 5, right: 50, bottom: 20, left: 50};

			// append the svg object to the body of the page
			var chart = d3.select("#line-chart")
			.append("svg")
			.attr("id", "chart-svg")
			.attr("viewBox", "0 0 960 100")
			.attr("width", "90%")
			//.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + chart_margin.left + "," + chart_margin.top + ")");

			var chart_svg = d3.select("#chart-svg")

			const svg_chart_viewbox = chart_svg.node().viewBox.animVal;
			const svg_chart_width = svg_chart_viewbox.width - chart_margin.left - chart_margin.right;
			const svg_chart_height = svg_chart_viewbox.height  - chart_margin.top - chart_margin.bottom;

			// Add X axis --> it is a date format
			var x_chart = d3.scaleTime().range([ 0, svg_chart_width]);
			var xAxis = d3.axisBottom().scale(x_chart);
			chart.append("g")
			.attr("class","myXaxis")
			.attr("transform", "translate(0," + svg_chart_height + ")");

			// Add Y axis
			var y_chart = d3.scaleLinear().range([svg_chart_height, 0 ]);
			var yAxis = d3.axisLeft().scale(y_chart).ticks(5);
			chart.append("g")
			.attr("class","myYaxis");

			function update_chart_data(data) {
				// Create the X axis:
				x_chart.domain(d3.extent(data, function(d) { return new Date(d[0]); }));
				chart.selectAll(".myXaxis").transition()
				.duration(300)
				.call(xAxis);

				// create the Y axis
			  y_chart.domain([0, d3.max(data, function(d) { return + d[1]; })]);
			  chart.selectAll(".myYaxis")
			    .transition()
			    .duration(300)
			    .call(yAxis);

			  // Create a update selection: bind to the new data
			  var u = chart.selectAll(".lineTest")
			    .data([data], function(d){ return new Date(d[0]) });

			  // Updata the line
			  u
			    .enter()
			    .append("path")
			    .attr("class","lineTest")
			    .merge(u)
			    .transition()
			    .duration(300)
			    .attr("d", d3.line()
						.x(function(d) { return x_chart(new Date(d[0]))})
						.y(function(d) { return y_chart(d[1]) }))
			     .attr("fill", "none")
			     .attr("stroke", "steelblue")
			     .attr("stroke-width", 1.5)
					}

			update_chart_data(Object.entries(cases_data["CH"]))

			var focus = chart
			.append('g')
			.append('circle')
      .style("fill", "none")
      .attr("stroke", "CurrentColor")
      .attr('r', 3.5)
      .style("opacity", 1)
			.attr("cx", 0)
			.attr("cy", y_chart(0))

			var focusText = chart
			.append('g')
			.append('text')
      .style("opacity", 1)
			.attr("fill", "CurrentColor")
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")
			.attr("x", 0 + 7)
			.attr("y", y_chart(0) - 7)
			.html(Object.entries(cases_data["CH"])[0][1])

			function updatefocus(pos, data, date, limit, transition){

				focusText.html(data["CH"][date])
				if (transition){
					focus.transition().duration(300).attr("cx", x_chart(pos)).attr("cy", y_chart(data["CH"][date]))
					if (x_chart(pos) < limit){
						focusText.transition().duration(300).attr("x", x_chart(pos) + 7).attr("y", y_chart(data["CH"][date]) - 7)
					}else{
						focusText.transition().duration(300).attr("x", x_chart(pos) + 7).attr("y", y_chart(data["CH"][date]) + 7)
					}
				} else {
					focus.attr("cx", x_chart(pos)).attr("cy", y_chart(data["CH"][date]))
					if (x_chart(pos) < limit){
						focusText.attr("x", x_chart(pos) + 7).attr("y", y_chart(data["CH"][date]) - 7)
					}else{
						focusText.attr("x", x_chart(pos) + 7).attr("y", y_chart(data["CH"][date]) + 7)
					}
				}
			}

			//---------- SLIDER ----------//
			var dates = Object.keys(cases_data['AG']); //get all dates

			var startDate = new Date(dates[0]);
			var endDate = new Date(dates[dates.length - 1]);

			var formatDateIntoYear = d3.timeFormat("%d %b");
			var formatDate = d3.timeFormat("%d %B");
			var formatFromSlider = d3.timeFormat("%Y-%m-%d")

			var slider_margin = {top:0, right:50, bottom:0, left:50};

			var slider_svg = d3.select('#slider');

			const svg_slider_viewbox = slider_svg.node().viewBox.animVal;
			const svg_slider_width = svg_slider_viewbox.width - slider_margin.left - slider_margin.right;
			const svg_slider_height = svg_slider_viewbox.height  - slider_margin.top - slider_margin.bottom;

			var moving = false;
			var currentValue = 0;
			var targetValue = svg_slider_width;
			var timer = 0;

			var playButton = d3.select("#play-button");

			var x = d3.scaleTime()
					.domain([startDate, endDate])
					.range([0, svg_slider_width])
					.clamp(true);

			var slider = slider_svg.append("g")
					.attr("class", "slider")
					.attr("transform", "translate(" + slider_margin.left + "," + svg_slider_height/2 + ")");

			slider.append("line")
			.attr("class", "track")
			.attr("x1", x.range()[0])
			.attr("x2", x.range()[1])
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.attr("class", "track-inset")
			.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
			.attr("class", "track-overlay")
			.call(d3.drag()
				.on("start.interrupt", function() { slider.interrupt(); })
				.on("start drag", function() {
					currentValue = d3.event.x;
					update(x.invert(currentValue))
				})
			);

			slider.insert("g", ".track-overlay")
					.attr("class", "ticks")
					.attr("transform", "translate(0," + 18 + ")")
					.selectAll("text")
					.data(x.ticks(10))
					.enter()
					.append("text")
					.attr("fill", "CurrentColor")
					.attr("x", x)
					.attr("y", 10)
					.attr("text-anchor", "middle")
					.text(function(d) { return formatDateIntoYear(d); });

			var label = slider.append("text")
					.attr("class", "label")
					.attr("text-anchor", "middle")
					.text(formatDate(startDate))
					.attr("fill", "CurrentColor")
					.attr("transform", "translate(0," + (-25) + ")")

			var handle = slider.insert("circle", ".track-overlay")
					.attr("class", "handle")
					.attr("r", 9);

			playButton
				.on("click", function() {
					var button = d3.select(this);
					if (button.text() == "Pause") {
						moving = false;
						clearInterval(timer);
						// timer = 0;
						button.text("Play");
					} else {
						moving = true;
						timer = setInterval(step, 100);
						button.text("Pause");
					}
				});

			function step() {
				update(x.invert(currentValue));
				currentValue = currentValue + (targetValue/151);
				if (currentValue > targetValue) {
					moving = false;
					currentValue = 0;
					update(x.invert(currentValue));
					clearInterval(timer);
					// timer = 0;
					playButton.text("Play");
				}
			}

			function update(pos) {
				handle.attr("cx", x(pos));
				label
					.attr("x", x(pos))
					.text(formatDate(pos));

				var date = formatFromSlider(pos);

				if (!rel_b){
					if (case_b){
						cantons.style("fill",(d) => color_scale_cases(d.properties.cases[date]));
						updatefocus(pos, cases_data, date, 228, false)
						if (update_tt){
							tooltip2
								.html("Cases: " + current_canton.properties.cases[date] + "<br> Deaths: " + current_canton.properties.deaths[date] + "<br> Recovered: " + current_canton.properties.recovs[date])
						}
					} else if (death_b) {
						cantons.style("fill", (d) => color_scale_death(d.properties.deaths[date]));
						updatefocus(pos, death_data, date, 323, false)
						if (update_tt){
							tooltip2
								.html("Cases: " + current_canton.properties.cases[date] + "<br> Deaths: " + current_canton.properties.deaths[date] + " <br> Recovered: " + current_canton.properties.recovs[date])
						}
					} else {
						cantons.style("fill", (d) => color_scale_recov(d.properties.recovs[date]));
						updatefocus(pos, recov_data, date, 344, false)
						if (update_tt){
							tooltip2
								.html("Cases: " + current_canton.properties.cases[date] + "<br> Deaths: " + current_canton.properties.deaths[date] + "<br> Recovered: " + current_canton.properties.recovs[date])
						}
					}
				} else {
					if (case_b){
						cantons.style("fill",(d) => color_scale_cases_d(d.properties.casesD[date]));
						updatefocus(pos, cases_data_d, date, 228, false)
						if (update_tt){
							tooltip2
								.html("Cases: " + current_canton.properties.casesD[date] + "% <br> Deaths: " + current_canton.properties.deathsD[date] + "% <br> Recovered: " + current_canton.properties.recovsD[date]+ "%")
						}
					} else if (death_b) {
						cantons.style("fill", (d) => color_scale_death_d(d.properties.deathsD[date]));
						updatefocus(pos, death_data_d, date, 323, false)
						if (update_tt){
							tooltip2
								.html("Cases: " + current_canton.properties.casesD[date] + "% <br> Deaths: " + current_canton.properties.deathsD[date] + "% <br> Recovered: " + current_canton.properties.recovsD[date]+ "%")
						}
					} else {
						cantons.style("fill", (d) => color_scale_recov_d(d.properties.recovsD[date]));
						updatefocus(pos, recov_data_d, date, 344, false)
						if (update_tt){
							tooltip2
								.html("Cases: " + current_canton.properties.casesD[date] + "% <br> Deaths: " + current_canton.properties.deathsD[date] + "% <br> Recovered: " + current_canton.properties.recovsD[date]+ "%")
						}
					}
				}
			}

			//---------- TOOLTIP ----------//

			var current_canton = ""; //to know the canton in which the mouse is

			var update_tt = false; // if should update the tooltip (mouse is in a canton)

			//tooltip
			var tooltip2 = d3.select("#map_div")
			.append("div")
	    .style("position", "absolute")
	    .style("visibility", "hidden")
			.style("display", "none")
	    .style("background-color", "white")
	    .style("border", "solid")
	    .style("border-width", "1px")
	    .style("border-radius", "5px")
	    .style("padding", "10px");

			// Three function that change the tooltip when user hover / move / leave a cell
			var mouseover = function(d) {
				current_canton = d;
				update_tt = true;
				tooltip2
					.style("opacity", 1)
					.style("visibility", "visible")
					.style("display", "block")
					.style("left", (d3.mouse(this)[0]) + "px")
					.style("top", (d3.mouse(this)[1]) + d3.select("#map_intro").node().getBoundingClientRect()["height"]+ "px")
					console.log(d3.mouse(this)[1])
			}

			var mousemove = function(d) {
				var date = formatFromSlider(x.invert(currentValue));

				if (rel_b){
					tooltip2.html("Cases: " + d.properties.casesD[date] + "% <br> Deaths: " + d.properties.deathsD[date] + "% <br> Recovered: " + d.properties.recovsD[date] + "%")
				} else {
					tooltip2.html("Cases: " + d.properties.cases[date] + "<br> Deaths: " + d.properties.deaths[date] + "<br> Recovered: " + d.properties.recovs[date])
				}

				tooltip2
				.style("opacity", 1)
					.style("left", (d3.mouse(this)[0]) + "px")
					.style("top", (d3.mouse(this)[1]) + 225 + "px")
			}

			var mouseout = function(d) {
				update_tt = false;
				tooltip2
				.style("opacity", 0)
				.style("visibility", "hidden")
			}

			d3.select("#map_div").on("mouseleave",mouseout)

			//---------- MAP ----------//
			this.map_container = this.svg.append('g');
			this.label_container = this.svg.append('g');
			console.log(this.map_container);
			//draw canton
			var cantons = this.map_container.selectAll(".canton")
				.data(map_data)
				.enter()
				.append("path")
				.classed("canton", true)
				.attr("d", path_generator)
				.style("fill", (d) => color_scale_cases(null))
				.on("mouseover", mouseover)
      	.on("mousemove", mousemove)
      	//.on("mouseleave", mouseout);

			// put the names of canton
			this.label_container.selectAll(".canton-label")
				.data(map_data)
				.enter().append("text")
				.classed("canton-label", true)
				.attr("transform", (d) => "translate(" + path_generator.centroid(d) + ")")
				.attr("dy", ".35em")
				.text((d) => d.id);

			plot_object.makeColorbar(this.svg, color_scale_cases, [40, 30], [20, this.svg_height - 2*30],".0f");

			//---------- DATA BUTTONS ----------//
			var case_button = d3.select("#case-btn");
			var death_button = d3.select("#death-btn");
			var recov_button = d3.select("#recov-btn");
			var abs_button = d3.select("#abs-btn");
			var rel_button = d3.select("#rel-btn")

			function change_color(button, cond, color = "forestgreen"){
        if (cond) {
          button.style("background-color", color)
        } else {
          button.style("background-color", "#f2f2f2")
        }
      }

		case_button
			.on("click", function() {
				case_b = true;
				death_b = false;

				change_color(case_button,case_b);
				change_color(death_button,death_b);
				change_color(recov_button,!(case_b || death_b));

				var date = formatFromSlider(x.invert(currentValue));

				if (!rel_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_cases(d.properties.cases[date]));
					}
					update_chart_data(Object.entries(cases_data["CH"]));
					updatefocus(x.invert(currentValue), cases_data, date, 228, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_cases, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".0f");
				} else {
					if (!moving) {
						cantons.style("fill", (d) => color_scale_cases_d(d.properties.casesD[date]));
					}
					update_chart_data(Object.entries(cases_data_d["CH"]));
					updatefocus(x.invert(currentValue), cases_data_d, date, 228, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_cases_d, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".3f");
				}
			});

			death_button
			.on("click", function() {
				case_b = false;
				death_b = true;

				change_color(case_button,case_b);
				change_color(death_button,death_b);
				change_color(recov_button,!(case_b || death_b));

				var date = formatFromSlider(x.invert(currentValue));

				if (!rel_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_death(d.properties.deaths[date]));
					}
					update_chart_data(Object.entries(death_data["CH"]))
					updatefocus(x.invert(currentValue), death_data, date, 323, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_death, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".0f");
				} else {
					if (!moving) {
						cantons.style("fill", (d) => color_scale_death_d(d.properties.deathsD[date]));
					}
					update_chart_data(Object.entries(death_data_d["CH"]))
					updatefocus(x.invert(currentValue), death_data_d, date, 323, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_death_d, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".3f");
				}
			});

			recov_button
			.on("click", function() {
				case_b = false;
				death_b = false;

				change_color(case_button,case_b);
				change_color(death_button,death_b);
				change_color(recov_button,!(case_b || death_b));

				var date = formatFromSlider(x.invert(currentValue));

				if (!rel_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_recov(d.properties.recovs[date]));
					}
					update_chart_data(Object.entries(recov_data["CH"]))
					updatefocus(x.invert(currentValue), recov_data, date, 344, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_recov, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".0f");
				} else {
					if (!moving) {
						cantons.style("fill", (d) => color_scale_recov_d(d.properties.recovsD[date]));
					}
					update_chart_data(Object.entries(recov_data_d["CH"]))
					updatefocus(x.invert(currentValue), recov_data_d, date, 344, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_recov_d, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".3f");
				}
			});

			abs_button
			.on("click", function() {
				rel_b = false;
				change_color(abs_button, !rel_b);
				change_color(rel_button, rel_b);
				var date = formatFromSlider(x.invert(currentValue));
				if(case_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_cases(d.properties.cases[date]));
					}
					update_chart_data(Object.entries(cases_data["CH"]));
					updatefocus(x.invert(currentValue), cases_data, date, 200, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_cases, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".0f");
				} else if (death_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_death(d.properties.deaths[date]));
					}
					update_chart_data(Object.entries(death_data["CH"]));
					updatefocus(x.invert(currentValue), death_data, date, 200, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_death, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".0f");
				} else {
					if (!moving) {
						cantons.style("fill", (d) => color_scale_recov(d.properties.recovs[date]));
					}
					update_chart_data(Object.entries(recov_data["CH"]));
					updatefocus(x.invert(currentValue), recov_data, date, 200, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_recov, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".0f");
				}
			});

			rel_button
			.on("click", function() {
				rel_b = true;
				change_color(abs_button, !rel_b);
				change_color(rel_button, rel_b);
				var date = formatFromSlider(x.invert(currentValue));
				if(case_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_cases_d(d.properties.casesD[date]));
					}
					update_chart_data(Object.entries(cases_data_d["CH"]));
					updatefocus(x.invert(currentValue), cases_data_d, date, 200, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_cases_d, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".3f");
				} else if (death_b){
					if (!moving) {
						cantons.style("fill", (d) => color_scale_death_d(d.properties.deathsD[date]));
					}
					update_chart_data(Object.entries(death_data_d["CH"]));
					updatefocus(x.invert(currentValue), death_data_d, date, 200, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_death_d, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".3f");
				} else {
					if (!moving) {
						cantons.style("fill", (d) => color_scale_recov_d(d.properties.recovsD[date]));
					}
					update_chart_data(Object.entries(recov_data_d["CH"]));
					updatefocus(x.invert(currentValue), recov_data_d, date, 200, true);
					d3.select("#map-plot").select("#colorbar").remove();
					d3.select("defs").remove();
					plot_object.makeColorbar(d3.select('#' + svg_element_id), color_scale_recov_d, [40, 30], [20, d3.select('#' + svg_element_id).node().viewBox.animVal.height - 2*30],".3f");
				}
			});
		});
	}
}

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	plot_object = new MapPlot('map-plot');
	// plot object is global, you can inspect it in the dev-console
});
