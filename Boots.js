/*
 * Boots | A Tiny JS Toolkit
 *-------------------------------------------------
 * http://shoes.heroku.com/manual/Hello.html
 */

function Structure() { }
Structure.extend = function (p, s) {
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
	augment(Factory, Structure);
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
			call.apply(Functor, arguments);
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
	return /^[0-9]+$/.test(val) ? val + 'px' : val;
}

function getAbsolutePosition(element) {
	var r = { x: element.offsetLeft, y: element.offsetTop };
	if (element.offsetParent) {
		var tmp = getAbsolutePosition(element.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

function getMouseXY(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	// Do something with this information
	return {x: posx, y: posy};
}


/*
 * Boots
 */
 
function isBootsElement(elem) {
	return !!elem.Boots;
}

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
	left: function (elem, val) { elem.style.position = 'absolute'; elem.style.left = normalizeUnits(val); },
	stroke: function (elem, val) { elem.style.color = normalizeColor(val).val; }, //[TODO] ban patterns?
	
	// attributes
	scroll: function (elem, val) { elem.style.overflow = val ? 'scroll' : 'hidden'; },
	length: function (elem, val) { elem.setAttribute('length', val); },
	value: function (elem, val) { elem.value = val; },
	title: function (elem, val) { document.title = val; }
};

function getFunctionName(f) {
	return f.name || f.toString().match(/function\s*(.+?)\s*\(/)[1];
}

var BootsElement = Functor({
	Boots: true,
	elem: null,
	artNode: null,
	props: null,
	events: null,
	
	constructor: function (elem) {
		this.elem = elem;
		this.events = {};
		this.props = {};
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

		// events
		for (var name in this.events)
			this.elem['on' + name] = this.events[name];
		
		// props
		for (var prop in this.props)
			if (prop in elemProp)
				elemProp[prop](this.elem, this.props[prop]);
				
//[TODO] styles
	};
});

var Boots = {
	app: function () {
		var ret = Boots.create(document.body);
		ret.apply(ret, [background({fill: white})].concat([].slice.apply(arguments, [])));
		return ret;
	},
	create: function (elem) {
		var ret = function () {			
			var content = [];
			// parse arguments
			for (var i = 0; i < arguments.length; i++)
				if (typeof arguments[i] == 'object')
					ret.props = arguments[i];
				else if (typeof arguments[i] == 'function' && !isBootsElement(arguments[i]))
					ret.events[getFunctionName(arguments[i])] = arguments[i];
				else
					content.push(arguments[i]);
			// load content
			if (content.length)
				ret.clear.apply(ret, content);

			// events
			for (var name in ret.events)
				ret.elem['on' + name] = ret.events[name];
			
			// props
			for (var prop in ret.props)
				if (prop in elemProp)
					elemProp[prop](ret.elem, ret.props[prop]);
					
	//[TODO] styles
	
			return ret;
		};
		ret.Boots = true;
		ret.elem = elem;
		ret.artNode = null;
		ret.props = {};
		ret.events = {};
		
		// element manipulation
		function insert(parent, child, args) {
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
			
			// ensure art node always comes first
			if (ret.artNode)
				ret.elem.insertBefore(ret.artNode, ret.elem.firstChild);
		}
		ret.clear = function () {
			if (isContentValue(ret.elem))
				ret.elem.value = '';
			else {
				while (ret.elem.firstChild)
					ret.elem.removeChild(ret.elem.firstChild);
				ret.artNode = null;
			}
			insert(ret.elem, null, arguments);
		}
		ret.append = function () {
			insert(ret.elem, null, arguments);
		}
		ret.prepend = function () {
			insert(ret.elem, ret.elem.firstChild, arguments);
		}
		ret.after = function () {
			insert(ret.elem.parentNode, ret.elem.nextSibling, arguments);
		}
		ret.before = function () {
			insert(ret.elem.parentNode, ret.elem, arguments);
		}
		
		// property reading
		ret.text = function () { return ret.elem.innerHTML || ret.elem.value; } //[TODO] innerText
		ret.height = function () { return ret.elem.offsetHeight; }
		ret.width = function () { return ret.elem.offsetWidth; }
		ret.left = function () { return getAbsolutePosition(ret.elem).x - getAbsolutePosition(document.body).x; }
		ret.top = function () { return getAbsolutePosition(ret.elem).y - getAbsolutePosition(document.body).y; }
		ret.toString = function () { return '[Boots ' + ret.elem.tagName + ']'; }
		
		// property manipulation
		ret.hide = function () { ret.elem.style.display = 'none'; }
		ret.show = function () { ret.elem.style.display = ''; }
		ret.move = function (t, l) {
			ret.elem.style.position = 'absolute';
			ret.elem.style.top = t + 'px';
			ret.elem.style.left = l + 'px';
		}
		ret.remove = function () {
			ret.elem.parentNode.removeChild(ret.elem);
		}
		
		// 'motion' event
		ret.elem.onmousemove = function (e) {
			if (ret.elem.onmotion) {
				var left = getMouseXY(e || window.event).x - getAbsolutePosition(document.body).x
				var top = getMouseXY(e || window.event).y - getAbsolutePosition(document.body).y;
				ret.elem.onmotion(left, top);
			}
		}
		
		return ret;
	}
};

/*
 * slots
 */
 
function stack() {
	var elem = document.createElement('div');
	elem.className = 'stack';
	var ret = Boots.create(elem);
	return ret.apply(ret, arguments);
}

function flow() {
	var elem = document.createElement('div');
	elem.className = 'flow';
	var ret = Boots.create(elem);
	return ret.apply(ret, arguments);
}

/*
 * form elements
 */
 
function edit_line() {
	var elem = document.createElement('input');
	elem.type = 'text';
	var ret = Boots.create(elem);
	return ret.apply(ret, arguments);
}

function button() {
	var ret = Boots.create(document.createElement('button'));
	return ret.apply(ret, arguments);
}

/*
 * text
 */
 
function TextBlock(elem, args) {
	var ret = Boots.create(elem);
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
	var ret = Boots.create(document.createElement('code'));
	return ret.apply(ret, arguments);
}

function del() {
	var ret = Boots.create(document.createElement('del'));
	return ret.apply(ret, arguments);
}

function em() {
	var ret = Boots.create(document.createElement('em'));
	return ret.apply(ret, arguments);
}

function ins() {
	var ret = Boots.create(document.createElement('ins'));
	return ret.apply(ret, arguments);
}
/*
function link() {
	var ret = Boots.create(document.createElement('a'));
	return ret.apply(ret, arguments);
}
*/
function span() {
	var ret = Boots.create(document.createElement('span'));
	return ret.apply(ret, arguments);
}

function strong() {
	var ret = Boots.create(document.createElement('strong'));
	return ret.apply(ret, arguments);
}

function sub() {
	var ret = Boots.create(document.createElement('sub'));
	return ret.apply(ret, arguments);
}

function sup() {
	var ret = Boots.create(document.createElement('sup'));
	return ret.apply(ret, arguments);
}

/*
 * colors
 */

function normalizeColor(color) {
	return (typeof color == 'string') ? new Color(color) : color;
}
 
Color = Structure.extend({
	val: null,
	constructor: function (val) {
		this.val = val
	},
	apply: function (svg, elem) {
		return this.val;
	}
})

Gradient = Structure.extend({
	from: null,
	to: null,
	id: null,
	constructor: function (from, to) {
		this.from = normalizeColor(from);
		this.to = normalizeColor(to);
		this.id = 'gradient' + Date.now();
	},
	apply: function (svg, elem) {
		var defs = svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
		var linear = defs.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient'));
		linear.setAttribute('id', this.id);
		linear.setAttribute('x1', '0%');
		linear.setAttribute('x2', '0%');
		linear.setAttribute('y1', '0%');
		linear.setAttribute('y2', '100%');
		var stop1 = linear.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'stop'));
		stop1.setAttribute('offset', '0%');
		stop1.setAttribute('style', 'stop-color:' + this.from.val);
		var stop2 = linear.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'stop'));
		stop2.setAttribute('offset', '100%');
		stop2.setAttribute('style', 'stop-color:' + this.to.val);
		return 'url(#' + this.id + ')';
	}
})
 
function gradient(from, to) {
	return new Gradient(from, to);
}

function rgb(r, g, b, a) {
	return new Color('rgb(' + r + ',' + g + ',' + b + ')'); //[TODO] alpha
}

// explicit color definitions
black = rgb(0, 0, 0);
gray = rgb(128, 128, 128);
white = rgb(255, 255, 255);
red = rgb(255, 0, 0);
blue = rgb(0, 0, 255);

/*
 * art
 */
 
Shape = Structure.extend({
	shape: null,
	props: null,
	constructor: function (shape, props) {
		this.shape = shape;
		this.props = props || {};
	},
	Boots: true,
	_insert: function (svg) {
		if (this.props.fill)
			this.shape.setAttribute('fill', normalizeColor(this.props.fill).apply(svg, this.shape));
		if (this.props.stroke)
			this.shape.setAttribute('stroke', normalizeColor(this.props.stroke).apply(svg, this.shape));
		if (this.props.strokewidth)
			this.shape.setAttribute('strok-width', this.props.strokewidth);
		svg.appendChild(this.shape);
	}
});

//[TODO] have the "insert" function be a Boots.insert method too, then Shape/Boots methods are degenerate
 
function createSVG(bg) {
	var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.setAttribute('style', 'z-index: ' + (bg ? 0 : 5) + '; position: absolute; top: 0; left: 0;');
	return svg;
}

function createSVGElement(svg, tagName) {
	return svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', tagName));
}
 
function createShapeStyle(svg, shape, props) {
	props = props || {}
	if (props.fill)
		shape.setAttribute('fill', normalizeColor(props.fill).apply(svg, shape));
	if (props.stroke)
		shape.setAttribute('stroke', normalizeColor(props.stroke).apply(svg, shape));
	if (props.strokewidth)
		shape.setAttribute('strok-width', props.strokewidth);
}
 
// note: isn't in bg
function background(props) {
	var svg = createSVG(false);
	var rect = createSVGElement(svg, 'rect');
	rect.setAttribute('width', '100%');
	rect.setAttribute('height', '100%');
	createShapeStyle(svg, rect, props);
	// we attach svg element
	return Boots.create(svg);
}

function rect(t,l,w,h, props) {
	var svg = createSVG(true);
	var rect = createSVGElement(svg, 'rect');
	rect.setAttribute('width', w);
	rect.setAttribute('height', h);
	rect.setAttribute('y', t);
	rect.setAttribute('x', l);
	createShapeStyle(svg, rect, props);
	return Boots.create(svg);
}

function line(l,t,x2,y2, props) {
	var svg = createSVG(true);
	var line = createSVGElement(svg, 'line');
	line.setAttribute('x1', l);
	line.setAttribute('x2', x2);
	line.setAttribute('y1', t);
	line.setAttribute('y2', y2);
	createShapeStyle(svg, line, props);
	return Boots.create(svg);
}

function oval(x, y, r, props) {
	//[TODO] center: attr
	var svg = createSVG(true);
	var oval = createSVGElement(svg, 'circle');
	oval.setAttribute('r', r);
	oval.setAttribute('cy', y);
	oval.setAttribute('cx', x);
	createShapeStyle(svg, oval, props);
	return Boots.create(svg);
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
}

function visit() {
}

/*
 * Ruby reimplementations
 */
 
function each(arr, func) {
	for (var i = 0; i < arr.length; i++)
		func(arr[i], arr, i);
}

function times(i, func) {
	for (var j = 0; j < i; j++)
		func(j);
}

function rand(max) {
	return Math.floor(Math.random() * max);
}

window.Time = Date;