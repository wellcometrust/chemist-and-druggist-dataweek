/*

WELLCOME DATA WEEK
Chemist and Druggist visualisation
Olivia Vane

*/

// Prevents jQuery and D3 clashing
jQuery.noConflict();

var data = [];

var csvs = [
    {term: 'inhaler', url: '../data/inhaler.csv'},
    {term: 'potters', url: '../data/potters.csv'}
];

csvs.forEach(function(item, index) {
    d3.csv(item.url, function(err, dataset) {
        if (err) throw err;

        var parser = d3.time.format.utc("%Y-%m-%dT%H:%M:%S");
        var prevDate;

        dataset.forEach(function (d) {
            d.term = item.term;
            d.date = parser.parse(d["date"]);
            if (prevDate && d.date.toString() === prevDate.toString()) {
                d.multiple = true;
            }
            d.month = 0;
            d.day = 0;
            d.imgurl = d["imgurl"];
            prevDate = d.date;

            data.push(d);
        });

        if (index === csvs.length - 1) {
            generateVis();
        }
    });
});



function generateVis() {
    data.forEach(function (d) {
        d.month = d.date.getMonth() + 1;
        d.day = d.date.getDate();
    });

    var imageWidth = 50;
    var imageHeight = 150;
    var imageVerticalPadding = 20;

    var formatTime = d3.time.format("%e %B %Y");

    var lowestDate = d3.min(data, function (d) {
        return d.date;
    });
    // console.log("lowest date = " + lowestDate);
    var highestDate = d3.max(data, function (d) {
        return d.date;
    });
    // console.log("highest date = " + highestDate);

    var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        width = 10000,
        height = 5000;

    ///Scales
    var x = d3.time.scale.utc()
        .domain([lowestDate, highestDate])
        .range([0, width]);

    var yMonth = d3.scale.linear()
        .domain([1, 12])
        .range([0, height]);

    var yDay = d3.scale.linear()
        .domain([1, 31])
        .range([0, height / 12]);

    /// ZOOM Behaviour
    var zoom = d3.behavior.zoom()
        .x(x)
        .scaleExtent([0.1, 100])
        .on('zoom', zoomed);
    var drag = d3.behavior.drag().origin(function (d) {
        return d;
    }).on('dragstart', dragstarted).on('drag', dragged).on('dragend', dragended);

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
    }

    function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }

    function dragended(d) {
        d3.select(this).classed("dragging", false);
    }
    //////////////

    var chart = d3.select('#visualisationWrapper')
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('id', 'chart')
        .call(zoom);

    chart.on('dblclick.zoom', null); // disable double-click zoom so dblclick can be used to select key-slides

    var main = d3.select('#chart')
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + 10 + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main');

    // draw the x axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('top')
        //.ticks(d3.time.year, 10)
        .ticks(15)
        .tickFormat(d3.time.format('%Y'))
        .tickPadding(20)
        .tickSize(6, 0, 0);

    var yMonthAxis = d3.svg.axis()
        .scale(yMonth)
        .orient('left')
        .ticks(12)
        //.tickValues(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
        .tickFormat(function (d) {
            switch (d) {
            case 1:
                return "Jan"
                break;
            case 2:
                return "Feb"
                break;
            case 3:
                return "Mar"
                break;
            case 4:
                return "Apr"
                break;
            case 5:
                return "May"
                break;
            case 6:
                return "Jun"
                break;
            case 7:
                return "Jul"
                break;
            case 8:
                return "Aug"
                break;
            case 9:
                return "Sep"
                break;
            case 10:
                return "Oct"
                break;
            case 11:
                return "Nov"
                break;
            case 12:
                return "Dec"
                break;
            };
        })
        .tickSize(6, 0, 0);

    function drawxAxis() {
        main.append('g')
            .attr('class', 'xaxis')
            .attr('transform', "translate(0," + -25 + ")")
            .attr('opacity', 1)
            .call(xAxis);
    }
    drawxAxis();

    function drawyMonthAxis() {
        main.append('g')
            .attr('class', 'yaxis')
            .attr('transform', "translate(" + -25 + "," + height / 24 + ")")
            .attr('opacity', 1)
            .call(yMonthAxis);
    }
    drawyMonthAxis();

    //draw grid lines
    main.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height * 1.15 + ")")
        .call(xAxis
            .tickSize(height * 1.15, 0, 0)
            .tickFormat("")
        );

    main.append("g")
        .attr("class", "gridMonth")
        .attr("transform", "translate(" + width + "," + 0 + ")")
        .call(yMonthAxis
            .tickSize(width, 0, 0)
            .tickFormat("")
        );

    function zoomed() {
        main.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        //  main.select(".xaxis").call(xAxis);
    }

    /************************
    	Visualise Images
    *************************/

    var node = main.selectAll('.node')
        .data(data)
        .enter().append('g')
        .attr('class', function(d) {
            var multi = d.multiple ? ' multi' : '';

            return "node " + d.term + multi;
        });

    // rects used to border images as svg images have no stroke attr

    var horizontalPadding = 5;

    var images = node.append('svg:image')
        .attr('xlink:href', function (d) {
            return d.imgurl;
        })
        .attr('data', function (d) {
            return d.date;
        })
        .attr('multi', function(d) {
            if (d.multiple) return 'true';
        })
        .call(rectDimensions)
        .on("mouseover", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(formatTime(d.date))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition().duration(100).style("opacity", 0)
        });

    function rectDimensions() {
        this.attr('width', imageWidth)
            .attr('height', imageHeight)
            .attr('x', function (d) {
                return x(d.date);
            })
            .attr('y', function (d) {
                return yMonth(d.month) + yDay(d.day);
            });
    }

    var div = d3.select("body")
        .append("div") // declare the tooltip div
        .attr("class", "tooltip") // apply the 'tooltip' class
        .style("opacity", 0); // set the opacity to nil

}


jQuery(document).on('click', '.toggler', function(event) {
    var $toggler = jQuery(this);
    var attrName = jQuery(this).attr('data-class');
    var $nodes = jQuery('.node.' + attrName);

    if (jQuery($nodes[0]).attr('data-active') === 'true') {
        $nodes.attr('data-active', 'false');
        $toggler.removeClass('is-active');
    } else {
        $nodes.attr('data-active', 'true');
        $toggler.addClass('is-active');
    }


});
