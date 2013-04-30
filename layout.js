var canvas;
var width;
var height;
var linearrangement;
var pointToInsert = [null, null];
var linesToInsert = [];

function addRandomLine(){

  var max = 1;
  var min = 0;
  var x1 = Math.random() * (max - min) + min;
  var x2 = Math.random() * (max - min) + min;
  var y1 = Math.random() * (max - min) + min;
  var y2 = Math.random() * (max - min) + min;
  var segment = cgutils.Segment(x1, y1, x2, y2);
  linearrangement.addLine(cgutils.LineFromSegment(segment));


}

function draw(){

  var lines = linearrangement.lines;
  console.log(lines);

  for(var i=0; i<lines.length; i++){

    //intersect width edges
    var pts = cgutils.intersectLineBoundingBox(lines[i], 0, 0, 1, 1);
    if(pts.length >= 2){
      var line = canvas.append("line")
        .attr("x1", width*pts[0].intersection.x)
        .attr("y1", height*pts[0].intersection.y)
        .attr("x2", width*pts[1].intersection.x)
        .attr("y2", height*pts[1].intersection.y)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
    }
  }
}

function lineArrangementNext(){
  var index = linearrangement.lines.length;
  var totalLines = linesToInsert.length
  if(linearrangement.done() && index < totalLines){
    //addRandomLine();
    linearrangement.addLine(linesToInsert[index]);
  }
  linearrangement.next();
  draw();
}

function handlemouse(){
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
  
}

function initializeLayout(){

  width = 500;//d3.select("#canvas").attr('width');
  height = 500;//d3.select("#canvas").attr('height');

  canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", width+'px')
        .attr("height", height+'px')
        .on("click", handlemouse);

  var dcel = new DCEL();
  dcel.constructBoundingBox(0, 1, 0, 1);
  linearrangement = new LineArrangement(dcel);

  //randomLines();
  draw();

}

window.onload = initializeLayout;
