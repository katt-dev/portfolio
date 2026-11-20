import { useEffect, useRef } from 'react';

// One shared smooth field for every ink mark; small marks reuse the same rendered frame.
const vertex=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
// Motion adapted from Freeward VPN's Telegram Mini App loader.js.
const between=(low:number,high:number)=>low+Math.random()*(high-low);
const makeDrop=(radius:number,reach:number)=>{const wave=()=>({size:between(.5,1)*reach,speed:between(.12,.42)*(Math.random()<.5?-1:1),phase:between(0,Math.PI*2)});return{radius,breathe:between(.3,.7),phase:between(0,6),x:[wave(),wave()],y:[wave(),wave()]};};
const drops=[makeDrop(.17,0),makeDrop(.085,.2),makeDrop(.075,.23),makeDrop(.07,.26),makeDrop(.06,.29),makeDrop(.055,.31),makeDrop(.045,.33)];
const packed=new Float32Array(drops.length*3);
const follow=(waves:{size:number;speed:number;phase:number}[],t:number)=>waves.reduce((sum,w)=>sum+Math.sin(t*w.speed+w.phase)*w.size*.62,0);
const fragment=`#extension GL_OES_standard_derivatives : enable
precision highp float;uniform vec2 res;uniform vec3 drops[7];
void main(){vec2 q=gl_FragCoord.xy/res-.5;float field=0.;for(int i=0;i<7;i++){vec2 d=q-drops[i].xy;float share=drops[i].z/(dot(d,d)+.000001);field+=min(share*share,4.);}float alpha=clamp((field-1.)/max(fwidth(field),.0001)+.5,0.,1.);gl_FragColor=vec4(0.,0.,0.,alpha);}`;
type Surface={canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;visible:boolean;width:number;height:number};
const surfaces=new Set<Surface>();
let source:HTMLCanvasElement|undefined,gl:WebGLRenderingContext|null=null,program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null,raf=0,last=0,clock=0;
let dropsUniform:WebGLUniformLocation|null=null,resUniform:WebGLUniformLocation|null=null;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function prepare(){
 if(source)return !!gl;source=document.createElement('canvas');gl=source.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return false;
 const context=gl;context.getExtension('OES_standard_derivatives');const shader=(type:number,text:string)=>{const s=context.createShader(type)!;context.shaderSource(s,text);context.compileShader(s);if(!context.getShaderParameter(s,context.COMPILE_STATUS)){context.deleteShader(s);return null;}return s;};const v=shader(context.VERTEX_SHADER,vertex),f=shader(context.FRAGMENT_SHADER,fragment);if(!v||!f){gl=null;return false;}
 program=context.createProgram()!;context.attachShader(program,v);context.attachShader(program,f);context.linkProgram(program);context.deleteShader(v);context.deleteShader(f);if(!context.getProgramParameter(program,context.LINK_STATUS)){gl=null;return false;}context.useProgram(program);buffer=context.createBuffer();context.bindBuffer(context.ARRAY_BUFFER,buffer);context.bufferData(context.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),context.STATIC_DRAW);const p=context.getAttribLocation(program,'p');context.enableVertexAttribArray(p);context.vertexAttribPointer(p,2,context.FLOAT,false,0,0);dropsUniform=context.getUniformLocation(program,'drops');resUniform=context.getUniformLocation(program,'res');return true;
}
function schedule(){if(!raf&&!document.hidden&&Array.from(surfaces).some(s=>s.visible))raf=requestAnimationFrame(draw);}
function draw(now:number){
 raf=0;if(document.hidden||!source||!gl)return;const active=Array.from(surfaces).filter(s=>s.visible&&s.width&&s.height);if(!active.length)return;
 const size=Math.min(1536,Math.max(64,...active.map(s=>Math.min(s.width,s.height))));if(source.width!==size||source.height!==size){source.width=size;source.height=size;gl.viewport(0,0,size,size);}clock+=reduced()?0:Math.min((now-last)/1000||.016,.25);last=now;gl.uniform2f(resUniform,size,size);drops.forEach((d,i)=>{const t=clock*1.1,radius=d.radius*(1.+.1*Math.sin(t*d.breathe+d.phase));const x=follow(d.x,t),y=follow(d.y,t),length=Math.hypot(x,y),join=length>0?.18*Math.tanh(length/.18)/length:1;packed.set([x*join,y*join,radius*radius],i*3);});gl.uniform3fv(dropsUniform,packed);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 for(const s of active){const side=Math.min(s.width,s.height);s.context.clearRect(0,0,s.width,s.height);s.context.drawImage(source,(s.width-side)/2,(s.height-side)/2,side,side);}
 if(!reduced())schedule();
}

export function BreathingInk({small=false}:{small?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current!,context=canvas.getContext('2d',{alpha:true});if(!context||!prepare()){canvas.dataset.fallback='true';return;}
 const surface:Surface={canvas,context,visible:false,width:0,height:0};surfaces.add(surface);
 const refresh=()=>{const b=canvas.getBoundingClientRect(),dpr=Math.min((devicePixelRatio||1)*1.5,3);surface.width=Math.max(1,Math.round(canvas.clientWidth*dpr));surface.height=Math.max(1,Math.round(canvas.clientHeight*dpr));canvas.width=surface.width;canvas.height=surface.height;context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';surface.visible=b.width>0&&b.height>0&&b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth;if(surface.visible){cancelAnimationFrame(raf);raf=0;draw(performance.now());}};const resize=new ResizeObserver(refresh);resize.observe(canvas);window.addEventListener('ink:refresh',refresh);refresh();
 const observer=new IntersectionObserver(([e])=>{surface.visible=e.isIntersecting;canvas.style.animationPlayState=surface.visible&&!document.hidden?'running':'paused';schedule();});observer.observe(canvas);const show=()=>{canvas.style.animationPlayState=surface.visible&&!document.hidden?'running':'paused';schedule();},motion=matchMedia('(prefers-reduced-motion: reduce)');document.addEventListener('visibilitychange',show);motion.addEventListener('change',show);
 return()=>{surfaces.delete(surface);window.removeEventListener('ink:refresh',refresh);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',show);motion.removeEventListener('change',show);if(!surfaces.size){cancelAnimationFrame(raf);raf=0;}};
 },[]);
 return <canvas ref={ref} className={`breathing-ink ${small?'breathing-ink--small':''}`} aria-hidden="true"/>;
}
export function Mascot({compact=false}:{compact?:boolean}){
 return <div className={`mascot ${compact?'mascot--compact':''}`} aria-hidden="true"><div className="mascot__art"><BreathingInk/></div></div>;
}
