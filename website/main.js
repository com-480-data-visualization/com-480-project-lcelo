class MapPlot {

	/*makeColorbar(svg, color_scale, top_left, colorbar_size, scaleClass=d3.scaleLog) {

		const value_to_svg = scaleClass()
			.domain(color_scale.domain())
			.range([colorbar_size[1], 0]);

		const range01_to_color = d3.scaleLinear()
			.domain([0, 1])
			.range(color_scale.range())
			.interpolate(color_scale.interpolate());

		// Axis numbers
		const colorbar_axis = d3.axisLeft(value_to_svg)
			.tickFormat(d3.format(".0f"))

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
	}*/


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

		//colormap for population density
		const color_scale = d3.scaleLinear()
			.range(["rgb(255,255,255)", "rgb(255,0,0)"])
			.interpolate(d3.interpolateRgb);

		const cases_promise = d3.json("data/switzerland/covid19_cases_switzerland_openzh_clean_densities.json").then((data) => {
			return data
		});

		const map_promise = d3.json("data/map/ch-cantons.json").then((topojson_raw) => {
			const canton_paths = topojson.feature(topojson_raw, topojson_raw.objects.cantons);
			return canton_paths.features;
		});

		/*const point_promise = d3.csv("data/locations.csv").then((data) => {
			let new_data = [];

			for(let idx = 0; idx < data.length; idx += 10) {
				new_data.push(data[idx]);
			}

			return new_data;
		});*/


		Promise.all([cases_promise, map_promise]).then((results) => {
			let cases_data = results[0];
			let map_data = results[1];

			//let point_data = results[2];

			map_data.forEach(canton => {
				canton.properties.cases = cases_data[canton.id];
			});

			// color_scale.domain([d3.quantile(densities, .01), d3.quantile(densities, .99)]);
			color_scale.domain([0, 1]);


			//console.log(color_scale(11892));

			// Order of creating groups decides what is on top
			this.map_container = this.svg.append('g');
			this.cases_container = this.svg.append('g');

			this.svg.append("circle").attr("cx",20).attr("cy",50).attr("r", 6).style("fill", "#ffbaba")
			this.svg.append("circle").attr("cx",20).attr("cy",70).attr("r", 6).style("fill", "#ff7b7b")
			this.svg.append("circle").attr("cx",20).attr("cy",90).attr("r", 6).style("fill", "#e71414")


			this.svg.append("text").attr("x", 40).attr("y", 50).text("Less than 0.6% Infected").style("font-size", "15px").attr("alignment-baseline","middle")
			this.svg.append("text").attr("x", 40).attr("y", 70).text("Between 0.6 and 0.8% Infected").style("font-size", "15px").attr("alignment-baseline","middle")
			this.svg.append("text").attr("x", 40).attr("y", 90).text("More than 0.8% infected").style("font-size", "15px").attr("alignment-baseline","middle")

			//this.label_container = this.svg.append('g'); // <- is on top

			//color the map according to the density of each canton
			var cantons = this.map_container.selectAll(".canton")
				.data(map_data)
				.enter()
				.append("path")
				.classed("canton", true)
				.attr("d", path_generator)
				.style("fill", (d) => color_scale(null));

			this.cases_container.selectAll(".canton-label")
				.data(map_data)
				.enter().append("text")
				.classed("canton-label", true)
				.attr("transform", (d) => "translate(" + path_generator.centroid(d) + ")")
				//.translate((d) => path_generator.centroid(d))
				.attr("dy", ".35em")
				.text((d) => d.properties.name);

		/*	const r = 3;


			this.point_container.selectAll(".point")
				.data(point_data)
				.enter()
				.append("circle")
				.classed("point", true)
				.attr("r", r)
				.attr("cx", -r)
				.attr("cy", -r)
				.attr("transform", (d) => "translate(" + projection([d.lon, d.lat]) + ")")
				;

			this.makeColorbar(this.svg, color_scale, [50, 30], [20, this.svg_height - 2*30]);*/

			/// SLIDER ///
		var dates = Object.keys(cases_data['AG']);

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

		var legend = slider_svg.append("g")
				.attr('class','legend')


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
          	update(x.invert(currentValue));
					})
				);

		slider.insert("g", ".track-overlay")
		    .attr("class", "ticks")
		    .attr("transform", "translate(0," + 18 + ")")
		  .selectAll("text")
		    .data(x.ticks(10))
		    .enter()
		    .append("text")
		    .attr("x", x)
		    .attr("y", 10)
		    .attr("text-anchor", "middle")
		    .text(function(d) { return formatDateIntoYear(d); });

		var label = slider.append("text")
		    .attr("class", "label")
		    .attr("text-anchor", "middle")
		    .text(formatDate(startDate))
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
		    console.log("Slider moving: " + moving);
		  });

		function step() {
			update(x.invert(currentValue));
		  currentValue = currentValue + (targetValue/151);
		  if (currentValue > targetValue) {
		    moving = false;
		    currentValue = 0;
		    clearInterval(timer);
		    // timer = 0;
		    playButton.text("Play");
		    console.log("Slider moving: " + moving);
		  }
	}

		function update(pos) {
		  handle.attr("cx", x(pos));
		  label
		    .attr("x", x(pos))
		    .text(formatDate(pos));

			var date = formatFromSlider(pos);

			cantons.style("fill", (d) => color_scale(d.properties.cases[date]));
		}
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
