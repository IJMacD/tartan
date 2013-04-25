$(function(){
	var canvas = $('#tartan'),
		ctx = canvas[0].getContext('2d'),

		// DOM Elements
		filesInput = $('#files'),
		openFileBtn = $('#open-file-btn'),
		saveTartanBtn = $('#save-tartan-btn');

	/*******************
	 * File loading
	 *******************/

	/**
	 * Handler for file input
	 */
	function handleFileSelect(evt) {
		var files = evt.target.files; // FileList object
		loadFiles(files);
	}

	/**
	 * Handle the loading with FileAPI
	 * @param FileList files
	 */
	function loadFiles(files){
		var i = 0,
			l = files.length,
			f,
			reader;

		if(l > 0) {
			f = files[0];
			reader = new FileReader();

			reader.onload = function(e) {
				var wif = parseFile(e.target.result);
				drawWIF(wif);
			};

			// Read in the file as text.
			reader.readAsText(f);
		}
	}

	filesInput.on('change', handleFileSelect);
    openFileBtn.on('click', function(){ filesInput.trigger('click'); });

    function handleSaveTartan(e){
    	saveTartanBtn.attr('download', 'tartan.png');
    	saveTartanBtn.attr('href', canvas[0].toDataURL());
    }

    saveTartanBtn.on('click', handleSaveTartan);

    /**************************
     * Handle .wif file parsing
     **************************/

    /**
     * Parse .wif file
     * @param {File} file
     * @return {object} Object representing file
     */
    function parseFile(file){
		var linesRegex = /[^\r\n]+/g,
			sectionRegex = /\[([^\[\]]+)\]/,
			settingRegex = /([^;=][^=]*)=([^=]+)/,
    		output = {},
    		lines = file.match(linesRegex),
    		i = 0,
    		l = lines.length,
    		line,
    		match,
    		key,
    		value,
    		currentSection;
		for(;i<l;i++){
			line = lines[i];

			match = line.match(sectionRegex);

			if(match){
				key = match[1];
				value = {};
				output[key] = value;
				currentSection = value;
			}
			else {
				match = line.match(settingRegex);

				if(match && currentSection){
					key = match[1];
					value = match[2];

					currentSection[key] = value;
				}
			}
		}

		return output;
    }

    /*****************
     * Output
     ****************/

    /**
     * Displays a wif object on the canvas
     */
    function drawWIF(wif){
    	var colors = wif['COLOR TABLE'],
			warpLines = parseInt(wif['WARP'].Threads),
    		warpColors = wif['WARP COLORS'],
			weftLines = parseInt(wif['WEFT'].Threads),
    		weftColors = wif['WEFT COLORS'],
			warpPalette,
			weftPalette,
    		color,
    		j,
    		m,
    		mod,
    		width = canvas.width(),
    		height = canvas.height(),
    		i = 1,
    		l = width,
    		weftLine,
			warpLine,
			colorData = [],
			di,
			id, d;

    	canvas[0].width = width;
    	canvas[0].height = height;

		var start = Date.now();

	    i = 0;
		l = height;

		id = ctx.createImageData(width,height);
		d = id.data;

		di = 0;

		for(;i<l;i++){
			weftLine = (i % weftLines) + 1;
			weftPalette = weftColors[weftLine];

			if(!colorData[weftPalette]){
				colorData[weftPalette] = colors[weftPalette].split(",");
			}

			j = 0;
			m = width;
			for(;j<m;j++){
				warpLine = (j % warpLines) + 1;
				warpPalette = warpColors[warpLine];

				if(!colorData[warpPalette]){
					colorData[warpPalette] = colors[warpPalette].split(",");
				}

				mod = (weftLine + warpLine) % 4;

				// Warp Color
				if(((warpLine % 2 === 0) && (mod === 1 || mod === 2)) ||
					((warpLine % 2 === 1) && (mod === 0 || mod === 3))){
					color = colorData[warpPalette];
				}
				// Weft Color
				else {
					color = colorData[weftPalette];
				}
				d[di++] = color[0];
				d[di++] = color[1];
				d[di++] = color[2];
				d[di++] = 255;
			}
		}

		ctx.putImageData(id, 0, 0);

		if(i < height){
		}
		else {
			console.log(Date.now() - start);
		}
    }
});
