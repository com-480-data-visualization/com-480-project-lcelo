// This function defines the color per category that we want to display
// used to build the legend and the stack bar chart
function custom_color(d){
  switch (d) {
      case 'Ventilation': return "#BA3B46";
      case 'Hospitalization': return "#61C9A8";
      case 'ICU': return "#ED9B40";
    }
}

// Create the legend on the top left
function createChartLegend(mainDiv, group) {
    var z = d3.scaleOrdinal(d3.schemeCategory10);
    var mainDivName = mainDiv.substr(1, mainDiv.length);
    $(mainDiv).before("<div id='Legend_" + mainDivName + "' class='pmd-card-body' style='margin-top:0; margin-bottom:0;'></div>");
    var keys = group;
    keys.forEach(function(d) {
        var cloloCode = custom_color(d);
        $("#Legend_" + mainDivName).append("<span class='team-graph team1' style='display: inline-block; margin-right:10px;'>\
        <span style='background:" + cloloCode +
            ";width: 10px;height: 10px;display: inline-block;vertical-align: middle;'>&nbsp;</span>\
        <span style='padding-top: 0; sans-serif;font-size: 13px;display: inline;'>" + d +
            " </span>\
      </span>");
    });

}

// categories
var group = ["Hospitalization", "ICU", "Ventilation"];
// div concerned
var mainDiv = "#stackbar_chart";
var mainDivName = "stackbar_chart";

createChartLegend(mainDiv, group);

// data
const data_hospitalisation_promise = Promise.resolve(d3.json("data/switzerland/covid19_hosp_switzerland_openzh_clean_barchart.json"));

// once the promised data is there
data_hospitalisation_promise.then(function(data_hospitalisation)  {
  // we update viz with the first date ("2020-02-26") because otherwise the chart is not constructed
  update_viz(data_hospitalisation["2020-02-26"]);


  //---------- SLIDER AND PLAY BUTTON ----------//
  var dates = Object.keys(data_hospitalisation); //get all dates

  var startDate = new Date(dates[0]);
  var endDate = new Date(dates[dates.length - 1]);

  var formatDateIntoYear = d3.timeFormat("%d %b");
  var formatDate = d3.timeFormat("%d %B");
  var formatFromSlider = d3.timeFormat("%Y-%m-%d")

  var slider_margin = {top:0, right:50, bottom:0, left:50};

  var slider_svg = d3.select('#overview_slider');

  const svg_slider_viewbox = slider_svg.node().viewBox.animVal;
  const svg_slider_width = svg_slider_viewbox.width - slider_margin.left - slider_margin.right;
  const svg_slider_height = svg_slider_viewbox.height  - slider_margin.top - slider_margin.bottom;

  var moving = false;
  var currentValue = 0;
  var targetValue = svg_slider_width;
  var timer = 0;

  var playButton = d3.select("#overview-play-button");

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
        timer = setInterval(step, 300);
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
    update_viz(data_hospitalisation[date])
  }
  //---------- END SLIDER AND PLAY BUTTON ----------//


  // This function takes data for a specific data for all the cantons and update the stack bar chart
  function update_viz(data_hospitalisation_selected){


    //---------- PREPARATION (DATA AND EVERYTHING BEFORE PLOT) ----------//

    // take the data and get the key value
    data_hospitalisation_selected.forEach(function(d) {
        d = d.canton;
    });


    var layers = d3.stack()
        .keys(group)
        .offset(d3.stackOffsetDiverging)
        (data_hospitalisation_selected);

    // dynamic size
    var svg = d3.select("#overview_svg"),
        margin = {
            top: 20,
            right: 30,
            bottom: 60,
            left: 60
        },
        width = svg.node().viewBox.animVal.width,
        height = svg.node().viewBox.animVal.height;

    // to update the chart
    svg.selectAll("g").remove()

    // D3 js v4 uses scaleBand instead the normal scale
    //
    var x = d3.scaleBand()
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

    x.domain(data_hospitalisation_selected.map(function(d) {
        return d.canton;
    }))

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top]);

    y.domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])


    function stackMin(layers) {
        return d3.min(layers, function(d) {
            return d[0];
        });
    }

    function stackMax(layers) {
        return d3.max(layers, function(d) {
            return d[1];
        });
    }

    var z = d3.scaleOrdinal(d3.schemeCategory10);


    //---------- PLOT ----------//
    var maing = svg.append("g")
        .selectAll("g")
        .data(layers);

    // custom color for our plot
    var g = maing.enter().append("g")
        .attr("fill", function(d) {
          return custom_color(d.key);
        });

    // plot each rectangle
    var rect = g.selectAll("rect")
        .data(function(d) {
            d.forEach(function(d1) {
                d1.key = d.key;
                return d1;
            });
            return d;
        })
        .enter().append("rect")
        // data for when we hover
        .attr("data", function(d) {
            var data = {};
            data["key"] = d.key;
            data["value"] = d.data[d.key];
            data["canton"] = d.data["canton"];
            var total = 0;
            group.map(function(d1) {
                total = total + d.data[d1]
            });
            data["total"] = total;
            return JSON.stringify(data);
        })
        .attr("width", x.bandwidth)
        .attr("x", function(d) {
            return x(d.data.canton);
        })
        .attr("y", function(d) {
            return y(d[1]);
        })
        .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        });

    // when mouseover
    rect.on("mouseover", function() {
        var currentEl = d3.select(this);
        var fadeInSpeed = 120;
        d3.select("#recttooltip_" + mainDivName)
            .transition()
            .duration(fadeInSpeed)
            .style("opacity", function() {
                return 1;
            });
        d3.select("#recttooltip_" + mainDivName).attr("transform", function(d) {
            var mouseCoords = d3.mouse(this.parentNode);
            var xCo = 0;
            if (mouseCoords[0] + 10 >= width * 0.80) {
                xCo = mouseCoords[0] - parseFloat(d3.selectAll("#recttooltipRect_" + mainDivName)
                    .attr("width"));
            } else {
                xCo = mouseCoords[0] + 10;
            }
            var x = xCo;
            var yCo = 0;
            if (mouseCoords[0] + 10 >= width * 0.80) {
                yCo = mouseCoords[1] + 10;
            } else {
                yCo = mouseCoords[1];
            }
            var x = xCo;
            var y = yCo;
            return "translate(" + x + "," + y + ")";
        });
        // calculate tooltips text
        var tooltipData = JSON.parse(currentEl.attr("data"));
        var tooltipsText = "";
        d3.selectAll("#recttooltipText_" + mainDivName).text("");
        var yPos = 0;
        d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text("Canton " + tooltipData.canton);
        yPos = yPos + 2;
        d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(tooltipData.key + ":  " + tooltipData.value);
        yPos = yPos + 1;
        d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text("Total" + ":  " + tooltipData.total);


        // calculate width of the text based on characters
        var dims = helpers.getDimensions("recttooltipText_" + mainDivName);
        d3.selectAll("#recttooltipText_" + mainDivName + " tspan")
            .attr("x", dims.w + 4);

        d3.selectAll("#recttooltipRect_" + mainDivName)
            .attr("width", dims.w + 10)
            .attr("height", dims.h + 20);

    });

    rect.on("mousemove", function() {
        var currentEl = d3.select(this);
        currentEl.attr("r", 7);
        d3.selectAll("#recttooltip_" + mainDivName)
            .attr("transform", function(d) {
                var mouseCoords = d3.mouse(this.parentNode);
                var xCo = 0;
                if (mouseCoords[0] + 10 >= width * 0.80) {
                    xCo = mouseCoords[0] - parseFloat(d3.selectAll("#recttooltipRect_" + mainDivName)
                        .attr("width"));
                } else {
                    xCo = mouseCoords[0] + 10;
                }
                var x = xCo;
                var yCo = 0;
                if (mouseCoords[0] + 10 >= width * 0.80) {
                    yCo = mouseCoords[1] + 10;
                } else {
                    yCo = mouseCoords[1];
                }
                var x = xCo;
                var y = yCo;
                return "translate(" + x + "," + y + ")";
            });
    });
    rect.on("mouseout", function() {
        var currentEl = d3.select(this);
        d3.select("#recttooltip_" + mainDivName)
            .style("opacity", function() {
                return 0;
            })
            .attr("transform", function(d, i) {
                // klutzy, but it accounts for tooltip padding which could push it onscreen
                var x = -500;
                var y = -500;
                return "translate(" + x + "," + y + ")";
            });
    });
    //  label axis

    // x axis
    svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.bottom * 0.7)
        .attr("dx", "0.32em")
        .attr("fill", "#FFFFFF")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Swiss Cantons");

    // y axis
    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 15 - (margin.left))
        .attr("dy", "0.32em")
        .attr("fill", "#FFFFFF")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .text("People hospitalized for Covid-19");

    // hover
    var rectTooltipg = svg.append("g")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .attr("id", "recttooltip_" + mainDivName)
        .attr("style", "opacity:0")
        .attr("transform", "translate(-500,-500)");

    rectTooltipg.append("rect")
        .attr("id", "recttooltipRect_" + mainDivName)
        .attr("x", 0)
        .attr("width", 120)
        .attr("height", 80)
        .attr("opacity", 0.71)
        .style("fill", "#000000");

    rectTooltipg
        .append("text")
        .attr("id", "recttooltipText_" + mainDivName)
        .attr("x", 30)
        .attr("y", 15)
        .attr("fill", function() {
            return "#fff"
        })
        .style("font-size", function(d) {
            return 10;
        })
        .text(function(d, i) {
            return "";
        });


    var helpers = {
        getDimensions: function(id) {
            var el = document.getElementById(id);
            var w = 0,
                h = 0;
            if (el) {
                var dimensions = el.getBBox();
                w = dimensions.width;
                h = dimensions.height;
            } else {
                console.log("error: getDimensions() " + id + " not found.");
            }
            return {
                w: w,
                h: h
            };
        }
    };

  }; // end function update_viz

}); // end promise
