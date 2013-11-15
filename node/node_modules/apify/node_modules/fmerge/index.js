;(function(root,factory) {
if (typeof define === "function" && define.amd) {
	// AMD. Register as an anonymous module.
	define(factory);
} else if (typeof exports === "object") {
	// Node. Does not work with strict CommonJS, but
	// only CommonJS-like enviroments that support module.exports,
	// like Node.
	module.exports = factory();
} else {
	// Browser globals (root is window)
	root.fmerge = factory();
}})(this,function(){
return merge

function merge(a, b /*, ...args */) {
	var args = Array.prototype.slice.call(arguments, 2)

	var out = {}
	Object.keys(a || {}).forEach(function(key) {
		out[key] = a[key]
	})
	Object.keys(b || {}).forEach(function(key) {
		var val = b[key]
		// We only want to do this for actual objects
		// Any falsy type is not an actual object (0, '', null, any array, etc)
		if(val
		&& typeof(val) == 'object'
		&& !Array.isArray(val)
		&& a[key]
		&& typeof(a[key]) == 'object'
		) {
			val = merge(a[key], val)
		}
		out[key] = val
	})
	if(args.length) {
		args.unshift(out)
		out = merge.apply(null, args)
	}
	return out
}
});