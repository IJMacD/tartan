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
    		paletteNumber,
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
			numLines = 20;

    	canvas[0].width = width;
    	canvas[0].height = height;

    	for(;i<l;i++){
    		weftLine = i % warpLines;
    		paletteNumber = warpColors[weftLine];
    		color = colors[paletteNumber];

    		ctx.strokeStyle = "rgb(" + color + ")";

    		ctx.beginPath();
    		ctx.moveTo(i-0.5,0);
    		ctx.lineTo(i-0.5,height);

    		ctx.stroke();
    	}

		var start = Date.now();
		requestAnimationFrame(weaveWeft);

	    i = 1;

		function weaveWeft(){
			l = i + numLines;
			for(;i<l;i++){
				weftLine = i % weftLines;
				paletteNumber = weftColors[weftLine];
				color = colors[paletteNumber];

				ctx.fillStyle = "rgb(" + color + ")";

				j = 1;
				m = width;
				for(;j<m;j++){
					warpLine = j % warpLines;
					mod = (weftLine + warpLine) % 4;
					if(((warpLine % 2 === 0) && (mod === 1 || mod === 2)) ||
						((warpLine % 2 === 1) && (mod === 0 || mod === 3))){
						ctx.fillRect(j, i, 1, 1);
					}
				}
			}
			if(i < height){
				requestAnimationFrame(weaveWeft);
			}
			else {
				console.log(Date.now() - start);
			}
		}
    }
});
