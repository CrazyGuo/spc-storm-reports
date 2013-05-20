var stormReports = function() {
  var self = this;
  var h = document.height;
  var w = document.width;
  
  this.projection = d3.geo.albers()
    .scale(900)
    .center([-0, 38])
    .translate([w / 2, h / 2]);

  this.path = d3.geo.path()
    .projection(this.projection);

  this.layer_viz = d3.select("#map").append("svg")
  
  this.zoom = d3.behavior.zoom()
    .translate(this.projection.translate())
    .scale(this.projection.scale())
    .on("zoom", function() {
      //console.log(d3.event.scale, self.projection.scale())
      self.projection.translate(d3.event.translate).scale(d3.event.scale);
      self.prev_event = d3.event.scale;

      self.project();
  });
  this.layer_viz.call(this.zoom);
  
  this.updatePath();
  
  this.createMap();
  this.loadReports();
}


stormReports.prototype.project = function(){
  var self = this;
  var path = this.path;

  this.layer_viz.selectAll('path')
    .attr("d", path);
    
  d3.selectAll("circle")
    .attr("transform", function(d) { return "translate(" + self.projection([d.longitude,d.latitude]) + ")";})

}

stormReports.prototype.updatePath = function() {
  var h  = document.height;
  var w  = document.width;

  //this.projection = d3.geo.Eckert1() //Composer.Map.projection.name ]()
  this.projection = d3.geo.albers()
    .scale(1300)
    .center([-0, 38])
    .translate([w / 2, h / 2]);


  this.path = d3.geo.path()
      .projection( this.projection );
}


stormReports.prototype.createMap = function () {
  var self = this;
  
  d3.json("data/world.json", function(error, world) {
    self.layer_viz.insert("path")
      .datum(topojson.object(world, world.objects.world))
      .attr('class', 'world')
      .attr("d", self.path);
      
    self.layer_viz.insert("path")
      .datum(topojson.object(world, world.objects.counties))
      .attr('class', 'counties')
      .attr("d", self.path);
      
  });
}

stormReports.prototype.loadReports = function() {
  var self = this;
  
  //d3.csv("http://www.spc.noaa.gov/climo/reports/today_torn.csv")
   d3.csv('data/today_wind.csv')
    .row(function(d) { return { time: d.Time, scale: d.F_Scale, location: d.Location, county: d.County,
      state: d.State, latitude: d.Lat, longitude: d.Lon, comments: d.Comments}; })
    .get(function(error, rows) {
      var reports = self.layer_viz.append('g');

      reports.selectAll("circle")
        .data(rows)
      .enter().insert("circle")
        .attr("transform", function(d) { return "translate(" + self.projection([d.longitude,d.latitude]) + ")";})
        .attr("fill", "blue")
        .attr('class', 'storm-reports')
        .attr('r', 2)
        .style("display", "block");
     });
     
    d3.csv('data/today_hail.csv')
    .row(function(d) { return { time: d.Time, scale: d.F_Scale, location: d.Location, county: d.County,
      state: d.State, latitude: d.Lat, longitude: d.Lon, comments: d.Comments}; })
    .get(function(error, rows) {
      var reports = self.layer_viz.append('g');

      reports.selectAll("circle")
        .data(rows)
      .enter().insert("circle")
        .attr("transform", function(d) { return "translate(" + self.projection([d.longitude,d.latitude]) + ")";})
        .attr("fill", "white")
        .attr('class', 'storm-reports')
        .attr('r', 2)
        .style("display", "block");
     });
     
   d3.csv('data/today_torn.csv')
    .row(function(d) { return { time: d.Time, scale: d.F_Scale, location: d.Location, county: d.County,
      state: d.State, latitude: d.Lat, longitude: d.Lon, comments: d.Comments}; })
    .get(function(error, rows) {
      var reports = self.layer_viz.append('g');

      reports.selectAll("circle")
        .data(rows)
      .enter().insert("circle")
        .attr("transform", function(d) { return "translate(" + self.projection([d.longitude,d.latitude]) + ")";})
        .attr("fill", "red")
        .attr('class', 'storm-reports')
        .attr('r', 3)
        .style("display", "block")
        .on('mouseover', function() {
          d3.select(this)
            .attr('d', self.hover)
            .transition()
              .duration(1000)
              .attr('r', 10)
            .transition()
              .duration(400)
              .attr('r', 3)  
        })
        
     });
}

stormReports.prototype.hover = function(d) { 
  console.log('D', d)
  var county = d.county;
  var state = d.state;
  var location = d.location;
  
  $('#intro').hide();
  $('#state').html('<span class="legend-title">State</span>: ' + d.state);
  $('#county').html('<span class="legend-title">County</span>: ' + d.county);
  $('#comments').html('<span class="legend-title">Comments</span>: ' + d.comments);
}