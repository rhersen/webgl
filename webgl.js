/* global alert */
/* exported webgl */

function webgl() {
    var canvas = document.getElementById('webgl')
    var gl = canvas.getContext('webgl')
    var a = []
    for (var i = 0, x = -1; x <= 1; x += 0.1) {
        a[i++] = x
    }
    var xs = new Float32Array(a)

    bind()

    gl.viewport(0, 0, canvas.width, canvas.height)

    requestAnimationFrame(draw)

    function bind() {
        var loc = gl.getAttribLocation(setupProgram(), 'x')
        gl.enableVertexAttribArray(loc)
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0)
    }

    function draw() {
        gl.bufferData(gl.ARRAY_BUFFER, xs, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINE_STRIP, 0, xs.length)
        requestAnimationFrame(draw)
    }

    function setupProgram() {
        var r = createProgram()
        gl.useProgram(r)
        return r
    }

    function createProgram() {
        var r = gl.createProgram()

        gl.attachShader(r, createShader(gl.VERTEX_SHADER, [
            'attribute float x',
            'void main() { gl_Position = vec4(x, sin(x), 0, 1)',
            '}'
        ].join(';')))

        gl.attachShader(r, createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0, 1)',
            '}'
        ].join(';')))

        gl.linkProgram(r)

        return r

        function createShader(type, source) {
            var r = gl.createShader(type)
            gl.shaderSource(r, source)
            gl.compileShader(r)
            if (!gl.getShaderParameter(r, gl.COMPILE_STATUS))
                alert(gl.getShaderInfoLog(r))
            return r
        }
    }
}
