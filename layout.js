var canvas;
var width;
var height;
var linearrangement;

function randomLines(){

  for(var i=0; i<10; i++){
    var max = 1;
    var min = 0;
    var a = Math.random() * (max - min) + min;
    var b = Math.random() * (max - min) + min;
    var c = Math.random() * (max - min) + min;
    linearrangement.addLine(cgutils.Line(a, b, c));
  }


}

function draw(){

  var lines = linearrangement.lines;

  for(var i=0; i<lines.length; i++){

    //intersect width edges
    var pt_bottom = cgutils.intersectLine(lines[i], cgutils.Line(0,0));
    var pt_top = cgutils.intersectLine(lines[i], cgutils.Line(0,height));
    var pt_left = cgutils.intersectLine(lines[i], cgutils.Line(1,0));
    var pt_right = cgutils.intersectLine(lines[i], cgutils.Line(1,-width));
    //console.log(pt_bottom);
    //console.log(pt_top);
    //console.log(pt_left);
    //console.log(pt_right);
    var pts = [];
    if(pt_bottom.x >= 0 && pt_bottom.x <= width)
      pts.push(pt_bottom);
    if(pt_top.x >= 0 && pt_top.x <= width)
      pts.push(pt_top);
    if(pt_left.y >= 0 && pt_left.y <= height)
      pts.push(pt_left);
    if(pt_right.y >= 0 && pt_right.y <= height)
      pts.push(pt_right);
    console.log(pts);
    if(pts.length >= 2){
      var line = canvas.append("line")
        .attr("x1", pts[0].x)
        .attr("y1", pts[0].y)
        .attr("x2", pts[1].x)
        .attr("y2", pts[1].y)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
    }
  }
}

function lineArrangementNext(){
  linearrangement.next();
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

  randomLines();
  draw();

}

window.onload = initializeLayout;
