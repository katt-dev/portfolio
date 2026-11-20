import { useEffect, useRef } from 'react';

// Same connected Mini App field, rendered as one shared antialiased vector path.
const between=(low:number,high:number)=>low+Math.random()*(high-low);
const makeDrop=(radius:number,reach:number)=>{const wave=()=>({size:between(.5,1)*reach,speed:between(.12,.42)*(Math.random()<.5?-1:1),phase:between(0,Math.PI*2)});return{radius,breathe:between(.3,.7),phase:between(0,6),x:[wave(),wave()],y:[wave(),wave()]};};
const drops=[makeDrop(.17,0),makeDrop(.085,.2),makeDrop(.075,.23),makeDrop(.07,.26),makeDrop(.06,.29),makeDrop(.055,.31),makeDrop(.045,.33)];
const follow=(waves:{size:number;speed:number;phase:number}[],t:number)=>waves.reduce((sum,w)=>sum+Math.sin(t*w.speed+w.phase)*w.size*.62,0);
const samples=96,points=new Float64Array(samples*2),directions=new Float64Array(samples*2),packed=new Float64Array(drops.length*3),smallDirections=new Float64Array(32*2);
for(let i=0;i<samples;i++){const angle=i/samples*Math.PI*2;directions[i*2]=Math.cos(angle);directions[i*2+1]=Math.sin(angle);}
for(let i=0;i<32;i++){const angle=i/32*Math.PI*2;smallDirections[i*2]=Math.cos(angle);smallDirections[i*2+1]=Math.sin(angle);}
function contour(time:number,count:number){
 const rays=count===samples?directions:smallDirections;
 const t=time*1.1;
 drops.forEach((d,i)=>{const radius=d.radius*(1+.1*Math.sin(t*d.breathe+d.phase)),x=follow(d.x,t),y=follow(d.y,t),length=Math.hypot(x,y),join=length>0?.18*Math.tanh(length/.18)/length:1;packed.set([x*join,y*join,radius*radius],i*3);});
 for(let i=0;i<count;i++){
  const dx=rays[i*2],dy=rays[i*2+1];let low=.12,high=.5;
  for(let step=0;step<12;step++){const radius=(low+high)*.5,x=dx*radius,y=dy*radius;let field=0;for(let j=0;j<packed.length;j+=3){const a=x-packed[j],b=y-packed[j+1],share=packed[j+2]/(a*a+b*b+.000001);field+=Math.min(share*share,4);}if(field>1)low=radius;else high=radius;}
  const radius=(low+high)*.5;points[i*2]=dx*radius;points[i*2+1]=dy*radius;
 }
 const path=new Path2D();path.moveTo(points[0],points[1]);
 for(let i=0;i<count;i++){const a=(i+count-1)%count*2,b=i*2,c=(i+1)%count*2,d=(i+2)%count*2;path.bezierCurveTo(points[b]+(points[c]-points[a])/6,points[b+1]+(points[c+1]-points[a+1])/6,points[c]-(points[d]-points[b])/6,points[c+1]-(points[d+1]-points[b+1])/6,points[c],points[c+1]);}
 path.closePath();return path;
}
type Surface={canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;visible:boolean;inDialog:boolean;width:number;height:number;cssSide:number};
const surfaces=new Map<HTMLCanvasElement,Surface>();
let active:Surface[]=[],resize:ResizeObserver|undefined,intersection:IntersectionObserver|undefined,occlusion:MutationObserver|undefined,motion:MediaQueryList|undefined;
let raf=0,last=0,clock=0,contourSamples=96,path:Path2D|undefined;
const refreshActivity=()=>{const dialog=document.body.classList.contains('case-is-open');active=[...surfaces.values()].filter(s=>s.visible&&s.width&&s.height&&(!dialog||s.inDialog));contourSamples=active.some(s=>s.cssSide>160)?96:32;if(!active.length){cancelAnimationFrame(raf);raf=0;last=0;}else schedule();};
function schedule(){if(!raf&&!document.hidden&&active.length)raf=requestAnimationFrame(draw);}
function draw(now:number){
 raf=0;if(document.hidden||!active.length){last=0;return;}
 if(!motion?.matches){clock+=last?Math.min((now-last)/1000,.05):0;path=contour(clock,contourSamples);}else path??=contour(clock,contourSamples);
 last=now;
 for(const s of active){const side=Math.min(s.width,s.height);s.context.setTransform(1,0,0,1,0,0);s.context.clearRect(0,0,s.width,s.height);s.context.setTransform(side,0,0,side,s.width/2,s.height/2);s.context.fillStyle='#000';s.context.fill(path!);}
 if(!motion?.matches)schedule();
}
function measure(s:Surface){
 const canvas=s.canvas,b=canvas.getBoundingClientRect(),dpr=Math.min((devicePixelRatio||1)*1.5,3),width=Math.max(1,Math.round(canvas.clientWidth*dpr)),height=Math.max(1,Math.round(canvas.clientHeight*dpr));
 s.cssSide=Math.min(canvas.clientWidth,canvas.clientHeight);
 if(s.width!==width||s.height!==height){s.width=width;s.height=height;canvas.width=width;canvas.height=height;}
 s.visible=b.width>0&&b.height>0&&b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth;
}
function refresh(){for(const s of surfaces.values())measure(s);refreshActivity();cancelAnimationFrame(raf);raf=0;draw(performance.now());}
function visibility(){last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0;}else schedule();}
function prepare(){
 if(resize)return;
 motion=matchMedia('(prefers-reduced-motion: reduce)');
 resize=new ResizeObserver(entries=>{for(const entry of entries){const s=surfaces.get(entry.target as HTMLCanvasElement);if(s)measure(s);}refreshActivity();});
 intersection=new IntersectionObserver(entries=>{for(const entry of entries){const s=surfaces.get(entry.target as HTMLCanvasElement);if(s)s.visible=entry.isIntersecting;}refreshActivity();});
 occlusion=new MutationObserver(refreshActivity);occlusion.observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('ink:refresh',refresh);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',refresh);
}
function release(){
 cancelAnimationFrame(raf);raf=0;last=0;active=[];resize?.disconnect();intersection?.disconnect();occlusion?.disconnect();resize=undefined;intersection=undefined;occlusion=undefined;
 window.removeEventListener('ink:refresh',refresh);document.removeEventListener('visibilitychange',visibility);motion?.removeEventListener('change',refresh);
}
export function BreathingInk({small=false}:{small?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current!,context=canvas.getContext('2d',{alpha:true});if(!context){canvas.dataset.fallback='true';return;}
  prepare();const surface:Surface={canvas,context,visible:false,inDialog:!!canvas.closest('.case'),width:0,height:0,cssSide:0};surfaces.set(canvas,surface);measure(surface);resize!.observe(canvas);intersection!.observe(canvas);refreshActivity();cancelAnimationFrame(raf);raf=0;draw(performance.now());
  return()=>{resize?.unobserve(canvas);intersection?.unobserve(canvas);surfaces.delete(canvas);if(!surfaces.size)release();else refreshActivity();};
 },[]);
 return <canvas ref={ref} className={`breathing-ink ${small?'breathing-ink--small':''}`} aria-hidden="true"/>;
}
export function Mascot({compact=false}:{compact?:boolean}){
 return <div className={`mascot ${compact?'mascot--compact':''}`} aria-hidden="true"><div className="mascot__art"><BreathingInk/></div></div>;
}
