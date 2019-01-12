/*eslint-env browser*/
/*global glMatrix, Float32Array*/

/**
 * @author Bartlomiej Tadych, b4rtaz
 */
(function () {

var _canvas,
	_gl,
	_width,
	_height,
	_vertexShader,
	_fragmentShader,
	_program,

	// Attr/uniform locations.
	_positionLoc,
	_matLoc,
	_resolutionLoc,
	_fracScaleLoc,
	_fracAng1Loc,
	_fracAng2Loc,
	_fracShiftLoc,
	_fracColLoc,
	_marblePosLoc,
	_marbleRadLoc,
	_flagScaleLoc,
	_flagPosLoc,
	_exposureLoc,

	// Values.
	_rotate,
	_camDistance,
	_fracScale,
	_fracAng1,
	_fracAng2,
	_fracShift1,
	_fracShift2,
	_fracShift3,
	_fracCol1,
	_fracCol2,
	_fracCol3,
	_rotation = 0.5,

	// Inputs.
	_rotateInput,
	_camDistanceInput,
	_resolutionInput,
	_fracScaleInput,
	_fracAng1Input,
	_fracAng2Input,
	_fracShift1Input,
	_fracShift2Input,
	_fracShift3Input,
	_fracCol1Input,
	_fracCol2Input,
	_fracCol3Input,
	_presetInput;

function readInputs() {
	var resolution = _resolutionInput.value.split('x');
	if (resolution[0] === '!') {
		_width = window.innerWidth;
		_height = window.innerHeight;
	} else {
		_width = parseInt(resolution[0]);
		_height = parseInt(resolution[1]);
	}

	_rotate = !!_rotateInput.checked;
	_camDistance = parseFloat(_camDistanceInput.value);
	_fracScale = parseFloat(_fracScaleInput.value);
	_fracAng1 = parseFloat(_fracAng1Input.value);
	_fracAng2 = parseFloat(_fracAng2Input.value);
	_fracShift1 = parseFloat(_fracShift1Input.value);
	_fracShift2 = parseFloat(_fracShift2Input.value);
	_fracShift3 = parseFloat(_fracShift3Input.value);
	_fracCol1 = parseFloat(_fracCol1Input.value);
	_fracCol2 = parseFloat(_fracCol2Input.value);
	_fracCol3 = parseFloat(_fracCol3Input.value);
}

function renderFrame() {
	_gl.clearColor(0.0, 0.0, 0.0, 1.0);
	_gl.clear(_gl.COLOR_BUFFER_BIT);

	var mat = glMatrix.mat4.create();

	glMatrix.mat4.targetTo(mat, [
		Math.sin(_rotation) * _camDistance,
		8,  
		Math.cos(_rotation) * _camDistance
	], [0, 0, 0], [0, 1, 0]);

	_gl.vertexAttribPointer(_positionLoc, 2, _gl.FLOAT, false, 0, 0);

	_gl.uniformMatrix4fv(_matLoc, false, mat);
	_gl.uniform2f(_resolutionLoc, _canvas.width, _canvas.height);
	_gl.uniform1f(_fracScaleLoc, _fracScale);
	_gl.uniform1f(_fracAng1Loc, _fracAng1);
	_gl.uniform1f(_fracAng2Loc, _fracAng2);
	_gl.uniform3f(_fracShiftLoc, _fracShift1, _fracShift2, _fracShift3);
	_gl.uniform3f(_fracColLoc, _fracCol1, _fracCol2, _fracCol3);
	_gl.uniform3f(_marblePosLoc, 999, 999, 999);
	_gl.uniform1f(_marbleRadLoc, 0.035);
	_gl.uniform1f(_flagScaleLoc, -0.035);
	_gl.uniform3f(_flagPosLoc, 999.0, 999.0, 999.0);
	_gl.uniform1f(_exposureLoc, 1.0);

	_gl.drawArrays(_gl.TRIANGLES, 0, 6);

	if (_rotate) {
		_rotation += 0.08;
		window.requestAnimationFrame(renderFrame, _canvas);
	}
}

function readDocument(file, handler) {
	var request = new XMLHttpRequest();
	request.open('GET', file, true);
	request.onreadystatechange = function () {
		if (request.readyState === 4) {
			if (request.status === 200 || request.status == 0) {
				handler(request.responseText);
			}
		}
	}
	request.send(null);
}

function reloadCanvasSize() {
	_canvas.width = _width;
	_canvas.height = _height;
	_gl.viewport(0, 0, _gl.drawingBufferWidth, _gl.drawingBufferHeight);
}

function onSetPresetPressed() {
	var preset = _presetInput.value.split(',');
	_fracScaleInput.value = preset[1];
	_fracAng1Input.value = preset[3];
	_fracAng2Input.value = preset[4];
	_fracShift1Input.value = preset[6];
	_fracShift2Input.value = preset[7];
	_fracShift3Input.value = preset[8];
	_fracCol1Input.value = preset[10];
	_fracCol2Input.value = preset[11];
	_fracCol3Input.value = preset[12];
	onInputChanged();
}

function onResolutionChanged() {
	readInputs();
	reloadCanvasSize();
	if (!_rotate) {
		renderFrame();
	}
}

function onInputChanged() {
	var prevRotate = _rotate;
	readInputs();
	if (!_rotate || prevRotate !== _rotate) {
		renderFrame();
	}
}

function onShaderLoaded() {
	if (!_vertexShader || !_fragmentShader) {
		return;
	}

	_program = _gl.createProgram();
	_gl.attachShader(_program, _vertexShader);
	_gl.attachShader(_program, _fragmentShader);
	_gl.linkProgram(_program);	
	_gl.useProgram(_program);

	_positionLoc = _gl.getAttribLocation(_program, 'a_position');
	_gl.enableVertexAttribArray(_positionLoc);

	_matLoc = _gl.getUniformLocation(_program, 'iMat');
	_resolutionLoc = _gl.getUniformLocation(_program, 'iResolution');
	_fracScaleLoc = _gl.getUniformLocation(_program, 'iFracScale');
	_fracAng1Loc = _gl.getUniformLocation(_program, 'iFracAng1');
	_fracAng2Loc = _gl.getUniformLocation(_program, 'iFracAng2');
	_fracShiftLoc = _gl.getUniformLocation(_program, 'iFracShift');
	_fracColLoc = _gl.getUniformLocation(_program, 'iFracCol');
	_marblePosLoc = _gl.getUniformLocation(_program, 'iMarblePos');
	_marbleRadLoc = _gl.getUniformLocation(_program, 'iMarbleRad');
	_flagScaleLoc = _gl.getUniformLocation(_program, 'iFlagScale');
	_flagPosLoc = _gl.getUniformLocation(_program, 'iFlagPos');
	_exposureLoc = _gl.getUniformLocation(_program, 'iExposure');
	
	renderFrame();
}

function load() {
	_rotateInput = document.getElementById('rotateInput');
	_camDistanceInput = document.getElementById('camDistanceInput');
	_resolutionInput = document.getElementById('resolutionInput');
	_fracScaleInput = document.getElementById('fracScaleInput');
	_fracAng1Input = document.getElementById('fracAng1Input');
	_fracAng2Input = document.getElementById('fracAng2Input');
	_fracShift1Input = document.getElementById('fracShift1Input');
	_fracShift2Input = document.getElementById('fracShift2Input');
	_fracShift3Input = document.getElementById('fracShift3Input');
	_fracCol1Input = document.getElementById('fracCol1Input');
	_fracCol2Input = document.getElementById('fracCol2Input');
	_fracCol3Input = document.getElementById('fracCol3Input');
	_presetInput = document.getElementById('preset');

	_rotateInput.addEventListener('change', onInputChanged);
	_camDistanceInput.addEventListener('change', onInputChanged);
	_resolutionInput.addEventListener('change', onResolutionChanged);
	_fracScaleInput.addEventListener('change', onInputChanged);
	_fracAng1Input.addEventListener('change', onInputChanged);
	_fracAng2Input.addEventListener('change', onInputChanged);
	_fracShift1Input.addEventListener('change', onInputChanged);
	_fracShift2Input.addEventListener('change', onInputChanged);
	_fracShift3Input.addEventListener('change', onInputChanged);
	_fracCol1Input.addEventListener('change', onInputChanged);
	_fracCol2Input.addEventListener('change', onInputChanged);
	_fracCol3Input.addEventListener('change', onInputChanged);
	document.getElementById('setPresetButton')
		.addEventListener('click', onSetPresetPressed);

	readInputs();

	_canvas = document.getElementById('canvas');
	_gl = _canvas.getContext('experimental-webgl');

	reloadCanvasSize();

	var buffer = _gl.createBuffer();
	_gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
	_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array([
		-1.0, -1.0,
		1.0, -1.0,
		-1.0, 1.0,
		-1.0, 1.0,
		1.0, -1.0,
		1.0, 1.0]), _gl.STATIC_DRAW);

	readDocument('./assets/vertex-sheader.glsl', function (content) {
		_vertexShader = _gl.createShader(_gl.VERTEX_SHADER);
		_gl.shaderSource(_vertexShader, content);
		_gl.compileShader(_vertexShader);
		onShaderLoaded();
	});

	readDocument('./assets/fragment-sheader.glsl', function (content) {
		_fragmentShader = _gl.createShader(_gl.FRAGMENT_SHADER);
		_gl.shaderSource(_fragmentShader, content);
		_gl.compileShader(_fragmentShader);
		onShaderLoaded();
	});
}

window.addEventListener('load', load);

}());
