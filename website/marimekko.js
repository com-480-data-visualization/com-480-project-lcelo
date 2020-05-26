class MarimekkoPlot {

  constructor(svg_element_id) {
		this.svg = d3.select('#' + svg_element_id);

		// may be useful for calculating scales
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;

		//Get the data
		const hosp_promise = d3.json("data/switzerland/covid19_hosp_switzerland_openzh_clean.json").then((data) => {
				return data
			});

		Promise.all([hosp_promise]).then((results) => {
      let hosp_data = results[0];

      var active_cantons = ["GE", "TI", "VS"];

      //---------- MARIMEKKO ----------//
      const margin = ({top: 30, right: -1, bottom: -1, left: 1}),
      width = this.svg_width,
      height = this.svg_height;

      function update_viz(hosp_data, svg=d3.select('#mari-plot')){

        var data = hosp_data.filter(d => !(active_cantons.indexOf(d.x) === -1));

        var color = d3.scaleOrdinal(d3.schemeSet3).domain(data.map(d => d.y))

        var format = d => d.toLocaleString();

        var treemap = data => d3.treemap()
            .round(true)
            .tile(d3.treemapSliceDice)
            .size([
              width - margin.left - margin.right,
              height - margin.top - margin.bottom
            ])
          (d3.hierarchy(
            {
              values: d3.nest()
                  .key(d => d.x)
                  .key(d => d.y)
                .entries(data)
            },
            d => d.values
          ).sum(d => d.value))
          .each(d => {
            d.x0 += margin.left;
            d.x1 += margin.left;
            d.y0 += margin.top;
            d.y1 += margin.top;
          })

        const root = treemap(data);

        //svg.style("font", "10px sans-serif");

        svg.selectAll("g").remove()

        const node = svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

        const column = node.filter(d => d.depth === 1).filter(d => d.value > 0);

        column.append("text")
          .attr("x", 3)
          .attr("y", "-1.7em")
          .style("font-weight", "bold")
          .attr("fill", "CurrentColor")
          .text(d => d.data.key);

        column.append("text")
          .attr("x", 3)
          .attr("y", "-0.5em")
          .attr("fill-opacity", 0.7)
          .attr("fill", "CurrentColor")
          .text(d => format(d.value));

        column.append("line")
          .attr("x1", -0.5)
          .attr("x2", -0.5)
          .attr("y1", -30)
          .attr("y2", d => d.y1 - d.y0)
          .attr("fill", "CurrentColor")
          .attr("stroke", "#000")

        const cell = node.filter(d => d.depth === 2).filter(d => d.value > 0);

        cell.append("rect")
          .attr("fill", d => color(d.data.key))
          //.attr("fill-opacity", (d, i) => d.value / d.parent.value)
          .attr("width", d => Math.max(d.x1 - d.x0 - 1,0))
          .attr("height", d => Math.max(d.y1 - d.y0 - 1,0));

        cell.append("text")
          .attr("x", 3)
          .attr("y", "1.1em")
          .text(d => d.data.key);

        cell.append("text")
          .attr("x", 3)
          .attr("y", "2.3em")
          .attr("fill-opacity", 0.7)
          .text(d => format(d.value));
      }

      update_viz(hosp_data["2020-02-26"]);


      //---------- SLIDER ----------//

      var dates = Object.keys(hosp_data); //get all dates

			var startDate = new Date(dates[0]);
			var endDate = new Date(dates[dates.length - 1]);

			var formatDateIntoYear = d3.timeFormat("%d %b");
			var formatDate = d3.timeFormat("%d %B");
			var formatFromSlider = d3.timeFormat("%Y-%m-%d")

			var slider_margin = {top:0, right:50, bottom:0, left:50};

			var slider_svg = d3.select('#mari_slider');

			const svg_slider_viewbox = slider_svg.node().viewBox.animVal;
			const svg_slider_width = svg_slider_viewbox.width - slider_margin.left - slider_margin.right;
			const svg_slider_height = svg_slider_viewbox.height  - slider_margin.top - slider_margin.bottom;

      var moving = false;
			var currentValue = 0;
			var targetValue = svg_slider_width;
			var timer = 0;

      var playButton = d3.select("#mari-play-button");

			var x = d3.scaleTime()
					.domain([startDate, endDate])
					.range([0, svg_slider_width])
					.clamp(true);

			var slider = slider_svg.append("g")
					.attr("class", "slider")
					.attr("transform", "translate(" + slider_margin.left + "," + svg_slider_height/2 + ")");


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
					console.log("Slider moving: " + moving);
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
					console.log("Slider moving: " + moving);
				}
			}

      function update(pos) {
				handle.attr("cx", x(pos));
				label
					.attr("x", x(pos))
					.text(formatDate(pos));

				var date = formatFromSlider(pos);
        update_viz(hosp_data[date])
      }

      //---------- BUTTONS ----------//
      function removeItemOnce(arr, value) {
          var index = arr.indexOf(value);
          if (index > -1) {
              arr.splice(index, 1);
          }
          return arr;
      }

      function update_array(array, canton){
        if (array.indexOf(canton) === -1) {
          array.push(canton);
        } else {
          removeItemOnce(array, canton);
        }
      }

      function change_color(button, color = "forestgreen"){
        console.log(button);
        if (button.style("background-color") != color){
          button.style("background-color", color)
        } else {
          button.style("background-color", "#f2f2f2")
        }
      }


      var ag_button = d3.select("#ag-btn");
      ag_button.on("click", function() {
        change_color(ag_button)
        update_array(active_cantons,"AG")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });
      var ai_button = d3.select("#ai-btn");
      ai_button.on("click", function() {
        change_color(ai_button)
        update_array(active_cantons,"AI")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ar_button = d3.select("#ar-btn");
      ar_button.on("click", function() {
        change_color(ar_button)
        update_array(active_cantons,"AR")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var be_button = d3.select("#be-btn");
      be_button.on("click", function() {
        change_color(be_button)
        update_array(active_cantons,"BE")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var bl_button = d3.select("#bl-btn");
      bl_button.on("click", function() {
        change_color(bl_button)
        update_array(active_cantons,"BL")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var bs_button = d3.select("#bs-btn");
      bs_button.on("click", function() {
        change_color(bs_button)
        update_array(active_cantons,"BS")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var fr_button = d3.select("#fr-btn");
      fr_button.on("click", function() {
        change_color(fr_button)
        update_array(active_cantons,"FR")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ge_button = d3.select("#ge-btn");
      ge_button.on("click", function() {
        change_color(ge_button)
        update_array(active_cantons,"GE")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var gl_button = d3.select("#gl-btn");
      gl_button.on("click", function() {
        change_color(gl_button)
        update_array(active_cantons,"GL")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var gr_button = d3.select("#gr-btn");
      gr_button.on("click", function() {
        change_color(gr_button)
        update_array(active_cantons,"GR")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ju_button = d3.select("#ju-btn");
      ju_button.on("click", function() {
        change_color(ju_button)
        update_array(active_cantons,"JU")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var lu_button = d3.select("#lu-btn");
      lu_button.on("click", function() {
        change_color(lu_button)
        update_array(active_cantons,"LU")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ne_button = d3.select("#ne-btn");
      ne_button.on("click", function() {
        change_color(ne_button)
        update_array(active_cantons,"NE")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var nw_button = d3.select("#nw-btn");
      nw_button.on("click", function() {
        change_color(nw_button)
        update_array(active_cantons,"NW")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ow_button = d3.select("#ow-btn");
      ow_button.on("click", function() {
        change_color(ow_button)
        update_array(active_cantons,"OW")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var sg_button = d3.select("#sg-btn");
      sg_button.on("click", function() {
        change_color(sg_button)
        update_array(active_cantons,"SG")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var sh_button = d3.select("#sh-btn");
      sh_button.on("click", function() {
        change_color(sh_button)
        update_array(active_cantons,"SH")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var so_button = d3.select("#so-btn");
      so_button.on("click", function() {
        change_color(so_button)
        update_array(active_cantons,"SO")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var sz_button = d3.select("#sz-btn");
      sz_button.on("click", function() {
        change_color(sz_button)
        update_array(active_cantons,"SZ")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var tg_button = d3.select("#tg-btn");
      tg_button.on("click", function() {
        change_color(tg_button)
        update_array(active_cantons,"TG")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ti_button = d3.select("#ti-btn");
      ti_button.on("click", function() {
        change_color(ti_button)
        update_array(active_cantons,"TI")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var ur_button = d3.select("#ur-btn");
      ur_button.on("click", function() {
        change_color(ur_button)
        update_array(active_cantons,"UR")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var vd_button = d3.select("#vd-btn");
      vd_button.on("click", function() {
        change_color(vd_button)
        update_array(active_cantons,"VD")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var vs_button = d3.select("#vs-btn");
      vs_button.on("click", function() {
        change_color(vs_button)
        update_array(active_cantons,"VS")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var zg_button = d3.select("#zg-btn");
      zg_button.on("click", function() {
        change_color(zg_button)
        update_array(active_cantons,"ZG")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
      });

      var zh_button = d3.select("#zh-btn");
      zh_button.on("click", function() {
        change_color(zh_button,"DarkGreen")
        update_array(active_cantons,"ZH")
        update_viz(hosp_data[formatFromSlider(x.invert(currentValue))])
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
	plot_object = new MarimekkoPlot('mari-plot');
	// plot object is global, you can inspect it in the dev-console
});
