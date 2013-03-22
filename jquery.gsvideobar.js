/* http://keith-wood.name/gsvideobar.html
   Google Search Videobar for jQuery v1.1.0.
   See http://www.google.com/uds/solutions/videobar/reference.html.
   Written by Keith Wood (kbwood{at}iinet.com.au) November 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

/* Display a Google Search Videobar.
   Attach it with options like:
   $('div selector').gsvideobar({search: ['jquery']});
*/

(function($) { // Hide scope, no $ conflict

/* GSVideobar manager. */
function GSVideobar() {
	this._defaults = {
		horizontal: true, // True for horizontal display, false for vertical
		thumbnailSize: this.thumbnailsMedium, // The size of the video thumbnails
		player: '', // jQuery selector, jQuery object, or element for the player area, or '' for a floating player
		master: '', // jQuery selector, jQuery object, or element for the master videobar on the same page
		closeText: '', // Text displayed at the top of the player to close it
		search: 'jquery', // Single or list of search terms
		manyResults: false, // True for many results, false for only a few
		cycleTime: this.cycleMedium, // Time between cycles of the search terms
		cycleMode: this.cycleRandom, // Mode of cycling through the search terms
		statusArea: '' // jQuery selector, jQuery object, or element for a status area
	};
}

$.extend(GSVideobar.prototype, {
	/* Class name added to elements to indicate already configured with GSVideobar. */
	markerClassName: 'hasGSVideobar',
	/* Name of the data property for instance settings. */
	propertyName: 'gsvideobar',

	/* Cycle times. */
	cycleVShort: 3000,
	cycleShort: 10000,
	cycleMedium: 15000, // Default
	cycleLong: 30000,
	/* Cycle modes. */
	cycleRandom: 1, // Default
	cycleLinear: 2,
	/* Thumbnail sizes. */
	thumbnailsSmall: 1,
	thumbnailsMedium: 2, // Default
	/* YouTube feeds. */
	ytMostViewed: 'ytfeed:most_viewed',
	ytRecentlyFeatured: 'ytfeed:recently_featured',
	ytTopRated: 'ytfeed:top_rated',
	/* YouTube time modifiers. */
	ytToday: '.today',
	ytThisWeek: '.this_week',
	ytThisMonth: '.this_month',
	ytAllTime: '.all_time',

	/* Override the default settings for all GSVideobar instances.
	   @param  options  (object) the new settings to use as defaults
	   @return  (GSVideobar) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	/* Specify a YouTube channel to search.
	   @param  channel  (string) the name of the channel
	   @return  (string) the search parameter */
	youTube: function(channel) {
		return 'ytchannel:' + channel;
	},

	/* Attach the videobar widget to a div.
	   @param  target   (element) the control to affect
	   @param  options  (object) the custom options for this instance */
	_attachPlugin: function(target, options) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = {options: $.extend({}, this._defaults, options), target: target};
		target.addClass(this.markerClassName).data(this.propertyName, inst);
		this._optionPlugin(target, options);
	},

	/* Retrieve or reconfigure the settings for a control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		$.extend(inst.options, options);
		this._updateGSVideobar(target[0], inst);
	},

	/* Redisplay the videobar with an updated display.
	   @param  target  (element) the affected division
	   @param  inst    (object) the instance settings */
	_updateGSVideobar: function(target, inst) {
		var getElement = function(selector) {
			var element = inst.options[selector];
			element = (element ? (element.jQuery ? element : $(element)) : null);
			return (element && element.length ? element[0] : null);
		};
		var search = inst.options.search;
		search = ($.isArray(search) ? search : [search]);
		var player = getElement('player');
		var master = getElement('master');
		master = (master ? $.data(master, this.propertyName).videobar : null);
		inst.videobar = new GSvideoBar(target,
			(master ? null : (player || GSvideoBar.PLAYER_ROOT_FLOATING)),
			{largeResultSet: inst.options.manyResults, horizontal: inst.options.horizontal,
			thumbnailSize: inst.options.thumbnailSize, string_allDone: inst.options.closeText,
			master: master,
			autoExecuteList: {executeList: search, cycleTime: inst.options.cycleTime,
				cycleMode: inst.options.cycleMode, statusRoot: getElement('statusArea')}});
	},

	/* Perform a new seacrh in the videobar.
	   @param  target  (element) the affected division
	   @param  search  (string) the new search terms */
	_searchPlugin: function(target, search) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			$.extend(inst.options, {search: search});
			inst.videobar.execute(search);
		}
	},

	/* Remove the plugin functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty().removeData(this.propertyName);
	}
});

// The list of commands that return values and don't permit chaining
var getters = [];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the GSVideobar functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.gsvideobar = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

// Add required external files - note: key must be set before loading this module
if ($('script[src*="www.google.com/uds/api?file=uds.js"]').length == 0) {
	if (!$.googleSearchKey) {
		throw 'Missing Google Search Key';
	}
	document.write('<script type="text/javascript" src="http://www.google.com/uds/' +
		'api?file=uds.js&v=1.0&key=' + $.googleSearchKey + '"></script>\n' +
		'<link type="text/css" href="http://www.google.com/uds/css/gsearch.css" rel="stylesheet"/>\n');
}
document.write('<script type="text/javascript" src="http://www.google.com/uds/' +
	'solutions/videobar/gsvideobar.js"></script>\n' +
	'<link type="text/css" href="http://www.google.com/uds/solutions/videobar/gsvideobar.css" ' +
	'rel="stylesheet"/>\n');

/* Initialise the GSVideobar functionality. */
var plugin = $.gsvideobar = new GSVideobar(); // Singleton instance

})(jQuery);
