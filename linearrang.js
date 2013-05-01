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
  this.splitface1 = null;
  this.splitface2 = null;
  this.edge1 = null;
  this.edge2 = null;
}

/**
 * Advance one step in the algorithm.
 */
LineArrangement.prototype.next = function() {
  console.log(this.nextStep);
  // advance in status machine
  switch (this.nextStep) {
    case this.NEXTSTEP.SEARCH_REAR_EDGE:
      if (this.E.incidentFace === this.dcel.unboundedFace) {  
	  //  Bowen: "this.E_prime == this.dcel.unboundedFace.innerComponent" is incorrect, 
	  //  innerComponent can be any edge incident to the unbounded face
        
		// reached unbounded face
        this.lines.push(this.line);
        this.line     = null;
        this.E        = null;
        this.v        = null;
        this.E_prime  = null;
        this.v_prime  = null;
        this.E_twin   = null;
        this.nextStep = this.NEXTSTEP.NOP;
        this.splitface1 = null;
        this.splitface2 = null;
        this.edge1 = null;
        this.edge2 = null;
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
      this.E_twin = this.E.twin;
      var newedgesfaces = this.dcel.insertEdge(this.E, this.E_prime, this.line);
      this.edge1 = newedgesfaces[0];
      this.edge2 = newedgesfaces[1];
      this.splitface1 = newedgesfaces[2];
      this.splitface2 = newedgesfaces[3];
	  this.nextEdge = newedgesfaces[4];
      this.nextStep = this.NEXTSTEP.MOVE_TO_NEXT_FACE;
      break;
    case this.NEXTSTEP.MOVE_TO_NEXT_FACE:
      this.E        = this.nextEdge; //this.E_twin;		Bowen: not wise to add this.nextEdge, but why putting E_twin here?
      this.v        = cgutils.intersectEdge(this.E, this.line).intersection;
      this.E_prime  = this.E.next;
      this.v_prime  = null;
      this.E_twin   = null;
      this.nextStep = this.NEXTSTEP.SEARCH_REAR_EDGE;
      this.splitface1 = null;
      this.splitface2 = null;
      this.edge1 = null;
      this.edge2 = null;
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
 *  curface : Face,        // current face
 *  E       : Edge,        // front edge
 *  E_prime : Edge,        // candidate/actual rear edge
 *  v       : Vertex,      // intersection between line and E
 *  v_prime : Vertex,      // intersection between line and E'
 *  E_twin  : Edge,        // twinEdge to check next
 *  splitface1 : Face,     // split face 1
 *  splitface2 : Face,     // split face 2 (when status=MOVE_TO_NEXT_FACE)
 *  edge1   : Edge,        // edge from splitface1 to splitface2
 *  edge2   : Edge,        // edge from splitface2 to splitface1
 * }  
 * 
 */
LineArrangement.prototype.status = function() {
  return {
    'line'    : this.line,
    'curface'    : this.E.incidentFace,
    'E'       : this.E,
    'E_prime' : this.E_prime,
    'v'       : this.v,
    'v_prime' : this.v_prime,
    'E_twin'  : this.E_twin,
    'splitface1': this.splitface1,
    'splitface2': this.splitface2,
    'edge1': this.edge1,
    'edge2': this.edge2,
  };
}

/**
 * Access to all lines already added to the arrangement.
 */
LineArrangement.prototype.lines = function() {
  return this.lines;
}

