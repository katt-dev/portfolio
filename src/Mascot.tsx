import { useEffect, useRef } from 'react';

const vertex = `attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const fragment = `#extension GL_OES_standard_derivatives : enable
precision highp float;varying vec2 uv;uniform vec2 res;uniform float time;uniform vec2 pointer;uniform float energy;uniform float mode;
float field(vec2 q){float f=0.;for(int i=0;i<7;i++){float n=float(i);float a=time*(.2+n*.015)+n*2.4;vec2 c=vec2(sin(a),cos(a*.79+n))*(i==0?0.:.14+n*.009);float r=i==0?.17:.075+n*.005;vec2 d=q-c;float v=r*r/(dot(d,d)+.00001);f+=v*v;}return f;}
void main(){vec2 q=(uv-.5)*1.05;q.x*=res.x/res.y;float f=field(q);float aa=clamp(fwidth(f)*1.3,.001,.2);float mask=smoothstep(1.-aa,1.+aa,f);vec2 h=q-pointer*vec2(.525*res.x/res.y,.525);float a=atan(h.y,h.x);float radius=(.07+.011*sin(a*3.+time*1.5)+.006*cos(a*5.-time*2.)) * energy;float edge=max(1.5/res.y,.001);mask*=mix(1.,smoothstep(radius-edge,radius+edge,length(h)),smoothstep(0.,.15,energy));gl_FragColor=vec4(0.,0.,0.,mask);}`;

export function Mascot({ compact = false }: { compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const wake = useRef<()=>void>(()=>{});
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
    let raf = 0, visible = true, last = 0, clock = 0, x = 0, y = 0, energy = 0, dirty = true;
    const schedule = () => {if(!raf && visible && !document.hidden)raf=requestAnimationFrame(draw);};wake.current=schedule;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const resize = new ResizeObserver(() => { const box = c.getBoundingClientRect(); const dpr = Math.min((devicePixelRatio || 1) * 1.5, 3, Math.sqrt(2200000 / Math.max(box.width * box.height, 1))); c.width = Math.round(box.width*dpr); c.height = Math.round(box.height*dpr); gl.viewport(0,0,c.width,c.height); dirty=true; schedule(); });
    resize.observe(c);
    const visibility = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if(visible)schedule();else{cancelAnimationFrame(raf);raf=0;} }); visibility.observe(c);

    function draw(now: number) {
      raf = 0; const dt = Math.min((now-last)/1000 || .016, .035); last=now;
      if (!visible || document.hidden) return;
      if(!dirty && energy<.001 && signal.current.energy===0)return;
      dirty=false;clock += reduced.matches ? 0 : dt * energy;
      const s = signal.current, ease=1-Math.exp(-dt*5);
      x+=(s.x-x)*ease; y+=(s.y-y)*ease; energy+=(s.energy-energy)*ease;
      gl!.uniform2f(uniforms.res,c.width,c.height); gl!.uniform1f(uniforms.time,clock); gl!.uniform2f(uniforms.pointer,x,y); gl!.uniform1f(uniforms.energy,reduced.matches?0:energy); gl!.uniform1f(uniforms.mode,s.mode); gl!.clear(gl!.COLOR_BUFFER_BIT); gl!.drawArrays(gl!.TRIANGLE_STRIP,0,4);
      if(!reduced.matches&&(energy>.001||s.energy>0))schedule();
    }
    const show=()=>{if(!document.hidden){dirty=true;schedule();}};document.addEventListener('visibilitychange',show);schedule();
    return () => { cancelAnimationFrame(raf);wake.current=()=>{};document.removeEventListener('visibilitychange',show);resize.disconnect(); visibility.disconnect(); gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(v); gl.deleteShader(f); };
  }, []);
  return <div className={`mascot ${compact?'mascot--compact':''}`}>

    <div tabIndex={compact?-1:0} role="img" className="mascot__touch" aria-label="Интерактивная субстанция" onPointerEnter={()=>{signal.current.energy=1;wake.current();}} onFocus={()=>{signal.current.energy=1;wake.current();}} onBlur={()=>{signal.current.energy=0;wake.current();}} onPointerMove={e=>{ const b=e.currentTarget.getBoundingClientRect(); signal.current.x=(e.clientX-b.left)/b.width*2-1; signal.current.y=1-(e.clientY-b.top)/b.height*2; signal.current.energy=1;wake.current(); }} onPointerUp={e=>{if(e.pointerType==='touch'){signal.current.energy=0;wake.current();signal.current.x=0;signal.current.y=0;}}} onPointerLeave={()=>{signal.current.x=0;signal.current.y=0;signal.current.energy=0;wake.current();}}>
      <canvas ref={canvas} aria-hidden="true"/><span className="mascot__fallback"/>
    </div>


  </div>;
}
