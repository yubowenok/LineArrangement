var canvas;
var width;
var height;
var linearrangement;
var currentLine;
var points = [null, null];
var uiStatus;
var edgesNotFinal = [];
var edgesFinal = [];
var drawNewFaces = false;

var searchingEdges = [];
var foundEdges = [];
var highlightEdges = [];
var splitFaces = [];

var UI_STATUS = {
  WAIT_P1: 0,
  WAIT_P2: 1,
  SEARCH_EDGE : 2,
  SEARCH_EDGE_PRIME : 3,
  DRAW_FACES: 4,
  REMOVE: 5,
};

function updateStatusTable() {

  var statusList = [
    "Waiting new line",
    "Searching intersection with BB",
    "Searching E'",
    "Split face",
  ];

  // map uiStatus -> statusList item
  var uiStatusEquiv = {
    0: 0,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 3,
  };

  // row for each status
  // cell in each row
  var tbody = d3.select(".statustable tbody");
  tbody
    .selectAll("tr")
    .data(statusList)
    .attr("class", function(d, i) {
      return (uiStatusEquiv[uiStatus] == i) ? "bold" : "normal";
    })
  .enter()
    .append("tr")
    .attr("class", function(d, i) {
      return (uiStatusEquiv[uiStatus] == i) ? "bold" : "normal";
    })
    .append("td")
    .text(function(d) { return d; });
}


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

function lineArrangementNext() {

  console.log(linearrangement.nextStep);

  if (linearrangement.done()){
    updateCanvas();
    return;
  }

  console.log(linearrangement.nextStep);

  var status = linearrangement.status();

  switch(uiStatus){

    case UI_STATUS.DRAW_FACES:
      splitFaces[0] = status.splitface1;
      splitFaces[1] = status.splitface2;
      highlightEdges.length = 0;
      uiStatus = UI_STATUS.REMOVE;
      linearrangement.next();
      break;

    case UI_STATUS.REMOVE:
      searchingEdges.length = 0;
      foundEdges.length = 0;
      splitFaces.length = 0;
      highlightEdges.length = 0;
      linearrangement.next();
      if(linearrangement.nextStep==linearrangement.NEXTSTEP.NOP){
        uiStatus = UI_STATUS.WAIT_P1;
      }
      else{
        // Bowen: continue searching
        searchingEdges[0] = status.E;
        searchingEdges[1] = status.E_prime;
        uiStatus = UI_STATUS.SEARCH_EDGE_PRIME;
      }
      break;


    case UI_STATUS.SEARCH_EDGE:
      searchingEdges[0] = status.E ;
      uiStatus = UI_STATUS.SEARCH_EDGE_PRIME;
      break;


    case UI_STATUS.SEARCH_EDGE_PRIME:
      searchingEdges[1] = status.E_prime;
      uiStatus = UI_STATUS.SEARCH_EDGE_PRIME;
      linearrangement.next();
      //Found the edges
      if(linearrangement.nextStep==linearrangement.NEXTSTEP.MOVE_TO_NEXT_FACE){
        foundEdges[0] = status.E;
        foundEdges[1] = status.E_prime;
        highlightEdges.push(linearrangement.edge1);
        searchingEdges.length = 0;
        uiStatus = UI_STATUS.DRAW_FACES;
      }
      break;
  }

  updateCanvas();
}


function updateCanvas(){

  updateStatusTable();

  createOrUpdateEdges(canvas, "searchingEdge", searchingEdges, "searchingEdge");
  createOrUpdateEdges(canvas, "foundEdge", foundEdges, "foundEdge");
  createOrUpdateEdges(canvas, "highlightEdge", highlightEdges, "highlightEdge");
  createOrUpdateFace(canvas, "splitFace1", splitFaces[0], "splitFace1");
  createOrUpdateFace(canvas, "splitFace2", splitFaces[1], "splitFace2");

  //Draw every added edge so far
  var currentEdge = linearrangement.dcel.listEdge.head;
  var addedEdges = [];
  while(currentEdge != null){
    addedEdges.push(currentEdge.content);
    currentEdge = currentEdge.next;
  }
  createOrUpdateEdges(canvas, "addedEdge", addedEdges, "addedEdge");

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
      uiStatus = UI_STATUS.SEARCH_EDGE;
      currentLine = getLineFromPoints(points);
      linearrangement.addLine(currentLine);

      updateCanvas();

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

}

function createOrUpdateFace(parentElem, polyId, face, classname){

  var points = [];

  //Traverse the face
  if(face != null){
    var currentEdge = face.outerComponent;
    do{

      var startVertex = currentEdge.origin;
      var endVertex = currentEdge.next.origin;

      points.push([width*startVertex.x, height*startVertex.y]);
      points.push([width*endVertex.x, height*endVertex.y]);

      currentEdge = currentEdge.next;
    }
    while(currentEdge != face.outerComponent)
  }


  createOrUpdatePolygon(parentElem, polyId, points, classname);

}

function createOrUpdatePolygon(parentElem, polyId, points, classname){


  var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear");

  var path = parentElem.selectAll("#"+polyId)
    .data(points)
    .attr("d", line(points));

  path.exit().remove();

  path.enter()
    .append("path")
    .attr("class", classname)
    .attr("id", polyId)
    .attr("d", line(points));

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

function createOrUpdateEdges(parentElem, edgesId, edgesList, classname){

  var newEdges = parentElem.selectAll("."+classname)
    .data(edgesList)
    .attr("class", classname)
    .attr("x1", function(d) { return width*d.origin.x; })
    .attr("y1", function(d) { return height*d.origin.y; })
    .attr("x2", function(d) { return width*d.next.origin.x; })
    .attr("y2", function(d) { return height*d.next.origin.y; });
  newEdges.enter()
    .append("line")
    .attr("class", classname)
    .attr("id", edgesId)
    .attr("x1", function(d) { return width*d.origin.x; })
    .attr("y1", function(d) { return height*d.origin.y; })
    .attr("x2", function(d) { return width*d.next.origin.x; })
    .attr("y2", function(d) { return height*d.next.origin.y; });
  newEdges.exit()
    .remove();

}

function createOrUpdateLine(parentElem, lineId, pts, classname) {

  var line = getLineFromPoints(pts);
  var inters = cgutils.intersectLineBoundingBox(line, 0, 0, 1, 1);
  var bbpts = [[width  * inters[0].intersection.x,
                height * inters[0].intersection.y],
               [width  * inters[1].intersection.x,
                height * inters[1].intersection.y]];

  createOrUpdateSegment(parentElem, lineId, bbpts, classname);

}

function createOrUpdateSegment(parentElem, lineId, pts, classname){


  var newLine = parentElem.selectAll("#"+lineId)
    .data([pts])
    .attr("class", classname)
    .attr("x1", pts[0][0])
    .attr("y1", pts[0][1])
    .attr("x2", pts[1][0])
    .attr("y2", pts[1][1])

  newLine.exit()
    .remove();

  newLine.enter()
    .append("line")
    .attr("class", classname)
    .attr("id", lineId)
    .attr("x1", pts[0][0])
    .attr("y1", pts[0][1])
    .attr("x2", pts[1][0])
    .attr("y2", pts[1][1]);

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
  updateCanvas();
}

window.onload = initializeLayout;
