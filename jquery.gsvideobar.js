/* http://keith-wood.name/gsvideobar.html
   Google Search Videobar for jQuery v1.0.2.
   See http://www.google.com/uds/solutions/videobar/reference.html.
   Written by Keith Wood (kbwood{at}iinet.com.au) November 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
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

var PROP_NAME = 'gsvideobar';

$.extend(GSVideobar.prototype, {
	/* Class name added to elements to indicate already configured with GSVideobar. */
	markerClassName: 'hasGSVideobar',

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
	   @param  options  (object) the new settings to use as defaults */
	setDefaults: function(options) {
		extendRemove(this._defaults, options || {});
		return this;
	},

	/* Specify a YouTube channel to search.
	   @param  channel  (string) the name of the channel
	   @return  (string) the search parameter */
	youTube: function(channel) {
		return 'ytchannel:' + channel;
	},

	/* Attach the videobar widget to a div.
	   @param  target   (element) the affected division
	   @param  options  (object) the new instance settings */
	_attachGSVideobar: function(target, options) {
		target = $(target);
		if (target.is('.' + this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		var inst = {target: target};
		inst.options = $.extend({}, options);
		$.data(target[0], PROP_NAME, inst);
		this._updateGSVideobar(target, inst);
	},

	/* Reconfigure the settings for a videobar div.
	   @param  target   (element) the affected division
	   @param  options  (object) the new/changed instance settings */
	_changeGSVideobar: function(target, options) {
		var inst = $.data(target, PROP_NAME);
		if (inst) {
			extendRemove(inst.options, options || {});
			$.data(target, PROP_NAME, inst);
			this._updateGSVideobar($(target), inst);
		}
	},

	/* Perform a new seacrh in the videobar.
	   @param  target  (element) the affected division
	   @param  search  (string) the new search terms */
	_searchGSVideobar: function(target, search) {
		var inst = $.data(target, PROP_NAME);
		if (inst) {
			extendRemove(inst.options, {search: search});
			$.data(target, PROP_NAME, inst);
			inst.videobar.execute(search);
		}
	},

	/* Redisplay the videobar with an updated display.
	   @param  target  (object) the jQuery object for the affected division
	   @param  inst    (object) the instance settings */
	_updateGSVideobar: function(target, inst) {
		var getElement = function(selector) {
			var element = $.gsvideobar._get(inst, selector);
			element = (element ? (element.jQuery ? element : $(element)) : null);
			return (element && element.length ? element[0] : null);
		};
		var search = this._get(inst, 'search');
		search = (isArray(search) ? search : [search]);
		var player = getElement('player');
		var master = getElement('master');
		master = (master ? $.data(master, PROP_NAME).videobar : null);
		inst.videobar = new GSvideoBar(target[0],
			(master ? null : (player || GSvideoBar.PLAYER_ROOT_FLOATING)),
			{largeResultSet: this._get(inst, 'manyResults'),
			horizontal: this._get(inst, 'horizontal'),
			thumbnailSize: this._get(inst, 'thumbnailSize'),
			string_allDone: this._get(inst, 'closeText'),
			master: master,
			autoExecuteList: {executeList: search,
				cycleTime: this._get(inst, 'cycleTime'),
				cycleMode: this._get(inst, 'cycleMode'),
				statusRoot: getElement('statusArea')}});
	},

	/* Remove the videobar widget from a div.
	   @param  target  (element) the affected division */
	_destroyGSVideobar: function(target) {
		target = $(target);
		if (!target.is('.' + this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty();
		$.removeData(target[0], PROP_NAME);
	},

	/* Get a setting value, defaulting if necessary.
	   @param  inst  (object) the instance settings
	   @param  name  (string) the name of the setting
	   @return  (any) the setting value */
	_get: function(inst, name) {
		return (inst.options[name] != null ?
			inst.options[name] : $.gsvideobar._defaults[name]);
	}
});

/* jQuery extend now ignores nulls! */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = null;
		}
	}
	return target;
}

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && a.constructor == Array);
}

/* Attach the GSVideobar functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these GSVideobar instances
   @return  (object) jQuery object for chaining further calls */
$.fn.gsvideobar = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	return this.each(function() {
		if (typeof options == 'string') {
			$.gsvideobar['_' + options + 'GSVideobar'].
				apply($.gsvideobar, [this].concat(otherArgs));
		}
		else {
			$.gsvideobar._attachGSVideobar(this, options);
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
$.gsvideobar = new GSVideobar(); // singleton instance

})(jQuery);
