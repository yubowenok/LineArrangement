/**
 * Utility functions.
 */

var cgutils = {};

cgutils.Point = function(x, y){
  return {'x': x, 'y': y};
}

cgutils.Vector = function(x, y){
	return {'x': x, 'y': y};
}

cgutils.makeVector = function(p1, p2){
	return this.Vector(p2.x-p1.x, p2.y-p1.y);
}

cgutils.crossVector = function(vec1, vec2){
	return vec1.x*vec2.y-vec1.y*vec2.x;
}

cgutils.Segment = function(x1, y1, x2, y2) {
  return {'v1': cgutils.Point(x1, y1),
          'v2': cgutils.Point(x2, y2)};
}

cgutils.intersectLineBoundingBox = function(line, x1, y1, x2, y2){

  var pt_bottom = cgutils.intersectLineSegment(line, cgutils.Segment(x1,y1,x2,y1));
  var pt_top = cgutils.intersectLineSegment(line, cgutils.Segment(x1,y2,x2,y2));
  var pt_left = cgutils.intersectLineSegment(line, cgutils.Segment(x1,y1,x1,y2));
  var pt_right = cgutils.intersectLineSegment(line, cgutils.Segment(x2,y1,x2,y2));

  var pts = [];
  if(pt_bottom.hasIntersection)
    pts.push(pt_bottom);
  if(pt_top.hasIntersection)
    pts.push(pt_top);
  if(pt_left.hasIntersection)
    pts.push(pt_left);
  if(pt_right.hasIntersection)
    pts.push(pt_right);

  return pts;

}

// Bowen: modified, the previous definition is not correct as it cannot handle lines passing (0,0), so 'c' is needed
cgutils.Line = function(a, b, c) {
  return {'a': a, 'b': b, 'c':c};
}

cgutils.LineFromSegment = function(s) {
  // (y2-y1)x+(x1-x2)y+y1x2-y2x1 = 0
  var x1 = s.v1.x;
  var x2 = s.v2.x;
  var y1 = s.v1.y;
  var y2 = s.v2.y;
  return {'a':y2-y1, 'b':x1-x2, 'c':y1*x2-y2*x1};
}

/**
 * Intersect segment against line.
 * Return in the form:
 * {point: {x, y},         // intersection point, if any
 *  hasIntersection: bool, // return flag for existing intersection 
 * }
 */

// Bowen: this function returns true/false, and the intersection point
// based on whether line l intersects with s
// Fabio: crossVector was wrong. It was returning a vector, instead of a scalar.
cgutils.intersectLineSegment = function(l, s) {
  
  // Bowen: what is the following two questions refer to?
  
  // coincident lines?
  // extremities to same side?
  // get intersection point and return
  
  var pl1, pl2;	// two points on the line
  if(l.b==0){
	// handle vertical lines
	pl1 = this.Point(-l.c/l.a, 0.0);
	pl2 = this.Point(-l.c/l.a, 1.0);
  }else{
	pl1 = this.Point(0.0, -l.c/l.b);
	pl2 = this.Point(1.0, (-l.c-l.a)/l.b);
  }
  // vector of the line, and the vector from the line point to the two endpoints of the segment
  var vecLine = this.makeVector(pl1, pl2);	
  var vecS1 = this.makeVector(pl1, s.v1);	
  var vecS2 = this.makeVector(pl1, s.v2);
  // cross product for intersection detection
  if(this.crossVector(vecLine, vecS1) * this.crossVector(vecLine, vecS2) < -1E-9){
	// if intersection exists, we use line line intersection to calculate
	return {'hasIntersection': true, 'intersection': this.intersectLines(l, this.LineFromSegment(s))};
  }else{
	return {'hasIntersection': false, 'intersection': null};
  }
}


/**
 * Try to intersect edge and line.
 */
//Fabio: moved from linearrang
cgutils.intersectEdge = function(edge, line) {
  var s = cgutils.Segment(
    edge.origin.x,
    edge.origin.y,
    edge.next.origin.x,
    edge.next.origin.y);
  return cgutils.intersectLineSegment(line, s);   
}

cgutils.intersectLines = function(l1, l2){

  var x, y;
  if(l1.b==0 && l2.b!=0){
    x = -l1.c/l1.a;
    y = (-l2.c-l2.a*x)/l2.b;
  }else if(l1.b!=0 && l2.b==0){
    x = -l2.c/l2.a;
    y = (-l1.c-l1.a*x)/l1.b;
  }else if(l1.b!=0 && l2.b!=0){
    y = (l2.c*l1.a-l1.c*l2.a)/(l1.b*l2.a-l2.b*l1.a);
    x = (-l1.c-l1.b*y)/l1.a;
  }else{
    alert("ERROR: try to intersect two vertical lines. intersectLines failed.")
  }
  // var x = (l2.b - l1.b) / (l1.a - l2.a);
  // var y = l1.a * x + l1.b;

  return cgutils.Point(x, y);
}
