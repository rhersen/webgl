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

    var $func = document.getElementById('func');
    var $shaderError = document.getElementById('shader-error');

    var graph = graphProgram()
    var axes = axesProgram();
    var pos = gl.getAttribLocation(axes, 'pos')

    var x, t, xsBuffer, axisBuffer

    $func.addEventListener('input', onInput)

    bind()

    requestAnimationFrame(draw)

    function getXs() {
        var a = []
        for (var x = -1; x < 1; x += 0.005)
            a.push(x)
        a.push(1)
        return a
    }

    function onInput() {
        gl.deleteProgram(graph)
        graph = graphProgram()
        if (graph) {
            t = gl.getUniformLocation(graph, 't')
            x = gl.getAttribLocation(graph, 'x')
        }
        return false
    }

    function bind() {
        xsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, xsBuffer)
        gl.enableVertexAttribArray(x)

        axisBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer)
        gl.enableVertexAttribArray(pos)
    }

    function draw() {
        gl.lineWidth(1)
        gl.useProgram(axes)
        gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer)
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
        gl.bufferData(gl.ARRAY_BUFFER, axis, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINES, 0, axis.length / 2)

        if (graph) {
            gl.lineWidth(3)
            gl.useProgram(graph)
            gl.bindBuffer(gl.ARRAY_BUFFER, xsBuffer)
            gl.vertexAttribPointer(x, 1, gl.FLOAT, false, 0, 0)
            gl.uniform1f(t, new Date().getTime() % 8000 / 8000)
            gl.bufferData(gl.ARRAY_BUFFER, xs, gl.DYNAMIC_DRAW)
            gl.drawArrays(gl.LINE_STRIP, 0, xs.length)
        }

        requestAnimationFrame(draw)
    }

    function graphProgram() {
        var r = gl.createProgram()
        var shader = createShader(gl.VERTEX_SHADER, [
            'attribute float x',
            'uniform float t',
            'void main() { gl_Position = vec4(x, ' + $func.value + ', 0, 1)',
            '}'
        ].join(';'));

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            $shaderError.innerHTML = gl.getShaderInfoLog(shader)
            return
        }

        $shaderError.innerHTML = ''
        gl.attachShader(r, shader)

        shader = createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0, 1)',
            '}'
        ].join(';'));
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            $shaderError.innerHTML = gl.getShaderInfoLog(shader)
        gl.attachShader(r, shader)

        gl.linkProgram(r)

        return r
    }

    function axesProgram() {
        var r = gl.createProgram()

        var shader = createShader(gl.VERTEX_SHADER, [
            'attribute vec2 pos',
            'void main() { gl_Position = vec4(pos, 0, 1)',
            '}'
        ].join(';'));
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            $shaderError.innerHTML = gl.getShaderInfoLog(shader)
        gl.attachShader(r, shader)

        shader = createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0.6, 1)',
            '}'
        ].join(';'));
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            $shaderError.innerHTML = gl.getShaderInfoLog(shader)
        gl.attachShader(r, shader)

        gl.linkProgram(r)

        return r
    }

    function createShader(type, source) {
        var r = gl.createShader(type)
        gl.shaderSource(r, source)
        gl.compileShader(r)
        return r
    }
}
