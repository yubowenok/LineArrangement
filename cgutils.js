/**
 * Utility functions.
 */

function cgutils() {}

function cgutils.prototype.Point(x, y) {
  return {'x': x, 'y': y};
}

function cgutils.prototype.Segment(x1, y1, x2, y2) {
  return {'v1': cgutils.Point(x1, y1),
          'v2': cgutils.Point(x2, y2)};
}

function cgutils.prototype.Line(a, b) {
  return {'a': a, 'b': b};
}

function cgutils.prototype.LineFromSegment(s) {
  // TODO
}

/**
 * Intersect segment against line.
 * Return in the form:
 * {point: {x, y},         // intersection point, if any
 *  hasIntersection: bool, // return flag for existing intersection 
 * }
 */
function cgutils.prototype.intersectSegment(s, l) {
  var s_line = this.LineFromSegment(s);
  // TODO
  // coincident lines?
  // extremities to same side?
  // get intersection point and return
}
