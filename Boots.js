/*
 * Boots | A Tiny JS Toolkit
 *-------------------------------------------------
 * http://shoes.heroku.com/manual/Hello.html
 */
 
function BaseClass() { }
BaseClass.extend = function (p, s) {
	var OP = Object.prototype;
	function augment(obj, props) {
		// iterate all defined properties
		for (var prop in props)
			if (OP.hasOwnProperty.call(props, prop))
				obj[prop] = props[prop];
	
		// IE has dontEnum issues
/*@cc_on	var prop, dontenums = 'constructor|toString|valueOf|toLocaleString|isPrototypeOf|propertyIsEnumerable|hasOwnProperty'.split('|');
		while (prop = dontenums.pop())
			if (OP.hasOwnProperty.call(props, prop) && !OP.propertyIsEnumerable.call(props, prop))
				obj[prop] = props[prop]; @*/
	}
	
	// clean input
	var props = p || {}, statics = s || {};
	// create factory object
	var ancestor = this, Factory = OP.hasOwnProperty.call(props, 'constructor') ?
		props.constructor : function () { ancestor.apply(this, arguments); }
	
	// copy and extend statics
	augment(Factory, this);
	augment(Factory, statics);
	// copy and extend prototype
	var Super = function () { };
	Super.prototype = this.prototype;
	Factory.prototype = new Super();
	augment(Factory.prototype, props);
	Factory.prototype.constructor = Factory;
	
	// return new factory object			
	return Factory;
};

function Class() {
	return BaseClass.extend.apply(BaseClass, arguments);
}

function Functor(p, s) {
	var OP = Object.prototype;
	function augment(obj, props) {
		// iterate all defined properties
		for (var prop in props)
			if (OP.hasOwnProperty.call(props, prop))
				obj[prop] = props[prop];
	
		// IE has dontEnum issues
/*@cc_on	var prop, dontenums = 'constructor|toString|valueOf|toLocaleString|isPrototypeOf|propertyIsEnumerable|hasOwnProperty'.split('|');
		while (prop = dontenums.pop())
			if (OP.hasOwnProperty.call(props, prop) && !OP.propertyIsEnumerable.call(props, prop))
				obj[prop] = props[prop]; @*/
	}
	
	// clean input
	var props = p || {}, statics = s || {};
	var constructor = OP.hasOwnProperty.call(props, 'constructor') ? props.constructor : function () { }
	var call = OP.hasOwnProperty.call(props, 'call') ? props.call : function () { }

	// create Factory object		
	var Factory = function () {
		var Functor = function () {
			return call.apply(Functor, arguments);
		}
		// copy and extend properties
		augment(Functor, props);
		constructor.apply(Functor, arguments);
		return Functor;
	}	
	// copy and extend statics
	augment(Factory, statics);
	
	// return new factory object			
	return Factory;
};

//-------------------------------------

function isObjectLiteral(obj) {
    if (typeof obj !== "object" || obj === null)
        return false;

    var hasOwnProp = Object.prototype.hasOwnProperty,
    ObjProto = obj;

    while (true) // get obj's Object constructor's prototype
        if (Object.getPrototypeOf(ObjProto = Object.getPrototypeOf(ObjProto)) === null)
                break;

    if (!Object.getPrototypeOf.isNative) // workaround if non-native Object.getPrototypeOf
        for (var prop in obj)
                if (!hasOwnProp.call(obj, prop) && !hasOwnProp.call(ObjProto, prop)) // inherited elsewhere
                        return false;

    return Object.getPrototypeOf(obj) === ObjProto;
};


if (!Object.getPrototypeOf) {
    if (typeof this.__proto__ === "object") {
        Object.getPrototypeOf = function (obj) {
                return obj.__proto__;
        };
        Object.getPrototypeOf.isNative = true;
    } else {
        Object.getPrototypeOf = function (obj) {
                var constructor = obj.constructor,
                oldConstructor;
                if (Object.prototype.hasOwnProperty.call(obj, "constructor")) {
                        oldConstructor = constructor;
                        if (!(delete obj.constructor)) // reset constructor
                                return null; // can't delete obj.constructor, return null
                        constructor = obj.constructor; // get real constructor
                        obj.constructor = oldConstructor; // restore constructor
                }
                return constructor ? constructor.prototype : null; // needed for IE
        };
        Object.getPrototypeOf.isNative = false;
    }
} else Object.getPrototypeOf.isNative = true;

function isContentValue(elem) {
	return !!elem.tagName.match(/^(input)$/i);
}

function normalizeUnits(val) {
	return !isNaN(val) ? val + 'px' : val;
}

function getElementPosition(el) {
  var pos = {x:0, y:0}
  var viewportElement = document.documentElement;
  if (el == viewportElement) {
    // viewport is always at 0,0 as that defined the coordinate system for this
    // function - this avoids special case checks in the code below
    return pos;
  }

  var parent = null;
  var box;

	box = el.getBoundingClientRect();
	var scrollTop = viewportElement.scrollTop;
	var scrollLeft = viewportElement.scrollLeft;

	pos.x = box.left + scrollLeft;
	pos.y = box.top + scrollTop;

  return pos;
};

function getFunctionName(f) {
	return f.name || f.toString().match(/function\s*(.+?)\s*\(/)[1];
}

/*
 * Boots
 */
 
function isBootsElement(elem) {
	return !!elem.Boots;
}

var BootsElement = new Functor({
	Boots: true,
	
	elem: null,
	props: null,
	events: null,
	
	constructor: function (elem) {
		// object properties
		this.elem = elem;
		var events = this.events = {};
		var props = this.props = {};
		
		// events
		// 'motion' event
		this.elem.onmousemove = function (e) {
			if (events.motion) {
				var info = mouse();
				events.motion.call(elem, info[1], info[2]);
			}
		};
		// 'click' event
		this.elem.onclick = function (e) {
			if (events.click)
				events.click.apply(elem, mouse());
		};
		// 'keypress' event
		this.elem.onchange = function (e) {
			if (events.change)
				events.change.call(elem, elem.value);
		};
	},
	
	call: function () {			
		var content = [];
		// parse arguments
		for (var i = 0; i < arguments.length; i++)
			if (typeof arguments[i] == 'object')
				this.props = arguments[i];
			else if (typeof arguments[i] == 'function' && !isBootsElement(arguments[i]))
				this.events[getFunctionName(arguments[i])] = arguments[i];
			else
				content.push(arguments[i]);
		// load content
		if (content.length)
			this.clear.apply(this, content);
		
		// set props
		for (var prop in this.props)
			if (prop in elemProp)
				elemProp[prop](this.elem, this.props[prop]);
				
//[TODO] styles
		return this;
	},
	
	// element manipulation
	
	_insert: function (parent, child, args) {
		// content
		if (isContentValue(parent)) {
			parent.value += (args[0] || '');
		} else {
			for (var i = 0; i < args.length; i++)
				if (args[i] && isBootsElement(args[i]))
					parent.insertBefore(args[i].elem, child);
				else
					parent.insertBefore(document.createTextNode(args[i]), child);
		}
	},
	clear: function () {
		if (isContentValue(this.elem))
			this.elem.value = '';
		else {
			//while (this.elem.firstChild)
			//	this.elem.removeChild(this.elem.firstChild);
			this.elem.innerHTML = '';
		}
		this._insert(this.elem, null, arguments);
	},
	append: function () {
		this._insert(this.elem, null, arguments);
	},
	prepend: function () {
		this._insert(this.elem, this.elem.firstChild, arguments);
	},
	after: function () {
		this._insert(this.elem.parentNode, this.elem.nextSibling, arguments);
	},
	before: function () {
		this._insert(this.elem.parentNode, this.elem, arguments);
	},
	remove: function () {
		this.elem.parentNode.removeChild(this.elem);
	},
	
	// property reading
	
	text: function () { return this.elem.innerHTML || this.elem.value; }, //[TODO] innerText
	height: function () { return this.elem.offsetHeight; },
	width: function () { return this.elem.offsetWidth; },
	left: function () { return getElementPosition(this.elem).x - getElementPosition(document.body).x; },
	top: function () { return getElementPosition(this.elem).y - getElementPosition(document.body).y; },
	toString: function () { return '[Boots ' + this.elem.tagName + ']'; },
	
	// property manipulation
	
	hide: function () { this.elem.style.display = 'none'; },
	show: function () { this.elem.style.display = ''; },
	move: function (left, top) {
		this.apply(this, [{top: top, left: left}]);
	}
});

var elemProp = {
	// styles
	width: function (elem, val) { elem.style.width = normalizeUnits(val); },
	height: function (elem, val) { elem.style.height = normalizeUnits(val); },
	margin: function (elem, val) { elem.style.margin = normalizeUnits(val); },
	margin_top: function (elem, val) { elem.style.marginTop = normalizeUnits(val); },
	margin_right: function (elem, val) { elem.style.marginRight = normalizeUnits(val); },
	margin_bottom: function (elem, val) { elem.style.marginBottom = normalizeUnits(val); },
	margin_left: function (elem, val) { elem.style.marginLeft = normalizeUnits(val); },
	top: function (elem, val) { elem.style.position = 'absolute'; elem.style.top = normalizeUnits(val); },
	y: function (elem, val) { elem.style.position = 'absolute'; elem.style.top = normalizeUnits(val); },
	left: function (elem, val) { elem.style.position = 'absolute'; elem.style.left = normalizeUnits(val); },
	x: function (elem, val) { elem.style.position = 'absolute'; elem.style.left = normalizeUnits(val); },
	stroke: function (elem, val) { elem.style.color = normalizeColor(val).val; }, //[TODO] ban patterns?
	align: function (elem, val) { elem.style.textAlign = val; }, 
	
	// attributes
	scroll: function (elem, val) { elem.style.overflow = val ? 'scroll' : 'hidden'; },
	length: function (elem, val) { elem.setAttribute('length', val); },
	value: function (elem, val) { elem.value = val; },
	title: function (elem, val) { document.title = val; }
};

/*
 * Boots class
 */

var Boots = {
	app: function () {
		var ret = new BootsElement(document.body);
		ret.apply(ret, [background({fill: white})].concat([].slice.apply(arguments, [])));
		return ret;
	}
};

/*
 * slots
 */
 
function stack() {
	var elem = document.createElement('div');
	elem.className = 'stack';
	var ret = new BootsElement(elem);
	return ret.apply(ret, arguments);
}

function flow() {
	var elem = document.createElement('div');
	elem.className = 'flow';
	var ret = new BootsElement(elem);
	return ret.apply(ret, arguments);
}

/*
 * form elements
 */
 
function edit_line() {
	var elem = document.createElement('input');
	elem.type = 'text';
	var ret = new BootsElement(elem);
	return ret.apply(ret, arguments);
}

function button() {
	var ret = new BootsElement(document.createElement('button'));
	return ret.apply(ret, arguments);
}

/*
 * text
 */
 
function TextBlock(elem, args) {
	var ret = new BootsElement(elem);
	ret.replace = function () {
		str = '';
		for (var i = 0; i < arguments.length; i++)
			str += String(arguments[i]);
		ret.clear(str);
	}
	return ret.apply(ret, args);
}
 
function banner() {
	return new TextBlock(document.createElement('h1'), arguments);
}

function title() {
	return new TextBlock(document.createElement('h2'), arguments);
}

function subtitle() {
	return new TextBlock(document.createElement('h3'), arguments);
}

function tagline() {
	return new TextBlock(document.createElement('h4'), arguments);
}

function caption() {
	return new TextBlock(document.createElement('h5'), arguments);
}

function para() {
	return new TextBlock(document.createElement('p'), arguments);
}

function inscription() {
	return new TextBlock(document.createElement('h6'), arguments);
}

/*
 * text
 */

function code() {
	var ret = new BootsElement(document.createElement('code'));
	return ret.apply(ret, arguments);
}

function del() {
	var ret = new BootsElement(document.createElement('del'));
	return ret.apply(ret, arguments);
}

function em() {
	var ret = new BootsElement(document.createElement('em'));
	return ret.apply(ret, arguments);
}

function ins() {
	var ret = new BootsElement(document.createElement('ins'));
	return ret.apply(ret, arguments);
}
/*
function link() {
	var ret = new BootsElement(document.createElement('a'));
	return ret.apply(ret, arguments);
}
*/
function span() {
	var ret = new BootsElement(document.createElement('span'));
	return ret.apply(ret, arguments);
}

function strong() {
	var ret = new BootsElement(document.createElement('strong'));
	return ret.apply(ret, arguments);
}

function sub() {
	var ret = new BootsElement(document.createElement('sub'));
	return ret.apply(ret, arguments);
}

function sup() {
	var ret = new BootsElement(document.createElement('sup'));
	return ret.apply(ret, arguments);
}

/*
 * colors
 */

function normalizeColor(color) {
	return (typeof color == 'string') ? new Color(color) : color || new Color('#000');
}
 
Color = new Class({
	val: null,
	constructor: function (val) {
		this.val = val
	},
	apply: function (svg, elem) {
		return this.val;
	}
})

Gradient = new Class({
	from: null,
	to: null,
	id: null,
	constructor: function (from, to) {
		this.from = normalizeColor(from);
		this.to = normalizeColor(to);
		this.id = 'gradient' + Date.now();
	},
	apply: function (svg, elem) {
		var defs = svg.appendChild(new SVGElement('defs'));
		var linear = defs.appendChild(new SVGElement('linearGradient'));
		linear.setAttribute('id', this.id);
		linear.setAttribute('x1', '0%');
		linear.setAttribute('x2', '0%');
		linear.setAttribute('y1', '0%');
		linear.setAttribute('y2', '100%');
		var stop1 = linear.appendChild(new SVGElement('stop'));
		stop1.setAttribute('offset', '0%');
		stop1.setAttribute('style', 'stop-color:' + this.from.val);
		var stop2 = linear.appendChild(new SVGElement('stop'));
		stop2.setAttribute('offset', '100%');
		stop2.setAttribute('style', 'stop-color:' + this.to.val);
		return 'url(#' + this.id + ')';
	}
})
 
function gradient(from, to) {
	return new Gradient(from, to);
}

function rgb(r, g, b, a) {
	return new Color('rgba(' + r*100 + '%,' + g*100 + '%,' + b*100 + '%,' + (a == undefined ? 1.0 : a) + ')');
}

function gray(l, a) {
	return rgb(l,l,l,a);
}

// explicit color definitions
black = rgb(0, 0, 0);
white = rgb(1.0, 1.0, 1.0);
red = rgb(1.0, 0, 0);
blue = rgb(0, 0, 1.0);

/*
 * art
 */
 
function SVGElement(tagName) {
	if (SVGElement.memo[tagName])
		return SVGElement.memo[tagName].cloneNode(false);
	return SVGElement.memo[tagName] = document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
SVGElement.memo = {}
 
function BootsShape(shape, props) {
	// create svg element
	var svg = new SVGElement('svg');
	svg.setAttribute('style', 'position: absolute; top: 0; left: 0;');
	svg.appendChild(shape);
	
	// add shape style
	props = props || {}
	if (props.fill)
		shape.setAttribute('fill', normalizeColor(props.fill).apply(svg, shape));
	if (props.stroke)
		shape.setAttribute('stroke', normalizeColor(props.stroke).apply(svg, shape));
	if (props.strokewidth)
		shape.setAttribute('stroke-width', props.strokewidth);
	// 'center' attribute
	if (props.center) {
		props.margin_left = -props.width / 2;
		props.margin_top = -props.height / 2;
	}
	
	var ret = new BootsElement(svg);
	return ret.apply(ret, [props]);
}

function background(props) {
	props.width = props.width || '100%';
	props.height = props.height || '100%';
	return rect(props);
}

function rect(props) {
	var rect = new SVGElement('rect');
	rect.setAttribute('width', '100%');
	rect.setAttribute('height', '100%');
	rect.setAttribute('y', 0);
	rect.setAttribute('x', 0);
	return new BootsShape(rect, props);
}

function line(props) {
	//[TODO] convert to width/height orientation?
	var line = new SVGElement('line');
	line.setAttribute('x1', 0);
	line.setAttribute('y1', 0);
	line.setAttribute('x2', (props.x2||0) - (props.x||props.left||0));
	line.setAttribute('y2', (props.y2||0) - (props.y||props.top||0));
	return new BootsShape(line, props);
}

function oval(props) {
	// convert radius property
	if (props.radius)
		props.height = props.width = props.radius*2;
	var oval = new SVGElement('ellipse');
	oval.setAttribute('rx', '50%');
	oval.setAttribute('ry', '50%');
	oval.setAttribute('cy', props.height/2);
	oval.setAttribute('cx', props.width/2);
	return new BootsShape(oval, props);
}

/*
 * helper functions
 */
 
function animate(fps, callback) {
	setInterval(callback, 1000 / fps);
}

function download(url, opts, funcs) {
}

function mouse() {
	return [mouse.BUTTON, mouse.COORDS.x, mouse.COORDS.y];
}
mouse.COORDS = {x: 0, y: 0};
mouse.BUTTON = 0;
document.addEventListener('mousemove', function (e) {
	// get body offset
	var bodyCoords = getElementPosition(document.body);
	// get mouse coordinates
	mouse.COORDS = {x: 0, y: 0};
	if (e.pageX || e.pageY)
		mouse.COORDS = {x: e.pageX - bodyCoords.x, y: e.pageY - bodyCoords.y};
	else if (e.clientX || e.clientY)
		mouse.COORDS = {
			x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - bodyCoords.x,
			y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop - bodyCoords.y
		}
}, true);
document.addEventListener('mousedown', function (e) {
	mouse.BUTTON = e.button;
}, true);
document.addEventListener('mouseup', function (e) {
	mouse.BUTTON = 0;
}, true);

function visit() {
}

/*
 * Ruby reimplementations
 */
 
function each(arr, func) {
	for (var i = 0, l = arr.length; i < l; i++)
		func(arr[i], arr, i);
}

function times(i, func) {
	for (var j = 0; j < i; j++)
		func(j);
}

function rand(max) {
	return Math.floor(Math.random() * max);
}

function range(min, max) {
	for (var inc = min < max ? 1 : -1, range = [], i = min; i != max; i += inc)
		range.push(i);
	return range.concat([max]);
}

window.Time = Date;