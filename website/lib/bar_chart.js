function custom_color(d){
  switch (d) {
      case 'Ventilation': return "#BA3B46";
      case 'Hospitalization': return "#61C9A8";
      case 'ICU': return "#ED9B40";
    }
}

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
            <span style='padding-top: 0;font-family:Source Sans Pro, sans-serif;font-size: 13px;display: inline;'>" + d +
                " </span>\
          </span>");
        });

    }
    var group = ["Hospitalization", "ICU", "Ventilation"];
    var mainDiv = "#charts";
    var mainDivName = "charts";
    // createChartLegend(mainDiv, group);


    const data_hospitalisation_promise = Promise.resolve(d3.json("data/switzerland/covid19_hosp_switzerland_openzh_clean_barchart.json"));

    data_hospitalisation_promise.then(function(data_hospitalisation)  {

      // if we want only active_cantons
      // var active_cantons = ["GE", "TI", "VS"];

      update_viz(data_hospitalisation["2020-02-26"]);


      //---------- SLIDER ----------//

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
        update_viz(data_hospitalisation[date])
      }

      // //---------- BUTTONS (if we want active cantons) ----------//
      // function removeItemOnce(arr, value) {
      //     var index = arr.indexOf(value);
      //     if (index > -1) {
      //         arr.splice(index, 1);
      //     }
      //     return arr;
      // }
      //
      // function update_array(array, canton){
      //   if (array.indexOf(canton) === -1) {
      //     array.push(canton);
      //   } else {
      //     removeItemOnce(array, canton);
      //   }
      // }
      //
      // function change_color(button, color = "forestgreen"){
      //   if (button.style("background-color") != color){
      //     button.style("background-color", color)
      //   } else {
      //     button.style("background-color", "#f2f2f2")
      //   }
      // }
      //
      //
      // var ag_button = d3.select("#ag-btn");
      // ag_button.on("click", function() {
      //   change_color(ag_button)
      //   update_array(active_cantons,"AG")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      // var ai_button = d3.select("#ai-btn");
      // ai_button.on("click", function() {
      //   change_color(ai_button)
      //   update_array(active_cantons,"AI")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ar_button = d3.select("#ar-btn");
      // ar_button.on("click", function() {
      //   change_color(ar_button)
      //   update_array(active_cantons,"AR")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var be_button = d3.select("#be-btn");
      // be_button.on("click", function() {
      //   change_color(be_button)
      //   update_array(active_cantons,"BE")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var bl_button = d3.select("#bl-btn");
      // bl_button.on("click", function() {
      //   change_color(bl_button)
      //   update_array(active_cantons,"BL")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var bs_button = d3.select("#bs-btn");
      // bs_button.on("click", function() {
      //   change_color(bs_button)
      //   update_array(active_cantons,"BS")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var fr_button = d3.select("#fr-btn");
      // fr_button.on("click", function() {
      //   change_color(fr_button)
      //   update_array(active_cantons,"FR")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ge_button = d3.select("#ge-btn");
      // ge_button.on("click", function() {
      //   change_color(ge_button)
      //   update_array(active_cantons,"GE")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var gl_button = d3.select("#gl-btn");
      // gl_button.on("click", function() {
      //   change_color(gl_button)
      //   update_array(active_cantons,"GL")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var gr_button = d3.select("#gr-btn");
      // gr_button.on("click", function() {
      //   change_color(gr_button)
      //   update_array(active_cantons,"GR")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ju_button = d3.select("#ju-btn");
      // ju_button.on("click", function() {
      //   change_color(ju_button)
      //   update_array(active_cantons,"JU")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var lu_button = d3.select("#lu-btn");
      // lu_button.on("click", function() {
      //   change_color(lu_button)
      //   update_array(active_cantons,"LU")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ne_button = d3.select("#ne-btn");
      // ne_button.on("click", function() {
      //   change_color(ne_button)
      //   update_array(active_cantons,"NE")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var nw_button = d3.select("#nw-btn");
      // nw_button.on("click", function() {
      //   change_color(nw_button)
      //   update_array(active_cantons,"NW")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ow_button = d3.select("#ow-btn");
      // ow_button.on("click", function() {
      //   change_color(ow_button)
      //   update_array(active_cantons,"OW")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var sg_button = d3.select("#sg-btn");
      // sg_button.on("click", function() {
      //   change_color(sg_button)
      //   update_array(active_cantons,"SG")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var sh_button = d3.select("#sh-btn");
      // sh_button.on("click", function() {
      //   change_color(sh_button)
      //   update_array(active_cantons,"SH")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var so_button = d3.select("#so-btn");
      // so_button.on("click", function() {
      //   change_color(so_button)
      //   update_array(active_cantons,"SO")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var sz_button = d3.select("#sz-btn");
      // sz_button.on("click", function() {
      //   change_color(sz_button)
      //   update_array(active_cantons,"SZ")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var tg_button = d3.select("#tg-btn");
      // tg_button.on("click", function() {
      //   change_color(tg_button)
      //   update_array(active_cantons,"TG")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ti_button = d3.select("#ti-btn");
      // ti_button.on("click", function() {
      //   change_color(ti_button)
      //   update_array(active_cantons,"TI")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var ur_button = d3.select("#ur-btn");
      // ur_button.on("click", function() {
      //   change_color(ur_button)
      //   update_array(active_cantons,"UR")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var vd_button = d3.select("#vd-btn");
      // vd_button.on("click", function() {
      //   change_color(vd_button)
      //   update_array(active_cantons,"VD")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var vs_button = d3.select("#vs-btn");
      // vs_button.on("click", function() {
      //   change_color(vs_button)
      //   update_array(active_cantons,"VS")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var zg_button = d3.select("#zg-btn");
      // zg_button.on("click", function() {
      //   change_color(zg_button)
      //   update_array(active_cantons,"ZG")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });
      //
      // var zh_button = d3.select("#zh-btn");
      // zh_button.on("click", function() {
      //   change_color(zh_button,"DarkGreen")
      //   update_array(active_cantons,"ZH")
      //   update_viz(data_hospitalisation[formatFromSlider(x.invert(currentValue))])
      // });



      //---------- SLIDER AND BUTTON END ----------//



      //
      // update_viz(data_hospitalisation['2020-03-17']);
      // //
      // // update_viz(data_hospitalisation['2020-03-18']);
      // //
      // update_viz(data_hospitalisation['2020-03-19']);
      // //
      // //
      // // update_viz(data_hospitalisation['2020-03-20']);
      // //
      // //
      // // update_viz(data_hospitalisation['2020-03-21']);
      // // update_viz(data_hospitalisation['2020-03-22']);
      // update_viz(data_hospitalisation['2020-03-04']);




      function update_viz(data_hospitalisation_selected_without_filtering){

        // if we want to filter the cantons
        // var data_hospitalisation_selected = data_hospitalisation_selected_without_filtering.filter(d => !(active_cantons.indexOf(d.canton) === -1));
        // if not filtered by cantons
        var data_hospitalisation_selected = data_hospitalisation_selected_without_filtering;//data_hospitalisation['2020-03-17'];


        data_hospitalisation_selected.forEach(function(d) {
            d = d.canton;
        });
        var layers = d3.stack()
            .keys(group)
            .offset(d3.stackOffsetDiverging)
            (data_hospitalisation_selected);

        var svg = d3.select("svg"),
            margin = {
                top: 20,
                right: 30,
                bottom: 60,
                left: 60
            },
            width = +svg.attr("width"),
            height = +svg.attr("height");

        svg.selectAll("g").remove()

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

        var maing = svg.append("g")
            .selectAll("g")
            .data(layers);


        var g = maing.enter().append("g")
            .attr("fill", function(d) {
              // colors


              return custom_color(d.key);

                // return z(d.key);
            });

        var rect = g.selectAll("rect")
            .data(function(d) {
                d.forEach(function(d1) {
                    d1.key = d.key;
                    return d1;
                });
                return d;
            })
            .enter().append("rect")
            .attr("data", function(d) {
                var data = {};
                data["key"] = d.key;
                data["value"] = d.data[d.key];
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
            //CBT:calculate tooltips text
            var tooltipData = JSON.parse(currentEl.attr("data"));
            var tooltipsText = "";
            d3.selectAll("#recttooltipText_" + mainDivName).text("");
            var yPos = 0;
            d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text(tooltipData.key + ":  " + tooltipData.value);
            yPos = yPos + 1;
            d3.selectAll("#recttooltipText_" + mainDivName).append("tspan").attr("x", 0).attr("y", yPos * 10).attr("dy", "1.9em").text("Total" + ":  " + tooltipData.total);
            //CBT:calculate width of the text based on characters
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

        svg.append("g")
            .attr("transform", "translate(0," + y(0) + ")")
            .call(d3.axisBottom(x))
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.bottom * 0.5)
            .attr("dx", "0.32em")
            .attr("fill", "#FFFFFF")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .text("Swiss Cantons");

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

        var rectTooltipg = svg.append("g")
            .attr("font-family", "sans-serif")
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
            .style("font-family", function(d) {
                return "arial";
            })
            .text(function(d, i) {
                return "";
            });


        // function type(d) {
        //     d.date = parseDate(new Date(d.date));
        //     group.forEach(function(c) {
        //         d[c] = +d[c];
        //     });
        //     return d;
        // }

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
