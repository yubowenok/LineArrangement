
// basic data structure doubly linked list
function DoublyLinkedList(){
	this.head = null;
	this.tail = null;
}

// push an array of elements at the end of the doubly linked list
DoublyLinkedList.prototype.pushBackArray = function(array){
	for(var i=0; i<array.length; i++){
		element = array[i];
		this.pushBack(element);
	}
}

// this function creates a DoublyLinkedList element and call pushBack
DoublyLinkedList.prototype.pushBackContent = function(content){
	var element = new DoublyLinkedListElement(content);
	this.pushBack(element);
}

// this function creates an array of DoublyLinkedList elements and call pushBackArray
DoublyLinkedList.prototype.pushBackContentArray = function(array){
	var elementArray = new Array();
	for(var i=0; i<array.length; i++){
		var element = new DoublyLinkedListElement(array[i]);
		elementArray.push(element);
	}
	this.pushBackArray(elementArray);
}

// push an element at the end of the doubly linked list
DoublyLinkedList.prototype.pushBack = function(element){
	if(this.head==null){
		// insert the first element in the list
		this.head = element;
		this.tail = element;
	}else{
		// insert at the end
		this.tail.next = element;
		element.prev = this.tail;
		this.tail = element;
	}
}

DoublyLinkedList.prototype.remove = function(element){
	if (element == this.head) {
		// remove the first element in the list
		// set head to the element's next
		this.head = element.next;
		// in case of only one element in the list
		if(element.next != null) element.next.prev = null;
	}
	else if (element == this.tail) {
		// remove the last element in the list
		if (element.prev != null) element.prev.next = null; // element.next;
		this.tail = element.prev;
	} else {  
		// element not in extremities
		element.prev.next = element.next;
		element.next.prev = element.prev;
	}
	// Bowen: What is these two lines for?
	//content.prev.next = content.next;
	//content.next.prev = content.prev;

	// now bidirectional linking is complete
	
	// clear the reference so that garbage collection will handle
	// is this correct in js?  NO. tested, this is incorrect. the parameters in the function is a copied reference
	// element = null;
}

// remove the element from the doubly linked list
// the passed in element is also deleted!
DoublyLinkedList.prototype.removeContent = function(content){
	this.remove(content.element);
}

// to create a doubly linked list element, call this constructor and set the content
function DoublyLinkedListElement(content){
	this.content = content;
	this.content.element = this;	// self pointer from the content to the list element
	this.next = null;
	this.prev = null;
}
