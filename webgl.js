/* global alert */
/* exported webgl */

function webgl() {
    var canvas = document.getElementById('webgl')
    var gl = canvas.getContext('webgl')
    var xs = new Float32Array(getXs())
    var axis = new Float32Array([
        -1, 0, 1, 0,
        1, 0, 0.95, 0.02,
        1, 0, 0.95, -0.02,
        0, -1, 0, 1,
        0, 1, 0.02, 0.95,
        0, 1, -0.02, 0.95
    ])
    var graph = graphProgram(), axes = axesProgram()
    var pos
    var x
    var t

    bind()

    requestAnimationFrame(draw)

    function getXs() {
        var a = []
        for (var x = -1; x < 1; x += 0.005)
            a.push(x)
        a.push(1)
        return a
    }

    function bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())

        t = gl.getUniformLocation(graph, 't')
        x = gl.getAttribLocation(graph, 'x')
        gl.enableVertexAttribArray(x)

        pos = gl.getAttribLocation(axes, 'pos')
        gl.enableVertexAttribArray(pos)
    }

    function draw() {
        gl.lineWidth(1)
        gl.useProgram(axes)
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
        gl.bufferData(gl.ARRAY_BUFFER, axis, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINES, 0, axis.length / 2)

        gl.lineWidth(3)
        gl.useProgram(graph)
        gl.vertexAttribPointer(x, 1, gl.FLOAT, false, 0, 0)
        gl.uniform1f(t, new Date().getTime() % 8000 / 8000)
        gl.bufferData(gl.ARRAY_BUFFER, xs, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINE_STRIP, 0, xs.length)

        requestAnimationFrame(draw)
    }

    function graphProgram() {
        var r = gl.createProgram()

        gl.attachShader(r, createShader(gl.VERTEX_SHADER, [
            'attribute float x',
            'uniform float t',
            'void main() { gl_Position = vec4(x, x * sin(x * 4. - t * 6.28), 0, 1)',
            '}'
        ].join(';')))

        gl.attachShader(r, createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0, 1)',
            '}'
        ].join(';')))

        gl.linkProgram(r)

        return r
    }

    function axesProgram() {
        var r = gl.createProgram()

        gl.attachShader(r, createShader(gl.VERTEX_SHADER, [
            'attribute vec2 pos',
            'void main() { gl_Position = vec4(pos, 0, 1)',
            '}'
        ].join(';')))

        gl.attachShader(r, createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0.6, 1)',
            '}'
        ].join(';')))

        gl.linkProgram(r)

        return r
    }

    function createShader(type, source) {
        var r = gl.createShader(type)
        gl.shaderSource(r, source)
        gl.compileShader(r)
        if (!gl.getShaderParameter(r, gl.COMPILE_STATUS))
            alert(gl.getShaderInfoLog(r))
        return r
    }
}
