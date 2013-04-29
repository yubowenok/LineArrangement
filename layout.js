var canvas;
var width;
var height;
var linearrangement;
var points = [null, null];
var linesToInsert = [];
var uiStatus;

var UI_STATUS = {
  WAIT_P1: 0,
  WAIT_P2: 1,
  ADD_LINE : 2,
};




function addRandomLine() {

  var max = 1;
  var min = 0;
  var x1 = Math.random() * (max - min) + min;
  var x2 = Math.random() * (max - min) + min;
  var y1 = Math.random() * (max - min) + min;
  var y2 = Math.random() * (max - min) + min;
  var segment = cgutils.Segment(x1, y1, x2, y2);
  linearrangement.addLine(cgutils.LineFromSegment(segment));

}

function draw() {

  // Draw existing lines
  var lines = linearrangement.lines;
  console.log("Lines:");
  console.log(lines);
  canvas.selectAll(".addedLine").remove();
  for (var i=0; i < lines.length; i++) {

    //intersect width bb edges
    var pts = cgutils.intersectLineBoundingBox(lines[i], 0, 0, 1, 1);
    if(pts.length >= 2){
      canvas.append("line")
        .attr("class", "addedLine")
        .attr("x1", width*pts[0].intersection.x)
        .attr("y1", height*pts[0].intersection.y)
        .attr("x2", width*pts[1].intersection.x)
        .attr("y2", height*pts[1].intersection.y);
    }
  }

  //Draw edges
  var currentFace = linearrangement.dcel.listFace.head;
  do{
    var currentEdge = currentFace.content.innerComponent;

    do{

      var startVertex = currentEdge.origin;
      var endVertex = currentEdge.next.origin;

      canvas.append("line")
        .attr("class", "addedLine")
        .attr("x1", width*startVertex.x)
        .attr("y1", height*startVertex.y)
        .attr("x2", width*endVertex.x)
        .attr("y2", height*endVertex.y);

      currentEdge = currentEdge.next;
      console.log(currentEdge != null);
    }
    while(currentEdge != currentFace.content.innerComponent)

    currentFace = currentFace.next;
  }
  while(currentFace.content.innerComponent != null)


  // TODO draw vertices

  // TODO draw segments of added line

}

function lineArrangementNext() {
  var index = linearrangement.lines.length;
  var totalLines = linesToInsert.length
  if(linearrangement.done() && index < totalLines){
    //addRandomLine();
    linearrangement.addLine(linesToInsert[index]);
    draw();
  }
  linearrangement.next();
  
}

function mouseup(mousePos) {
  switch (uiStatus) {
    case UI_STATUS.WAIT_P1:
      points[0] = mousePos;
      uiStatus = UI_STATUS.WAIT_P2;
      break;
    case UI_STATUS.WAIT_P2:
      points[1] = mousePos;
      d3.select("svg").selectAll("#p1").remove();
      uiStatus = UI_STATUS.ADD_LINE;
      var line = getLineFromPoints(points);
      linearrangement.addLine(line);
      break;
    default:
      break;
  };
}

function mouseout(mousePos) {
  //if (uiStatus == UI_STATUS.WAIT_P1) {
  //  var svg = d3.select("svg")
  //    .selectAll("#p1")
  //    .remove();
  //}
}

function mousemove(mousePos) {

  var svg = d3.select("svg");

  // TODO highlight faces/edges or update inserted line
  switch (uiStatus) {
    case UI_STATUS.WAIT_P1:
      createOrUpdatePoint(svg, "p1", mousePos, "lineextremity");
      break;
    case UI_STATUS.WAIT_P2:
      createOrUpdateLine(svg, "newLine", [points[0], mousePos], "newLine");
      break;
    case UI_STATUS.ADD_LINE:
    
      break;
    default:
      break;
  };


  /*
  mousepos = d3.mouse(this);
  console.log(mousepos);

  if(pointToInsert[0] == null)
    pointToInsert[0] = mousepos;
  else {
    pointToInsert[1] = mousepos;

    var segment = cgutils.Segment(pointToInsert[0][0]/width, pointToInsert[0][1]/height,
       pointToInsert[1][0]/width, pointToInsert[1][1]/height);

    var line = cgutils.LineFromSegment(segment);

    var pts = cgutils.intersectLineBoundingBox(line, 0, 0, 1, 1);

    var svg = canvas.append("line")
          .attr("x1", width*pts[0].intersection.x)
          .attr("y1", height*pts[0].intersection.y)
          .attr("x2", width*pts[1].intersection.x)
          .attr("y2", height*pts[1].intersection.y)
          .attr("stroke-width", 2)
          .attr("stroke", "grey");

    pointToInsert = [null, null];
    linesToInsert.push(line);
  }
  */

}

function createOrUpdatePoint(parentElem, pointId, xy, classname) {
  var point = parentElem.selectAll("#"+pointId)
    .data([pointId])
    .attr("cx", function() { return xy[0]; })
    .attr("cy", function() { return xy[1]; });

  point.exit().remove();

  point.enter()
    .append("circle")
    .attr("class", classname)
    .attr("id", pointId)
    .attr("r", 2)
    .attr("cx", function() { return xy[0]; })
    .attr("cy", function() { return xy[1]; });
}

function getLineFromPoints(pts) {
  var segment = cgutils.Segment(pts[0][0]/width, pts[0][1]/height,
                                pts[1][0]/width, pts[1][1]/height);
  return cgutils.LineFromSegment(segment);
}

function createOrUpdateLine(parentElem, lineId, pts, classname) {

  var line = getLineFromPoints(pts);
  var inters = cgutils.intersectLineBoundingBox(line, 0, 0, 1, 1);
  var bbpts = [[width  * inters[0].intersection.x,
                height * inters[0].intersection.y],
               [width  * inters[1].intersection.x,
                height * inters[1].intersection.y]];

  var newLine = parentElem.selectAll("#"+lineId)
    .data([pts])
    .attr("x1", bbpts[0][0])
    .attr("y1", bbpts[0][1])
    .attr("x2", bbpts[1][0])
    .attr("y2", bbpts[1][1])

  newLine.exit()
    .remove();

  newLine.enter()
    .append("line")
    .attr("class", classname)
    .attr("id", lineId)
    .attr("x1", bbpts[0][0])
    .attr("y1", bbpts[0][1])
    .attr("x2", bbpts[1][0])
    .attr("y2", bbpts[1][1]);
}

      

function initializeLayout() {

  var widthStyle  = d3.select("#canvas").style('width');
  var heightStyle = d3.select("#canvas").style('height');
  width  = widthStyle.substring(0, widthStyle.length-2);
  height = heightStyle.substring(0, heightStyle.length-2);

  canvas = d3.select("#canvas")
        .append("svg:svg")
        .attr("width",  widthStyle)
        .attr("height", heightStyle);
  canvas.append("svg:rect")
        .attr("width",  width)
        .attr("height", height);
  canvas
        .on("mousedown", function() {
          mouseup(d3.mouse(this));})
        .on("mouseout", function() {
          mouseout(d3.mouse(this));})
        .on("mousemove", function() {
          mousemove(d3.mouse(this));});


  var dcel = new DCEL();
  dcel.constructBoundingBox(0, 1, 0, 1);
  linearrangement = new LineArrangement(dcel);

  // waiting for first point
  uiStatus = UI_STATUS.WAIT_P1;

  //randomLines();
  draw();
}

window.onload = initializeLayout;
