//queue
(function(){function n(n){function t(){for(;f=a<c.length&&n>p;){var u=a++,t=c[u],r=l.call(t,1);r.push(e(u)),++p,t[0].apply(null,r)}}function e(n){return function(u,l){--p,null==d&&(null!=u?(d=u,a=s=0/0,r()):(c[n]=l,--s?f||t():r()))}}function r(){null!=d?v(d):i?v(d,c):v.apply(null,[d].concat(c))}var o,f,i,c=[],a=0,p=0,s=0,d=null,v=u;return n||(n=1/0),o={defer:function(){return d||(c.push(arguments),++s,t()),o},await:function(n){return v=n,i=!1,s||r(),o},awaitAll:function(n){return v=n,i=!0,s||r(),o}}}function u(){}"undefined"==typeof module?self.queue=n:module.exports=n,n.version="1.0.4";var l=[].slice})();

var margin = {top: 0, left: 0, bottom: 0, right: 0}
  , width = parseInt(d3.select('#map').style('width'))
  , width = width - margin.left - margin.right
  , mapRatio = .55
  , height = width * mapRatio;


var topo,projection,path,svg,g;

var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");

setup(width,height);

function setup(width,height){

  projection = d3.geo.mercator().translate([0, 0]).scale(width / 2 / Math.PI);

  path = d3.geo.path().projection(projection);

  svg = d3.select("#map").append("svg")
      .attr("width", width)
      .attr("height", height);

  var outterg = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  g = outterg.append("g").attr("id", "innerg");

}

queue()
    .defer(d3.json, "data/world-110m-cia.json")
    .defer(d3.csv, "data/hindex.csv")
    .await(ready);

function ready(error, world, hindex) {

  //lets process the hindex data

  //how to grab maximum
  //var max = d3.max(hindex, function(d) { return parseInt(d.hindex); });

  //lets sort by hindex
  var sorted = hindex.sort(function(a, b){ return d3.descending(parseFloat(a.hindex), parseFloat(b.hindex)); });

  var split = [2.068, 2.261, 2.454, 2.647, 2.841, 3.034, 3.227, 3.420];
  // var colors = ["#F7FBFF","#DEEBF7","#C6DBEF","#9ECAE1","#6BAED6","#4292C6","#2171B5","#08519C","#08306B"];

  var colors = ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"];


  var color = d3.scale.threshold()
      .domain(split)
      .range(colors);

    topo = topojson.feature(world, world.objects.countries).features;

    var country = d3.select("#innerg").selectAll(".country").data(topo);

    //ofsets
    var offsetL = document.getElementById('map').offsetLeft+30;
    var offsetT =document.getElementById('map').offsetTop-30;

    country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.properties.iso; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", function(d,i) { 
        var m = hindex.filter(function(f){return f.iso == d.properties.iso});
        if(m.length>0){
            return color(m[0].hindex);
        }
      })
      .style("stroke", "#111")
      .on("mousemove", function(d,i) {
        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

        var tooltipHtml ="";

        var m = hindex.filter(function(f){return f.iso == d.properties.iso});

        if(m.length==0)return;

        var country = m[0];
        


        tooltipHtml += "<table class='graphTooltip'><thead><tr> <th>"+country.name+"</th><th>Happ. Idx</th><th>("+country.hindex+")</th></tr></thead>";

        tooltipHtml += "<tbody>";
        tooltipHtml += "<tr><td colspan='3'></br><strong>Detailed results:</strong></td></tr>";
        tooltipHtml += "<tr><td class='bordered'>Very Happy</td><td colspan='2'>"+country.vh+"%</td></tr>";
        tooltipHtml += "<tr><td class='bordered'>Rather Happy</td><td colspan='2'>"+country.rh+"%</td></tr>";
        tooltipHtml += "<tr><td class='bordered'>Not very happy</td><td colspan='2'>"+country.nvh+"%</td></tr>";
        tooltipHtml += "<tr><td class='bordered'>Not at all happy</td><td colspan='2'>"+country.naah+"%</td></tr>";

        var unknownSum = parseFloat(country.iar) + parseFloat(country.na) + parseFloat(country.dn);
        tooltipHtml += "<tr><td class='bordered'>Unknown</td><td colspan='2'>"+ unknownSum.toFixed(2) +"%</td></tr>";
        tooltipHtml += "</tbody></table>";

        tooltip.classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+offsetL)+"px; top:"+(mouse[1]+offsetT)+"px")
          .html(tooltipHtml);
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      });

    //create a custom legend
    var legend = '<ul><li><div style="background:#ccc;"></div><label>Unknown</label></li>';

    colors.forEach(function(f,i){
      if(i==0){
        var label = '1.875 – '+split[i];
      } else if(i==8){
        var label = split[i-1]+' – '+sorted[0].hindex;
      } else {
        var label = split[i-1]+' – '+split[i];
      }
      legend += '<li><div style="background:'+f+';"></div><label>'+label+'</label></li>';
    });

    legend+="</ul>";
    d3.select("#legend").html(legend);


    //create sorted html table
    var table = d3.select("#info").append("table").attr('class', "table"),
        thead = table.append("thead"),
        tbody = table.append("tbody"),
        theadtr = thead.append("tr");

        theadtr.append("th").text("Country");
        theadtr.append("th").text("Very happy %");
        theadtr.append("th").text("Rather happy %");
        theadtr.append("th").text("Not very happy %");
        theadtr.append("th").text("Not at all happy %");
        theadtr.append("th").text("Happiness Index");

    sorted.forEach(function(c){
      //tbody.append("tr").html('<td>'+c.country+'</td><td>'+c.hindex+'</td>');
      var cname = topo.filter(function(f){ return f.properties.iso == c.iso });
      var backgColor = color(c.hindex);

      if(cname.length>0){
        tbody.append("tr").html('<td>'+cname[0].properties.name+'</td>'+'<td>'+c.vh+'</td>'+'<td>'+c.rh+'</td>'+'<td>'+c.nvh+'</td>'+'<td>'+c.naah+'</td>'+'<td style="background-color:'+backgColor+';text-align: center;"><span style="padding: 4px;   background-color: white;">'+c.hindex+'</span></td>');
      }
    });

}
