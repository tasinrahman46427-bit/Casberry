import { useEffect, useRef } from 'react';

// Drop-in placeholder. Replace with your Shader Studio React export (<ShaderCanvas />).
const VS = `#version 300 es
in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec3 uA;uniform vec3 uB;uniform vec3 uBg;
out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.02;a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float t=uTime*.12;
  vec2 q=vec2(fbm(p*2.+t),fbm(p*2.-t+4.));
  float f=fbm(p*2.5+q*2.+t);
  float band=smoothstep(.35,.9,f)*(1.-smoothstep(.0,1.2,length(p)*.6));
  vec3 c=mix(uBg,mix(uA,uB,q.x),band);
  c+=pow(band,4.)*.25;
  c+=(h(gl_FragCoord.xy+uTime)-.5)*.03;
  o=vec4(c,1.);
}`;

const rgb = hex => {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
};

export default function ShaderCanvas({ primary = '#896ABD', secondary = '#A855F7', background = '#07060d', style }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const gl = c.getContext('webgl2');
    if (!gl) return;
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return sh; };
    const pr = gl.createProgram();
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n);
    gl.uniform3fv(U('uA'), rgb(primary));
    gl.uniform3fv(U('uB'), rgb(secondary));
    gl.uniform3fv(U('uBg'), rgb(background));
    let raf = 0, vis = true;
    const fit = () => {
      const d = Math.min(devicePixelRatio || 1, 1.5);
      c.width = c.clientWidth * d; c.height = c.clientHeight * d;
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform2f(U('uRes'), c.width, c.height);
    };
    const ro = new ResizeObserver(fit); ro.observe(c); fit();
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; });
    io.observe(c);
    const loop = t => {
      raf = requestAnimationFrame(loop);
      if (!vis || document.hidden) return;
      gl.uniform1f(U('uTime'), t / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [primary, secondary, background]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block', ...style }} />;
}
