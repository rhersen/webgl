/* global alert */
/* exported webgl */

function webgl() {
    var PI2 = 2 * Math.PI
    var canvas = document.getElementById('webgl')
    var gl = canvas.getContext('webgl')
    var n = 5;
    var angles = new Float32Array(n)

    bind()

    gl.viewport(0, 0, canvas.width, canvas.height)

    requestAnimationFrame(draw)

    function setupProgram() {
        var r = createProgram()
        gl.useProgram(r)
        return r
    }

    function createProgram() {
        var r = gl.createProgram()

        gl.attachShader(r, createShader(gl.VERTEX_SHADER, [
            'attribute float angle',
            'void main() { gl_Position = vec4(cos(angle), sin(angle), 0, 1)',
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

    function bind() {
        var loc = gl.getAttribLocation(setupProgram(), 'angle')
        gl.enableVertexAttribArray(loc)
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0)
    }

    function draw() {
        updateAngles(new Date().getTime())
        gl.bufferData(gl.ARRAY_BUFFER, angles, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.LINE_LOOP, 0, angles.length)
        requestAnimationFrame(draw)

        function updateAngles(millis) {
            var d = PI2 / n
            var angle = millis % 20000 * PI2 / 20000
            var i = 0
            while (i < angles.length)
                angles[i++] = (angle += d)
        }
    }
}
