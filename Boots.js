/*
 * Boots | A Tiny JS Toolkit
 *-------------------------------------------------
 * http://shoes.heroku.com/manual/Hello.html
 */

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

/*
 * Boots
 */
 
function isBootsElement(elem) {
	return !!elem.Boots;
}

var elemProp = {
	// styles
	width: function (elem, val) { elem.style.width = val + 'px'; },
	height: function (elem, val) { elem.style.height = val + 'px'; },
	margin: function (elem, val) { elem.style.margin = val + 'px'; },
	margin_top: function (elem, val) { elem.style.marginTop = val + 'px'; },
	margin_right: function (elem, val) { elem.style.marginRight = val + 'px'; },
	margin_bottom: function (elem, val) { elem.style.marginBottom = val + 'px'; },
	margin_left: function (elem, val) { elem.style.marginLeft = val + 'px'; },
	top: function (elem, val) { elem.style.position = 'absolute'; elem.style.top = val + 'px'; },
	left: function (elem, val) { elem.style.position = 'absolute'; elem.style.left = val + 'px'; },
	
	// attributes
	scroll: function (elem, val) { elem.style.overflow = val ? 'scroll' : 'hidden'; },
	length: function (elem, val) { elem.setAttribute('length', val); },
	value: function (elem, val) { elem.value = val; },
	title: function (elem, val) { document.title = val; }
};

function getFunctionName(f) {
	return f.name || f.toString().match(/function\s*(.+?)\s*\(/)[1];
}

var Boots = {
	app: function () {
		var ret = Boots.create(document.body);
		ret.apply(ret, arguments);
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
		}
		ret.clear = function () {
			isContentValue(ret.elem) ? ret.elem.value = '' : ret.elem.innerHTML = '';
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
		
		return ret;
	}
};

/*
 * elements
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
 
function banner() {
	var ret = Boots.create(document.createElement('h1'));
	return ret.apply(ret, arguments);
}

function title() {
	var ret = Boots.create(document.createElement('h2'));
	return ret.apply(ret, arguments);
}

function subtitle() {
	var ret = Boots.create(document.createElement('h3'));
	return ret.apply(ret, arguments);
}

function tagline() {
	var ret = Boots.create(document.createElement('h4'));
	return ret.apply(ret, arguments);
}

function caption() {
	var ret = Boots.create(document.createElement('h5'));
	return ret.apply(ret, arguments);
}

function para() {
	var ret = Boots.create(document.createElement('p'));
	return ret.apply(ret, arguments);
}

function inscription() {
	var ret = Boots.create(document.createElement('h6'));
	return ret.apply(ret, arguments);
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
 * helper functions
 */

function each(arr, func) {
	for (var i = 0; i < arr.length; i++)
		func(arr[i], arr, i);
}

function times(i, func) {
	for (var j = 0; j < i; j++)
		func(j);
}

function download(url, opts, funcs) {
}

function mouse() {
}

function visit() {
}

