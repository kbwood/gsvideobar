/* http://keith-wood.name/gsvideobar.html
   Google Search Videobar for jQuery v2.0.0.
   See http://www.google.com/uds/solutions/videobar/reference.html.
   Written by Keith Wood (kbwood{at}iinet.com.au) November 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */
   
(function($) { // hide the namespace

	var pluginName = 'gsvideobar';

	/** Create the Google Search Videobar plugin.
		<p>Sets a <code>div</code> to display a videobar.</p>
		<p>Expects HTML like:</p>
		<pre>&lt;div>&lt;/div></pre>
		<p>Provide inline configuration like:</p>
		<pre>&lt;div data-gsvideobar="name: 'value'">&lt;/div></pre>
	 	@module GSVideoBar
		@augments JQPlugin
		@example $(selector).gsvideobar({search: ['jquery']}); */
	$.JQPlugin.createPlugin({
	
		/** The name of the plugin. */
		name: pluginName,
		
		/** Cycle times - very short. */
		cycleVShort: 3000,
		/** Cycle times - short. */
		cycleShort: 10000,
		/** Cycle times - medium (default). */
		cycleMedium: 15000,
		/** Cycle times - long. */
		cycleLong: 30000,
		/** Cycle modes - random (default). */
		cycleRandom: 1,
		/** Cycle modes - linear. */
		cycleLinear: 2,
		/** Thumbnail sizes - small. */
		thumbnailsSmall: 1,
		/** Thumbnail sizes - medium (default). */
		thumbnailsMedium: 2,
		/** YouTube feeds - most viewed. */
		ytMostViewed: 'ytfeed:most_viewed',
		/** YouTube feeds - recently featured. */
		ytRecentlyFeatured: 'ytfeed:recently_featured',
		/** YouTube feeds - top rated. */
		ytTopRated: 'ytfeed:top_rated',
		/** YouTube time modifiers - today. */
		ytToday: '.today',
		/** YouTube time modifiers - this week. */
		ytThisWeek: '.this_week',
		/** YouTube time modifiers - this month. */
		ytThisMonth: '.this_month',
		/** YouTube time modifiers - any time. */
		ytAllTime: '.all_time',
			
		/** Default settings for the plugin.
			@property [horizontal=true] {boolean} <code>true</code> for horizontal display, <code>false</code> for vertical.
			@property [thumbnailSize=this.thumbnails] {number} The size of the video thumbnails.
			@property [player=''] {string|jQuery|Element} jQuery selector, jQuery object,
						or element for the player area, or '' for a floating player.
			@property [master=''] {string|jQuery|Element} jQuery selector, jQuery object,
						or element for the master videobar on the same page.
			@property [closeText=''] {string} Text displayed at the top of the player to close it.
			@property [search='jquery'] {string|string[]} Single or list of search terms.
			@property [manyResults=false] {boolean} <code>true</code> for many results, <code>false</code> for only a few.
			@property [cycleTime=this.cycleMedium] {number} Time between cycles of the search terms (milliseconds).
			@property [cycleMode=this.cycleRandom] {number} Mode of cycling through the search terms.
			@property [statusArea=''] {string|jQuery|Element} jQuery selector, jQuery object,
						or element for a status area. */
		defaultOptions: {
			horizontal: true,
			thumbnailSize: this.thumbnailsMedium,
			player: '',
			master: '',
			closeText: '',
			search: 'jquery',
			manyResults: false,
			cycleTime: this.cycleMedium,
			cycleMode: this.cycleRandom,
			statusArea: ''
		},

		/** Specify a YouTube channel to search.
			@param channel {string} The name of the channel.
			@return {string} The search parameter. */
		youTube: function(channel) {
			return 'ytchannel:' + channel;
		},
		
		_init: function() {
			this.defaultOptions.thumbnailSize = this.thumbnailsMedium;
			this.defaultOptions.cycleTime = this.cycleMedium,
			this.defaultOptions.cycleMode = this.cycleRandom;
			this._super();
		},

		_optionsChanged: function(elem, inst, options) {
			$.extend(inst.options, options);
			this._updateGSVideobar(elem[0], inst);
		},

		/** Redisplay the videobar with an updated display.
			@private
			@param elem {Element} The affected division.
			@param inst {object} The instance settings. */
		_updateGSVideobar: function(elem, inst) {
			var getElement = function(selector) {
				var element = inst.options[selector];
				element = (element ? (element.jQuery ? element : $(element)) : null);
				return (element && element.length ? element[0] : null);
			};
			var search = inst.options.search;
			search = ($.isArray(search) ? search : [search]);
			var player = getElement('player');
			var master = getElement('master');
			master = (master ? $.data(master, inst.name).videobar : null);
			inst.videobar = new GSvideoBar(elem,
				(master ? null : (player || GSvideoBar.PLAYER_ROOT_FLOATING)),
				{largeResultSet: inst.options.manyResults, horizontal: inst.options.horizontal,
				thumbnailSize: inst.options.thumbnailSize, string_allDone: inst.options.closeText,
				master: master,
				autoExecuteList: {executeList: search, cycleTime: inst.options.cycleTime,
					cycleMode: inst.options.cycleMode, statusRoot: getElement('statusArea')}});
		},

		/** Perform a new search in the videobar.
			@param elem {Element} The affected division.
			@param search {string} The new search terms. */
		search: function(elem, search) {
			var inst = this._getInst(elem);
			if (inst) {
				$.extend(inst.options, {search: search});
				inst.videobar.execute(search);
			}
		},

		_preDestroy: function(elem, inst) {
			elem.empty();
		}
	});

	// Add required external files - note: key must be set before loading this module
	if ($('script[src*="www.google.com/uds/api?file=uds.js"]').length === 0) {
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

})(jQuery);
