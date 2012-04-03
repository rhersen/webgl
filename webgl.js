function webgl() {
    const PERIOD = 20000;
    const DELAY = 56;
    const PI2 = 2 * Math.PI;
    var canvas = document.getElementById("webgl");
    var gl = canvas.getContext("experimental-webgl");
    var vertexArray = new Array(6);
    var vertices = new Float32Array(vertexArray);
    var program = setupProgram();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    bind();
    setInterval(draw, DELAY);

    function setupProgram() {
        var r = createProgram();
        gl.useProgram(r);
        return r;

        function createProgram() {
            var r = gl.createProgram();

            gl.attachShader(r, createShader(gl.VERTEX_SHADER,
                'attribute vec2 pos; void main() { gl_Position = vec4(pos, 0, 1.1); }'));
            gl.attachShader(r, createShader(gl.FRAGMENT_SHADER,
                'precision mediump float; uniform vec4 color; void main() { gl_FragColor = color; }'));
            gl.linkProgram(r);

            return r;

            function createShader(type, source) {
                var r = gl.createShader(type);
                gl.shaderSource(r, source);
                gl.compileShader(r);
                return r;
            }
        }
    }

    function bind() {
        program.color = gl.getUniformLocation(program, "color");
        gl.uniform4fv(program.color, [0, 0, 1, 1]);
        program.pos = gl.getAttribLocation(program, "pos");
        gl.enableVertexAttribArray(program.pos);
        gl.vertexAttribPointer(program.pos, 2, gl.FLOAT, false, 0, 0);
    }

    function draw() {
        updateVertices(new Date().getTime());
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
