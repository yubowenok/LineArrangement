var canvas;
var width;
var height;
var linearrangement;
var currentLine;
var points = [null, null];
var uiStatus;
var edgesNotFinal = [];
var edgesFinal = [];

var searchingEdges = [];
var foundEdges = [];
var highlightEdges = [];
var highlightHalfEdges = [];
var highlightVertices = [];
var splitFaces = [];

var UI_STATUS = {
  WAIT_P1: 0,
  WAIT_P2: 1,
  SEARCH_EDGE : 2,
  SEARCH_EDGE_PRIME : 3,
  DRAW_FACES: 4,
  REMOVE: 5,
};

function updateTables() {
  updateStatusTable();
  updateVerticesDCELTable();
  updateEdgesDCELTable();
  updateFacesDCELTable();
}

function updateVerticesDCELTable() {

  var vertices = [];
  var curV = linearrangement.dcel.listVertex.head;
  var vi = 1;
  while (curV != null) {
    var vertex = curV.content;
    vertices.push({
      'vertex' : "v" + vertex.index,
      'x'      : vertex.x.toFixed(2),
      'y'      : vertex.y.toFixed(2),
      'incedge': "e" + vertex.incidentEdge.index,      // TODO
    });
    curV = curV.next;
  }
  
  var columns = ["vertex", "x", "y", "incedge"];

  // row for each status
  // cell in each row
  var rows = d3.select("#verticestable tbody")
    .selectAll("tr")
    .data(vertices);

  // update existing rows
  rows
    .on("mouseover", function(v, i) {
      var vi = v.vertex.substring(1);
      pushVertexByIndex(vi);
    })
    .on("mouseout", function(v, i) {
      var vi = v.vertex.substring(1);
      removeVertexByIndex(vi);
    })
    .selectAll("td")
    .data(function(vertex) {
      var cols = columns.map(function(column) {
        return {column: column, value: vertex[column]};
      });
      return cols;
    })
    .text(function(d) { return d.value; });

  // add new rows
  rows.enter()
    .append("tr")
    .on("mouseover", function(v, i) {
      var vi = v.vertex.substring(1);
      pushVertexByIndex(vi);
    })
    .on("mouseout", function(v, i) {
      var vi = v.vertex.substring(1);
      removeVertexByIndex(vi);
    })
    .selectAll("td")
    .data(function(vertex) {
      var cols = columns.map(function(column) {
        return {column: column, value: vertex[column]};
      });
      return cols;
    })
    .enter()
    .append("td")
    .text(function(d) { return d.value; });

  // delete missing rows
  rows.exit().remove();
}

function updateEdgesDCELTable() {
  var edges = [];
  var curE = linearrangement.dcel.listEdge.head;
  while (curE != null) {
    var edge = curE.content;
    edges.push({
      'halfedge' : "e" + edge.index,
      'origin': "v" + edge.origin.index,
      'twin'      : "e" + edge.twin.index,
      'incidentface'      : edge.incidentFace == null ? "null" : "f" + edge.incidentFace.index,
      'next'      : "e" + edge.next.index,
      'prev'      : "e" + edge.prev.index,
    });
    curE = curE.next;
  }
  
  var columns = ["halfedge", "origin", "twin", "incidentface", "next", "prev"];

  // row for each status
  // cell in each row
  var rows = d3.select("#edgestable tbody")
    .selectAll("tr")
    .data(edges);

  // update existing rows
  rows
    .on("mouseover", function(e, i) {
      var ei = e.halfedge.substring(1);
      pushHalfEdgeByIndex(ei);
    })
    .on("mouseout", function(e, i) {
      var ei = e.halfedge.substring(1);
      removeHalfEdgeByIndex(ei);
    })
    .selectAll("td")
    .data(function(vertex) {
      var cols = columns.map(function(column) {
        return {column: column, value: vertex[column]};
      });
      return cols;
    })
    .text(function(d) { return d.value; });

  // add new rows
  rows.enter()
    .append("tr")
    .on("mouseover", function(e, i) {
      var ei = e.halfedge.substring(1);
      pushHalfEdgeByIndex(ei);
    })
    .on("mouseout", function(e, i) {
      var ei = e.halfedge.substring(1);
      removeHalfEdgeByIndex(ei);
    })
    .selectAll("td")
    .data(function(vertex) {
      var cols = columns.map(function(column) {
        return {column: column, value: vertex[column]};
      });
      return cols;
    })
    .enter()
    .append("td")
    .text(function(d) { return d.value; });

  // delete missing rows
  rows.exit().remove();
}

function updateFacesDCELTable() {
  var faces = [];
  var curF = linearrangement.dcel.listFace.head;
  while (curF != null) {
    var face = curF.content;
    faces.push({
      'face' : "f" + face.index,
      'outer': face.outerComponent == null ? "null" : "e" + face.outerComponent.index,
      'inner'      : face.innerComponent == null ? "null" : "e" + face.innerComponent.index,
    });
    curF = curF.next;
  }
  
  var columns = ["face", "outer", "inner"];

  // row for each status
  // cell in each row
  var rows = d3.select("#facestable tbody")
    .selectAll("tr")
    .data(faces);

  // update existing rows
  rows
    .on("mouseover", function(f, i) {
      var fi = f.face.substring(1);
      pushFaceByIndex(fi);
    })
    .on("mouseout", function(f, i) {
      var fi = f.face.substring(1);
      removeFaceByIndex(fi);
    })
    .selectAll("td")
    .data(function(vertex) {
      var cols = columns.map(function(column) {
        return {column: column, value: vertex[column]};
      });
      return cols;
    })
    .text(function(d) { return d.value; });

  // add new rows
  rows.enter()
    .append("tr")
    .on("mouseover", function(f, i) {
      var fi = f.face.substring(1);
      pushFaceByIndex(fi);
    })
    .on("mouseout", function(f, i) {
      var fi = f.face.substring(1);
      removeFaceByIndex(fi);
    })
    .selectAll("td")
    .data(function(vertex) {
      var cols = columns.map(function(column) {
        return {column: column, value: vertex[column]};
      });
      return cols;
    })
    .enter()
    .append("td")
    .text(function(d) { return d.value; });

  // delete missing rows
  rows.exit().remove();
}

function updateStatusTable() {

  var statusList = [
    "Wait new line",
    "Search intersection with BB",
    "Search exit edge",
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
  var rows = d3.select("#statustable tbody")
    .selectAll("tr")
    .data(statusList);
  rows
    .select("td")
    .attr("class", function(d, i) {
      return (uiStatusEquiv[uiStatus] == i) ? "bold" : "normal";
    });
  rows.enter()
    .append("tr")
    .append("td")
    .attr("class", function(d, i) {
      return (uiStatusEquiv[uiStatus] == i) ? "bold" : "normal";
    })
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

  //console.log(linearrangement.nextStep);

  if (linearrangement.done()){
    updateCanvas();
    return;
  }

  //console.log(linearrangement.nextStep);

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
  
  var currentFace = linearrangement.dcel.listFace.head;
  var i = 0;
  while(currentFace != null){

    if(currentFace.content.outerComponent != null)
      createOrUpdateFace(canvas, "face"+i, currentFace.content, "face");
    i++;

    
    currentFace = currentFace.next;
  }


  createOrUpdateFace(canvas, "splitFace1", splitFaces[0], "splitFace1");
  createOrUpdateFace(canvas, "splitFace2", splitFaces[1], "splitFace2");

  updateTables();

  createOrUpdateEdges(canvas, "searchingEdge", searchingEdges, "searchingEdge");
  createOrUpdateEdges(canvas, "foundEdge", foundEdges, "foundEdge");
  createOrUpdateEdges(canvas, "highlightEdge", highlightEdges, "highlightEdge");
  
  /*
  var currentEdge = linearrangement.dcel.listEdge.head;
  var addedEdges = [];
  while(currentEdge != null){
    addedEdges.push(currentEdge.content);
    currentEdge = currentEdge.next;
  }
  */
  createOrUpdateHalfEdges(canvas, "halfEdge", highlightHalfEdges, "halfEdge");
  createOrUpdateVertices(canvas, "vertex", highlightVertices, "vertex");
  //console.log(highlightHalfEdges);
  
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

  // highlight faces/edges or update inserted line
  switch (uiStatus) {
    case UI_STATUS.WAIT_P1:
      createOrUpdatePoint(canvas, "p1", [mousePos], "lineextremity");
      break;
    case UI_STATUS.WAIT_P2:
      createOrUpdateLine(canvas, "newLine", [points[0], mousePos], "newLine");
      break;
    case UI_STATUS.ADD_LINE:
    
      break;
    default:
      break;
  };

}

function pushVertexByIndex(index){

  var currentVertex = linearrangement.dcel.listVertex.head;
  do{
    if(currentVertex.content.index == index){
      highlightVertices.push(currentVertex.content);
    }
    currentVertex = currentVertex.next;
  }
  while(currentVertex != null)

  updateCanvas();
}

function removeVertexByIndex(index){

  for(var i=0; i<highlightVertices.length; i++){
    if(highlightVertices[i].index == index){
      highlightVertices.splice(i, 1);
    }
  }

  updateCanvas();
}

function pushFaceByIndex(index){
  
  var currentFace = linearrangement.dcel.listFace.head;
  do{
    if(currentFace.content.index == index){
      pushHalfEdges(currentFace.content.outerComponent);
      pushHalfEdges(currentFace.content.innerComponent);
    }
    currentFace = currentFace.next;
  }
  while(currentFace != null)
  updateCanvas();

}

function removeFaceByIndex(index){
  var currentFace = linearrangement.dcel.listFace.head;
  do{
    if(currentFace.content.index == index){
      var currentEdge = currentFace.content.outerComponent;
      if(currentEdge != null){
        do{
          removeHalfEdgeByIndex(currentEdge.index);
          currentEdge = currentEdge.next;
        }
        while(currentEdge != currentFace.content.outerComponent)
      }

      currentEdge = currentFace.content.innerComponent;
      if(currentEdge != null){
        do{
          removeHalfEdgeByIndex(currentEdge.index);
          currentEdge = currentEdge.next;
        }
        while(currentEdge != currentFace.content.innerComponent)
      }
    }
    currentFace = currentFace.next;
  }
  while(currentFace != null)
  updateCanvas();
}

function pushHalfEdgeByIndex(index){
  var currentEdge = linearrangement.dcel.listEdge.head;
  do{
    if(currentEdge.content.index == index)
      highlightHalfEdges.push(currentEdge.content);
    currentEdge = currentEdge.next;
  }
  while(currentEdge != null)
  updateCanvas();
}

function removeHalfEdgeByIndex(index){
  for(var i=0; i<highlightHalfEdges.length; i++){
    if(highlightHalfEdges[i].index == index)
      highlightHalfEdges.splice(i, 1);
  }
  updateCanvas();
}

function pushHalfEdges(halfedges){
  if(halfedges != null){

    var currentEdge = halfedges;
    do{
      highlightHalfEdges.push(currentEdge);
      currentEdge = currentEdge.next;
    }
    while(currentEdge != halfedges)
  }

  updateCanvas();
}

function createOrUpdateFace(parentElem, polyId, face, classname){

  var points = [];
  var innerComponent, outerComponent;

  if(face != null){
    innerComponent = face.innerComponent;
    outerComponent = face.outerComponent;

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


  createOrUpdatePolygon(parentElem, polyId, points, innerComponent, outerComponent, classname);

}

function createOrUpdatePolygon(parentElem, polyId, points, innerHalfEdges, outerHalfEdges, classname){


  var line = d3.svg.line()
    .x(function(d) { return d[0]; })
    .y(function(d) { return d[1]; })
    .interpolate("linear");

  var path = parentElem.selectAll("#"+polyId)
    .data(points)
    .attr("d", line(points))
    .on("mouseover", function(d){pushHalfEdges(innerHalfEdges); pushHalfEdges(outerHalfEdges)})
    .on("mouseout", function(d){highlightHalfEdges.length=0;});

  path.exit().remove();

  path.enter()
    .append("path")
    .attr("class", classname)
    .attr("id", polyId)
    .attr("d", line(points))
    .on("mouseover", function(d){pushHalfEdges(innerHalfEdges); pushHalfEdges(outerHalfEdges)})
    .on("mouseout", function(d){highlightHalfEdges.length=0;});

  //pushHalfEdges(innerHalfEdges);
  //pushHalfEdges(outerHalfEdges);

}

function createOrUpdateVertices(parentElem, pointId, xy, classname){
  var xy = [];
  for(var i=0; i<highlightVertices.length; i++){
    var aux = [];
    aux[0] = highlightVertices[i].x * width;
    aux[1] = highlightVertices[i].y * height;
    xy.push(aux);
  }
  createOrUpdatePoint(parentElem, pointId, xy, classname);
}

function createOrUpdatePoint(parentElem, pointId, xy, classname) {
  var point = parentElem.selectAll("#"+pointId)
    .data(xy)
    .attr("cx", function(d) { return d[0]; })
    .attr("cy", function(d) { return d[1]; });

  point.exit().remove();

  point.enter()
    .append("circle")
    .attr("class", classname)
    .attr("id", pointId)
    .attr("r", 4)
    .data(xy)
    .attr("cx", function(d) { return d[0]; })
    .attr("cy", function(d) { return d[1]; });
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
    .attr("y2", function(d) { return height*d.next.origin.y; })
  newEdges.exit()
    .remove();

}

function createOrUpdateHalfEdges(parentElem, edgesId, edgesList, classname){

  //marker
  canvas.append("svg:defs").selectAll("marker")
    .data(["arrow"])
  .enter().append("svg:marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");


  var mult = 2;
  var path = parentElem.selectAll("#"+edgesId)
    .data(edgesList)
    .attr("d", function(d) {
      var dx = width*d.next.origin.x - width*d.origin.x,
          dy = height*d.next.origin.y - height*d.origin.y,
          dr = mult*Math.sqrt(dx * dx + dy * dy);
      return "M" + width*d.origin.x + "," + height*d.origin.y + "A" + dr + "," + dr + " 0 0,1 " + width*d.next.origin.x + "," + height*d.next.origin.y;
    });

  path.exit().remove();

  path.enter()
    .append("path")
    .attr("class", classname)
    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
    .attr("id", edgesId)
    .attr("marker-end", "url(#arrow)")
    .attr("d", function(d) {
      var dx = width*d.next.origin.x - width*d.origin.x,
          dy = height*d.next.origin.y - height*d.origin.y,
          dr = mult*Math.sqrt(dx * dx + dy * dy);
      return "M" + width*d.origin.x + "," + height*d.origin.y + "A" + dr + "," + dr + " 0 0,1 " + width*d.next.origin.x + "," + height*d.next.origin.y;
    });

    
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
  width  = widthStyle.substring(0, widthStyle.length-2) - 40;
  height = heightStyle.substring(0, heightStyle.length-2) - 40;

  var svg = d3.select("#canvas")
    .append("svg:svg")
    .attr("width",  widthStyle)
    .attr("height", heightStyle);

  canvas = svg.append("svg:g")
    .attr("transform", "translate(20, 20)");

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
