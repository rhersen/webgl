function webgl() {
    const PERIOD = 20000;
    const DELAY = 56;
    const PI2 = 2 * Math.PI;
    var canvas = document.getElementById("webgl");
    var gl = canvas.getContext("experimental-webgl");
    var vertexArray = new Array(6);
    var vertices = new Float32Array(vertexArray);
    var program = setupProgram();

    var vertexBuf = gl.createBuffer();
    var texCoordBuf = createTextureCoordinateBuffer();
    var texImage = initTexture();

    bind();

    gl.viewport(0, 0, canvas.width, canvas.height);

    setInterval(draw, DELAY);

    function setupProgram() {
        var r = createProgram();
        gl.useProgram(r);
        return r;

        function createProgram() {
            var r = gl.createProgram();

            gl.attachShader(r, createShader(gl.VERTEX_SHADER,
                'attribute vec2 pos; attribute vec2 txc; varying vec2 ftxc;' +
                    'void main() { gl_Position = vec4(pos, 0, 1.1); ftxc = txc; }'));

            gl.attachShader(r, createShader(gl.FRAGMENT_SHADER,
            'precision mediump float; uniform vec4 color; uniform sampler2D tx; varying vec2 ftxc;' +
                'void main() { gl_FragColor = ' +
                'texture2D(tx, vec2(ftxc.s, ftxc.t));' +
            ' }'));

            gl.linkProgram(r);

            return r;

            function createShader(type, source) {
                var r = gl.createShader(type);
                gl.shaderSource(r, source);
                gl.compileShader(r);
                if (!gl.getShaderParameter(r, gl.COMPILE_STATUS)) {
                    alert(gl.getShaderInfoLog(r));
                }
                return r;
            }
        }
    }

    function createTextureCoordinateBuffer() {
        var texCoordBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0.5, 1]), gl.STATIC_DRAW);
        return texCoordBuf;
    }

    function initTexture() {
        var r = gl.createTexture();
        r.image = new Image();
        r.image.onload = setTextureParameters;
        r.image.src = "warning.png";

        return r;

        function setTextureParameters() {
            gl.bindTexture(gl.TEXTURE_2D, r);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, r.image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
    }

    function bind() {
        gl.uniform4fv(gl.getUniformLocation(program, "color"), [0, 0, 1, 1]);

        var loc = gl.getAttribLocation(program, "pos");
        gl.enableVertexAttribArray(loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        loc = gl.getAttribLocation(program, "txc");
        gl.enableVertexAttribArray(loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuf);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texImage);
        gl.uniform1i(gl.getUniformLocation(program, "tx"), 0);
    }

    function draw() {
        updateVertices(new Date().getTime());
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / 2);

        function updateVertices(millis) {
            var d = PI2 / 3;
            var angle = (millis % PERIOD) * PI2 / PERIOD;

            for (var i = 0; i < 3; i++) {
                vertexArray[i * 2] = Math.cos(angle);
                vertexArray[i * 2 + 1] = Math.sin(angle);
                angle += d;
            }

            vertices.set(vertexArray);
        }
    }
}
