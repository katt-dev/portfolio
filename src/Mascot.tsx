import { useEffect, useRef } from 'react';

const vertex = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const fragment = `#extension GL_OES_standard_derivatives : enable
precision highp float;varying vec2 uv;uniform vec2 res;uniform float time;uniform vec2 pointer;uniform float energy;uniform float mode;
float heightAt(float f){return sqrt(max(0.,1.-1./sqrt(max(f,1.))));}
float field(vec2 q){float f=0.;for(int i=0;i<7;i++){float n=float(i);float a=time*(.23+n*.025)+n*2.4;vec2 c=vec2(sin(a),cos(a*.79+n))*(i==0?0.:.14+n*.009);c+=pointer*.028*sin(n+1.);float r=i==0?.17:.075+n*.005;r*=1.+.07*sin(time*.7+n);float spread=1.+energy*.45; c*=spread;vec2 d=q-c;float v=r*r/(dot(d,d)+.00001);f+=v*v;}return f;}
void main(){vec2 q=(uv-.5)*1.05; q.x*=res.x/res.y; float angle=atan(q.y,q.x); q*=1.+.025*sin(angle*5.+time*.65)*energy;float f=field(q);float aa=max(fwidth(f)*1.2,.001);float mask=smoothstep(1.-aa,1.+aa,f);if(mask<.001){gl_FragColor=vec4(0.);return;}float e=.002;vec2 g=vec2(heightAt(field(q+vec2(e,0.)))-heightAt(field(q-vec2(e,0.))),heightAt(field(q+vec2(0.,e)))-heightAt(field(q-vec2(0.,e))))/(2.*e);vec3 normal=normalize(vec3(-g*.34,1.));vec3 light=normalize(vec3(-.6,.8,.9));float diffuse=max(dot(normal,light),0.);float spec=pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),42.);float rim=pow(1.-max(normal.z,0.),3.);vec3 col=vec3(.025,.03,.035)+diffuse*.035+spec*.24+rim*.07;gl_FragColor=vec4(col,mask);}`;

export function Mascot({ compact = false }: { compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const signal = useRef({ x: 0, y: 0, energy: 0, mode: 0 });
  useEffect(() => {
    const c = canvas.current!;
    const gl = c.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) { c.dataset.fallback = 'true'; return; }
    const shader = (type: number, source: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, source); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Shader compile'); return s; };
    gl.getExtension('OES_standard_derivatives');
    const program = gl.createProgram()!;
    const v = shader(gl.VERTEX_SHADER, vertex), f = shader(gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(program, v); gl.attachShader(program, f); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const at = gl.getAttribLocation(program, 'p'); gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['res','time','pointer','energy','mode'].map(k => [k, gl.getUniformLocation(program, k)]));
    let raf = 0, visible = true, last = 0, clock = 0, x = 0, y = 0, energy = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const resize = new ResizeObserver(() => { const box = c.getBoundingClientRect(); const dpr = Math.min((devicePixelRatio || 1) * 1.5, 3, Math.sqrt(2200000 / Math.max(box.width * box.height, 1))); c.width = Math.round(box.width*dpr); c.height = Math.round(box.height*dpr); gl.viewport(0,0,c.width,c.height); });
    resize.observe(c);
    const visibility = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); visibility.observe(c);
    const react = () => { signal.current.energy = 1; };
    window.addEventListener('substance:react', react);
    function draw(now: number) {
      raf = requestAnimationFrame(draw); const dt = Math.min((now-last)/1000 || .016, .035); last=now;
      if (!visible || document.hidden) return;
      clock += reduced.matches ? 0 : dt;
      const s = signal.current, ease=1-Math.exp(-dt*5);
      x+=(s.x-x)*ease; y+=(s.y-y)*ease; energy+=(s.energy-energy)*ease; s.energy*=Math.exp(-dt*1.4);
      gl!.uniform2f(uniforms.res,c.width,c.height); gl!.uniform1f(uniforms.time,clock); gl!.uniform2f(uniforms.pointer,x,y); gl!.uniform1f(uniforms.energy,reduced.matches?0:energy); gl!.uniform1f(uniforms.mode,s.mode); gl!.clear(gl!.COLOR_BUFFER_BIT); gl!.drawArrays(gl!.TRIANGLE_STRIP,0,4);
    }
    raf=requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); resize.disconnect(); visibility.disconnect(); window.removeEventListener('substance:react',react); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(v); gl.deleteShader(f); };
  }, []);
  return <div className={`mascot ${compact?'mascot--compact':''}`}>
    <div className="mascot__orbit orbit-a"/><div className="mascot__orbit orbit-b"/>
    <button className="mascot__touch" aria-label="Поиграть с субстанцией" onPointerMove={e=>{ const b=e.currentTarget.getBoundingClientRect(); signal.current.x=(e.clientX-b.left)/b.width*2-1; signal.current.y=1-(e.clientY-b.top)/b.height*2; signal.current.energy=Math.max(signal.current.energy,.2); }} onPointerLeave={()=>{signal.current.x=0;signal.current.y=0;}} onClick={()=>{signal.current.energy=2.8;}}>
      <canvas ref={canvas} aria-hidden="true"/><span className="mascot__fallback"/>
    </button>
    <div className="mascot__shadow"/>
    {!compact&&<><span className="mascot__tag tag-one">Выразительная форма</span><span className="mascot__tag tag-two">Продуманный опыт</span></>}
  </div>;
}
