var canvas;
var width;
var height;
var linearrangement;

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
    var pt_bottom = cgutils.intersectLineSegment(lines[i], cgutils.Segment(0,0,1,0));
    var pt_top = cgutils.intersectLineSegment(lines[i], cgutils.Segment(0,1,1,1));
    var pt_left = cgutils.intersectLineSegment(lines[i], cgutils.Segment(0,0,0,1));
    var pt_right = cgutils.intersectLineSegment(lines[i], cgutils.Segment(1,0,1,1));
    //console.log(pt_bottom);
    //console.log(pt_top);
    //console.log(pt_left);
    //console.log(pt_right);
    var pts = [];
    if(pt_bottom.hasIntersection)
      pts.push(pt_bottom);
    if(pt_top.hasIntersection)
      pts.push(pt_top);
    if(pt_left.hasIntersection)
      pts.push(pt_left);
    if(pt_right.hasIntersection)
      pts.push(pt_right);
    //console.log(pts);
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
  if(linearrangement.done())
    addRandomLine();
  linearrangement.next();
  draw();
}

function initializeLayout(){

  width = 500;//d3.select("#canvas").attr('width');
  height = 500;//d3.select("#canvas").attr('height');

  canvas = d3.select("#canvas")
        .append("svg")
        .attr("width", width+'px')
        .attr("height", height+'px');

  var dcel = new DCEL();
  dcel.constructBoundingBox(0, 1, 0, 1);
  linearrangement = new LineArrangement(dcel);

  //randomLines();
  draw();

}

window.onload = initializeLayout;
