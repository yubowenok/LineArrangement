/**
 * Utility functions.
 */

var cgutils = {};

cgutils.Point = function(x, y){
  return {'x': x, 'y': y};
}
cgutils.Segment = function(x1, y1, x2, y2) {
  return {'v1': cgutils.Point(x1, y1),
          'v2': cgutils.Point(x2, y2)};
}

cgutils.Line = function(a, b) {
  return {'a': a, 'b': b};
}

cgutils.LineFromSegment = function(s) {
  // TODO
}

/**
 * Intersect segment against line.
 * Return in the form:
 * {point: {x, y},         // intersection point, if any
 *  hasIntersection: bool, // return flag for existing intersection 
 * }
 */
cgutils.intersectSegment = function(s, l) {
  var s_line = this.LineFromSegment(s);
  // TODO
  // coincident lines?
  // extremities to same side?
  // get intersection point and return
}
