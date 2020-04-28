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
			.range(["hsl(62,100%,90%)", "hsl(228,30%,20%)"])
			.interpolate(d3.interpolateHcl);

		const cases_promise = d3.csv("data/switzerland/covid19_cases_switzerland.csv").then((data) => {
			let date_to_cases = {};
			data.forEach((row) => {
				console.log(row);
				date_to_cases[row.Date] =  Object.assign({}, row);
				delete date_to_cases[row.Date].Date;
			});
			return date_to_cases["2020-03-25"];
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
				canton.properties.cases = parseFloat(cases_data[canton.id]);
			});

			const cases = Object.values(cases_data).map(Number);
			// color_scale.domain([d3.quantile(densities, .01), d3.quantile(densities, .99)]);
			color_scale.domain([0, 11892]);

			console.log(color_scale(11892));

			// Order of creating groups decides what is on top
			this.map_container = this.svg.append('g');
			this.cases_container = this.svg.append('g');

			//this.label_container = this.svg.append('g'); // <- is on top

			//color the map according to the density of each canton
			this.map_container.selectAll(".canton")
				.data(map_data)
				.enter()
				.append("path")
				.classed("canton", true)
				.attr("d", path_generator)
				.style("fill", (d) => color_scale(d.properties.cases));

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
