/**
 * Utility functions.
 */

 // Bowen: prototype definition shall be 
 // class.prototype.func = function(){}
 // instead of
 // function class.prototype.func(){}
 // corrected all through 

function cgutils() {}

cgutils.prototype.Point = function(x, y) {
  return {'x': x, 'y': y};
}

cgutils.prototype.Segment = function(x1, y1, x2, y2) {
  return {'v1': cgutils.Point(x1, y1),
          'v2': cgutils.Point(x2, y2)};
}

cgutils.prototype.Line = function(a, b) {
  return {'a': a, 'b': b};
}

cgutils.prototype.LineFromSegment = function(s) {
  // TODO
}

/**
 * Intersect segment against line.
 * Return in the form:
 * {point: {x, y},         // intersection point, if any
 *  hasIntersection: bool, // return flag for existing intersection 
 * }
 */
cgutils.prototype.intersectSegment = function(s, l) {
  var s_line = this.LineFromSegment(s);
  // TODO
  // coincident lines?
  // extremities to same side?
  // get intersection point and return
}
