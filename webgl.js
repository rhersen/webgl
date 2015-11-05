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

    var axes = axesProgram()
    var graph = graphProgram(funcElement.value = 'sin(x)')

    var animation = requestAnimationFrame(draw)

    funcElement.addEventListener('input', onInput)

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

        if (animation && !graph) {
            cancelAnimationFrame(animation)
            animation = 0
        }

        if (graph && !animation)
            animation = requestAnimationFrame(draw)

        return false
    }

    function draw() {
        if (!animation) return

        drawAxes()

        if (graph)
            drawGraph()

        animation = requestAnimationFrame(draw)

        function drawAxes() {
            gl.lineWidth(1)
            gl.useProgram(axes.program)
            gl.bindBuffer(gl.ARRAY_BUFFER, axes.buffer)
            gl.vertexAttribPointer(axes.p, 2, gl.FLOAT, false, 0, 0)
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
    }

    function graphProgram(f) {
        var program = createProgram([
            'attribute float x',
            'uniform float t',
            'void main() { gl_Position = vec4(x, ' + f + ', 0, 1)',
            '}'
        ].join(';'), [
            'void main() { gl_FragColor = vec4(0, 0, 0, 1)',
            '}'
        ].join(';'))

        if (program) {
            var xLocation = gl.getAttribLocation(program, 'x')

            return {
                program: program,
                t: gl.getUniformLocation(program, 't'),
                x: xLocation,
                buffer: createBuffer(xLocation)
            }
        }
    }

    function axesProgram() {
        var program = createProgram([
            'attribute vec2 p',
            'void main() { gl_Position = vec4(p, 0, 1)',
            '}'
        ].join(';'), [
            'void main() { gl_FragColor = vec4(0, 0, 0.6, 1)',
            '}'
        ].join(';'))

        if (program) {
            var pLocation = gl.getAttribLocation(program, 'p')

            return {
                program: program,
                p: pLocation,
                buffer: createBuffer(pLocation)
            }
        }
    }

    function createProgram(v, f) {
        var program = gl.createProgram()

        if (compile(gl.VERTEX_SHADER, v) && compile(gl.FRAGMENT_SHADER, f)) {
            gl.linkProgram(program)
            shaderErrorElement.innerHTML = ''
            return program
        }

        function compile(type, source) {
            var shader = gl.createShader(type)
            gl.shaderSource(shader, source)
            gl.compileShader(shader)
            var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
            if (compiled)
                gl.attachShader(program, shader)
            else
                shaderErrorElement.innerHTML = gl.getShaderInfoLog(shader)

            return compiled
        }
    }

    function createBuffer(vertexAttribArray) {
        var r = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, r)
        gl.enableVertexAttribArray(vertexAttribArray)
        return r
    }
}
