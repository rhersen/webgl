/* exported webgl */

function webgl() {
    var gl = document.getElementById('webgl').getContext('webgl')
    var xTypedArray = new Float32Array(getXArray())
    var axesTypedArray = new Float32Array([
        -1, 0, 1, 0,
        1, 0, 0.95, 0.02,
        1, 0, 0.95, -0.02,
        0, -1, 0, 1,
        0, 1, 0.02, 0.95,
        0, 1, -0.02, 0.95
    ])

    var shaderErrorElement = document.getElementById('shader-error')
    var funcElement = document.getElementById('func')

    var graph = graphProgram(funcElement.value = 'sin(x)')

    var axes = axesProgram()
    var pLocation = gl.getAttribLocation(axes, 'p')
    var axisBuffer = createBuffer(pLocation)

    funcElement.addEventListener('input', onInput)

    requestAnimationFrame(draw)

    function getXArray() {
        var a = []
        for (var x = -1; x < 1; x += 0.005)
            a.push(x)
        a.push(1)
        return a
    }

    function onInput() {
        if (graph)
            gl.deleteProgram(graph.program)

        graph = graphProgram(funcElement.value)

        return false
    }

    function createBuffer(vertexAttribArray) {
        var r = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, r)
        gl.enableVertexAttribArray(vertexAttribArray)
        return r
    }

    function draw() {
        drawAxes()

        if (graph)
            drawGraph()

        requestAnimationFrame(draw)
    }

    function drawAxes() {
        gl.lineWidth(1)
        gl.useProgram(axes)
        gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer)
        gl.vertexAttribPointer(pLocation, 2, gl.FLOAT, false, 0, 0)
        gl.bufferData(gl.ARRAY_BUFFER, axesTypedArray, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINES, 0, axesTypedArray.length / 2)
    }

    function drawGraph() {
        gl.lineWidth(3)
        gl.useProgram(graph.program)
        gl.bindBuffer(gl.ARRAY_BUFFER, graph.buffer)
        gl.vertexAttribPointer(graph.x, 1, gl.FLOAT, false, 0, 0)
        gl.uniform1f(graph.t, new Date().getTime() % 8000 / 8000)
        gl.bufferData(gl.ARRAY_BUFFER, xTypedArray, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINE_STRIP, 0, xTypedArray.length)
    }

    function graphProgram(f) {
        var program = gl.createProgram()
        var shader = createShader(gl.VERTEX_SHADER, [
            'attribute float x',
            'uniform float t',
            'void main() { gl_Position = vec4(x, ' + f + ', 0, 1)',
            '}'
        ].join(';'))

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            shaderErrorElement.innerHTML = gl.getShaderInfoLog(shader)
            return
        }

        shaderErrorElement.innerHTML = ''
        gl.attachShader(program, shader)

        shader = createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0, 1)',
            '}'
        ].join(';'))
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            shaderErrorElement.innerHTML = gl.getShaderInfoLog(shader)
        gl.attachShader(program, shader)

        gl.linkProgram(program)

        var xLocation = gl.getAttribLocation(program, 'x')
        return {
            program: program,
            t: gl.getUniformLocation(program, 't'),
            x: xLocation,
            buffer: createBuffer(xLocation)
        }
    }

    function axesProgram() {
        var r = gl.createProgram()

        var shader = createShader(gl.VERTEX_SHADER, [
            'attribute vec2 p',
            'void main() { gl_Position = vec4(p, 0, 1)',
            '}'
        ].join(';'))
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            shaderErrorElement.innerHTML = gl.getShaderInfoLog(shader)
        gl.attachShader(r, shader)

        shader = createShader(gl.FRAGMENT_SHADER, [
            'void main() { gl_FragColor = vec4(0, 0, 0.6, 1)',
            '}'
        ].join(';'))
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            shaderErrorElement.innerHTML = gl.getShaderInfoLog(shader)
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
