var indexFace = 1;
var indexVertex = 1;
var indexEdge = 1;

// the main entry of DCEL
function DCEL(){
	this.unboundedFace = null;
	this.listVertex = new DoublyLinkedList();
	this.listEdge = new DoublyLinkedList();
	this.listFace = new DoublyLinkedList();
}

// construct an intial bounding box with 4 segments (8 half-edges), the size of which is specified by the parameters as [xmin, xmax]X[ymin, ymax]
DCEL.prototype.constructBoundingBox = function(xmin, xmax, ymin, ymax){
	var outerFace = new Face();
	var boxFace = new Face();
	
	// construct four vertices
	// Confusion: shall revert due to rendering y axis reversion
	var bottomLeftVertex = new Vertex(xmin, ymax);
	var bottomRightVertex = new Vertex(xmax, ymax);
	var topLeftVertex = new Vertex(xmin, ymin);
	var topRightVertex = new Vertex(xmax, ymin);
	
	// construct inner edges
	var bottomEdge = new Edge(bottomLeftVertex, boxFace);
	var rightEdge = new Edge(bottomRightVertex, boxFace);
	var topEdge = new Edge(topRightVertex, boxFace);
	var leftEdge = new Edge(topLeftVertex, boxFace);
	// link inner edges
	this.linkEdge(bottomEdge, rightEdge);
	this.linkEdge(rightEdge, topEdge);
	this.linkEdge(topEdge, leftEdge);
	this.linkEdge(leftEdge, bottomEdge);
	
	// construct outer edges (twins of inner edges)
	var bottomEdgeTwin = new Edge(bottomRightVertex, outerFace);
	var rightEdgeTwin = new Edge(topRightVertex, outerFace);
	var topEdgeTwin = new Edge(topLeftVertex, outerFace);
	var leftEdgeTwin = new Edge(bottomLeftVertex, outerFace);
	// link outer edges
	this.linkEdge(bottomEdgeTwin, leftEdgeTwin);
	this.linkEdge(leftEdgeTwin, topEdgeTwin);
	this.linkEdge(topEdgeTwin, rightEdgeTwin);
	this.linkEdge(rightEdgeTwin, bottomEdgeTwin);

	// set twins 
	this.setTwin(bottomEdge, bottomEdgeTwin);
	this.setTwin(rightEdge, rightEdgeTwin);
	this.setTwin(topEdge, topEdgeTwin);
	this.setTwin(leftEdge, leftEdgeTwin);
	
	// set incident edges for vertices
	//bottomLeftVertex.incidentEdge = bottomEdge;
	//bottomRightVertex.incidentEdge = rightEdge;
	//topRightVertex.incidentEdge = topEdge;
	//topLeftVertex.incidentEdge = leftEdge;
	
  // TODO Cesar changed order here
	// set unbounded face for later search
	this.unboundedFace = outerFace;
	this.unboundedFace.innerComponent = topEdgeTwin;
	this.unboundedFace.outerComponent = null;

	// set face components
	boxFace.innerComponent = null;
	boxFace.outerComponent = topEdge;
	
	// push all the created stuffs into the lists
	this.listVertex.pushBackContentArray([bottomLeftVertex, bottomRightVertex, topRightVertex, topLeftVertex]);
	this.listEdge.pushBackContentArray([bottomEdge, rightEdge, leftEdge, topEdge]);
	this.listEdge.pushBackContentArray([bottomEdgeTwin, rightEdgeTwin, leftEdgeTwin, topEdgeTwin]);
	this.listFace.pushBackContentArray([outerFace, boxFace]);
	
}

// find the leftmost half edge on the bounding box, the edge is incident to the INNER face
DCEL.prototype.leftmostEdgeBoundingBox = function(line){
	// starting from the innerComponent of the unbounded face (an edge on the bounding box)
	// we iterate all the edges incident to the unbounded face until we find one that is intersected by the line
	var xmin = Infinity;
	var ymin = Infinity;
	var currentEdge = this.unboundedFace.innerComponent;
	var foundEdge;
	do{var startVertex = currentEdge.origin;
		var endVertex = currentEdge.next.origin;
		
		// create a segment to test intersection
		var segment = cgutils.Segment(startVertex.x, startVertex.y, endVertex.x, endVertex.y);
		var inters = cgutils.intersectLineSegment(line, segment);
		
		// if intersects, we record the leftmost (bottommost)
		if(inters.hasIntersection==true){
			if(inters.intersection.x<xmin){
				xmin = inters.intersection.x;
				foundEdge = currentEdge;
			}else if(inters.intersection.x==xmin){
				if(inters.intersection.y<ymin){
					ymin = inters.intersection.y;
					foundEdge = currentEdge;
				}
			}
		}
		currentEdge = currentEdge.next;
	}
	while(currentEdge !== this.unboundedFace.innerComponent);
	
	if(xmin==Infinity && ymin==Infinity){
		alert("ERROR: leftmostEdgeBoundingBox failed");
	}
	
	// prevent edge and vertex duplication
	this.lastInsertedEdge = null;
	this.lastInsertedVertex = null;
	this.firstInsertion = true;
	
	return foundEdge.twin;
}

// insert the segment on the line into the DCEL, between edgeFront and edgeRear
// the line intersects with edgeFront at vertexFront, and with edgeRear at vertexRear
// edgeFront and edgeRear shall be incident to the inner face
DCEL.prototype.insertEdge = function(edgeFront, edgeRear, line){
	console.log("insertEdge called");
	var vertexFront;
	if(this.firstInsertion==true){
		vertexFront = cgutils.intersectEdge(edgeFront, line).intersection;
	}else{
		vertexFront = this.lastInsertedVertex;
	}
	var vertexRear = cgutils.intersectEdge(edgeRear, line).intersection;
	// fetch the face in question
	var face1 = edgeFront.incidentFace;
	// create a new face
	var face2 = new Face();
	// fetch the faces incident to edgeFront's twin, and edgeRear's twin
	var faceFront = edgeFront.twin.incidentFace;
	var faceRear = edgeRear.twin.incidentFace;
	
	// create new vertices for the DCEL
	var vertex1;
	if(this.firstInsertion==true){
		vertex1 = new Vertex(vertexFront.x, vertexFront.y);
	}else{
		vertex1 = this.lastInsertedVertex;
	}
	var vertex2 = new Vertex(vertexRear.x, vertexRear.y);
	
	// create two paried new edges that are on the line
	var edge1 = new Edge(vertex1, face1);
	var edge2 = new Edge(vertex2, face2);
	
	// set vertex incident edge
	//vertex1.incidentEdge = edge1;
	//vertex2.incidentEdge = edge2;
	
	// split edgeFront and edgeRear into four new pairs of edges
	var edgeFront1, edgeFront1Twin, edgeFront2, edgeFront2Twin;
	if(this.firstInsertion==true){
		edgeFront1 = new Edge(edgeFront.origin);
		edgeFront1Twin = new Edge(vertex1);
		edgeFront2 = new Edge(vertex1);
		edgeFront2Twin = new Edge(edgeFront.next.origin);
	}else{
		edgeFront1 = this.lastInsertedEdge.prev;
		edgeFront1Twin = edgeFront1.twin;
		edgeFront2 = this.lastInsertedEdge;
		edgeFront2Twin = edgeFront2.twin;
	}
	var edgeRear1 = new Edge(vertex2);
	var edgeRear1Twin = new Edge(edgeRear.next.origin);
	var edgeRear2 = new Edge(edgeRear.origin);
	var edgeRear2Twin = new Edge(vertex2);
	
	// set twin
	this.setTwin(edge1, edge2);
	this.setTwin(edgeFront1, edgeFront1Twin);
	this.setTwin(edgeFront2, edgeFront2Twin);
	this.setTwin(edgeRear1, edgeRear1Twin);
	this.setTwin(edgeRear2, edgeRear2Twin);
	
	/*
		Let's draw a nasty graph here ¡ú_¡ú
		
			/|\ |             face1             /|\ |
			 |  | edgeFront1           edgeRear1 |  |
			 |  |                                |  |
			 | \|/            edge1              | \|/
 faceFront	vertex1 --------------------------> vertex2    faceRear
			/|\ |   <-------------------------- /|\ |
			 |  |             edge2              |  |
			 |  | edgeFront2           edgeRear2 |  |
			 | \|/            face2              | \|/
	*/
	
	// EXTRA CAREFUL: link the mess
	// we make the links resulting from splitting edgeFront and edgeRear
	this.linkEdge(edgeFront1, edge1);
	this.linkEdge(edge1, edgeRear1);
	this.linkEdge(edgeRear2, edge2);
	this.linkEdge(edge2, edgeFront2);
	if(this.firstInsertion==true){
		this.linkEdge(edgeFront2Twin, edgeFront1Twin);
	}
	this.linkEdge(edgeRear1Twin, edgeRear2Twin);
	// careful! connect edgeFront1,2 and edgeRear1,2
	if( (this.firstInsertion==true && edgeFront.prev === edgeRear) ||
		(this.firstInsertion==false && edgeFront1.prev === edgeRear) )
	{
		// face1 side, edgeRear->edgeFront
		this.linkEdge(edgeRear1, edgeFront1);
	}else{
		if(this.firstInsertion==true){
			this.linkEdge(edgeFront.prev, edgeFront1);
		}
		this.linkEdge(edgeRear1, edgeRear.next);
	}
	if(this.firstInsertion==true){
		this.linkEdge(edgeFront1Twin, edgeFront.twin.next);
	}
	this.linkEdge(edgeRear.twin.prev, edgeRear1Twin);
	
	if( (this.firstInsertion==true && edgeRear.prev === edgeFront) || 
		(this.firstInsertion==false && edgeRear.prev === edgeFront2) )
	{
		// face2 side, edgeFront->edgeRear
		this.linkEdge(edgeFront2, edgeRear2);
	}else{
		this.linkEdge(edgeRear.prev, edgeRear2);
		if(this.firstInsertion==true){
			this.linkEdge(edgeFront2, edgeFront.next);
		}
	}
	if(this.firstInsertion==true){
		this.linkEdge(edgeFront.twin.prev, edgeFront2Twin);
	}
	this.linkEdge(edgeRear2Twin, edgeRear.twin.next);
	
	
	// set incident face, need to traverse for face1, face2!
	currentEdge = edge1;
	do{
		currentEdge.incidentFace = face1;
		currentEdge = currentEdge.next;
	}while(currentEdge!==edge1);
	currentEdge = edge2;
	do{
		currentEdge.incidentFace = face2;
		currentEdge = currentEdge.next;
	}while(currentEdge!==edge2);
	
	// do not forget faceFront and faceRear
	if(this.firstInsertion==true){
		edgeFront1Twin.incidentFace = faceFront;
		edgeFront2Twin.incidentFace = faceFront;
	}
	edgeRear1Twin.incidentFace = faceRear;
	edgeRear2Twin.incidentFace = faceRear;
	
	// set components
	// as any edge will do, in case of the original component is deleted, we just set the components to the new edges
	face1.outerComponent = edge1;
	face1.innerComponent = null;
	face2.outerComponent = edge2;
	face2.innerComponent = null;
	// careful: faceFront and faceRear may be the unbounded face
	if(this.firstInsertion==true){
		if(faceFront !== this.unboundedFace){
			faceFront.outerComponent = edgeFront1Twin;
		}else{
			faceFront.innerComponent = edgeFront1Twin;
		}
	}
	if(faceRear !== this.unboundedFace){
		faceRear.outerComponent = edgeRear2Twin;
	}else{
		faceRear.innerComponent = edgeRear2Twin;
	}
	
	// insert new vertices
	if(this.firstInsertion==true){
		this.listVertex.pushBackContent(vertex1);
	}
	this.listVertex.pushBackContent(vertex2);
	// remove edgeRear and edgeFront and insert new edges
	if(this.firstInsertion==true){
		this.listEdge.removeContent(edgeFront.twin);
		this.listEdge.removeContent(edgeFront);
	}
	this.listEdge.removeContent(edgeRear.twin);
	this.listEdge.removeContent(edgeRear);
	if(this.firstInsertion==true){
		this.listEdge.pushBackContentArray([edgeFront1, edgeFront1Twin, edgeFront2, edgeFront2Twin])
	}
	this.listEdge.pushBackContentArray([edge1, edge2, edgeRear1, edgeRear1Twin, edgeRear2, edgeRear2Twin]);
	// insert new faces. note that face1 is just changed. it is not deleted
	this.listFace.pushBackContent(face2);

	// record last inserted edge and vertex
	this.firstInsertion = false;
	this.lastInsertedEdge = edgeRear2Twin;
	this.lastInsertedVertex = vertex2;

	return [edge1, edge2, face1, face2, edgeRear2Twin];
}

function Face(outerComponent, innerComponent){
	this.index = indexFace++;
	this.outerComponent = outerComponent;
	this.innerComponent = innerComponent;
}

function Vertex(x, y){
	this.index = indexFace++;
	this.x = x;
	this.y = y;
	//this.incidentEdge = edge;
}

function Edge(origin, face){
	this.index = indexEdge++;
	this.origin = origin;
	this.incidentFace = face;
	
	// use the setTwin function to set twin
	// use the linkEdge function to set next and prev
	this.twin = null;
	this.next = null;
	this.prev = null;
	
	// used for deletion in the doubly linked list
	// this.element = null;
}

DCEL.prototype.setTwin = function(edge1, edge2){
	edge1.twin = edge2;
	edge2.twin = edge1;
}

// link edge2 as the next of edge1
DCEL.prototype.linkEdge = function(edge1, edge2){
	edge1.next = edge2;
	edge2.prev = edge1;
}
