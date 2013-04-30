/**
 * Line arrangement algorithm.
 * 
 * Maintain a DCEL structure up to date as user adds a line
 * to a line arrangement.
 */

/**
 * Constructor receiving scene bounding box in the form
 * {xmin, ymin, xmax, ymax}.
 */
function LineArrangement(dcel) {
  this.dcel = dcel;
  this.initialize();
}

/**
 * Initialize internal elements.
 */
LineArrangement.prototype.initialize = function() {
  this.NEXTSTEP = {
    NOP: 0,
    SEARCH_REAR_EDGE: 1,
    SPLIT_FACE: 2,
    MOVE_TO_NEXT_FACE: 3,
  };
  this.nextStep = this.NEXTSTEP.NOP;
  this.lines = [];
}

/**
 * Add a line in the form ax + by + c = 0
 */
LineArrangement.prototype.addLine = function(l) {
  // find leftmost intersection
  this.line     = l
  this.E        = this.dcel.leftmostEdgeBoundingBox(this.line);
  this.v        = cgutils.intersectEdge(this.E, this.line).intersection;
  this.E_prime  = this.E.next;
  this.v_prime  = null;
  this.nextStep = this.NEXTSTEP.SEARCH_REAR_EDGE;
}

/**
 * Advance one step in the algorithm.
 */
LineArrangement.prototype.next = function() {
  // advance in status machine
  console.log(this.nextStep);
  switch (this.nextStep) {
    case this.NEXTSTEP.SEARCH_REAR_EDGE:
      if (this.E_prime == this.dcel.unboundedFace.innerComponent) {
        // reached unbounded face
        this.lines.push(this.line);
        this.line     = null;
        this.E        = null;
        this.v        = null;
        this.E_prime  = null;
        this.v_prime  = null;
        this.E_twin   = null;
        this.nextStep = this.NEXTSTEP.NOP;
      }
      else {
        // test intersection with E'
        var inters = cgutils.intersectEdge(this.E_prime, this.line);
        if (inters.hasIntersection) {
          this.v_prime = inters.point;
          this.nextStep = this.NEXTSTEP.SPLIT_FACE;
        }
        else {
          // keep searching intersecting E'
          this.E_prime = this.E_prime.next;
        }
      }
      break;
    case this.NEXTSTEP.SPLIT_FACE:
      // TODO have steps for insertEdge like here?
      this.E_twin = this.E_prime.twin;
      this.dcel.insertEdge(this.E.twin, this.E_prime.twin, this.line);
      this.nextStep = this.NEXTSTEP.MOVE_TO_NEXT_FACE;
      break;
    case this.NEXTSTEP.MOVE_TO_NEXT_FACE:
      this.E        = this.E_twin;
      this.v        = cgutils.intersectEdge(this.E, this.line).intersection;
      this.E_prime  = this.E.next;
      this.v_prime  = null;
      this.E_twin   = null;
      this.nextStep = this.NEXTSTEP.SEARCH_REAR_EDGE;
      break;
    case this.NEXTSTEP.NOP:
    default:
      break;
  }
}

/**
 * Return whether algorithm steps are done for line addition.
 */
LineArrangement.prototype.done = function() {
  return this.nextStep == this.NEXTSTEP.NOP;
}

/**
 * Access to elements involved in current algorithm step in the format:
 * {line    : [a,b],
 *  face    : Face,        // current face
 *  E       : Edge,        // front edge
 *  E_prime : Edge,        // candidate/actual rear edge
 *  v       : Vertex,      // intersection between line and E
 *  v_prime : Vertex,      // intersection between line and E'
 *  E_twin  : Edge,        // twinEdge to check next
 * }  
 * 
 */
LineArrangement.prototype.status = function() {
  return {
    'line'    : this.line,
    'face'    : this.E.incidentFace,
    'E'       : this.E,
    'E_prime' : this.E_prime,
    'v'       : this.v,
    'v_prime' : this.v_prime,
    'E_twin'  : this.E_twin,
  };
}

/**
 * Access to all lines already added to the arrangement.
 */
LineArrangement.prototype.lines = function() {
  return this.lines;
}

