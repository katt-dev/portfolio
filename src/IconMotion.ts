export function installIconMotion(){
 const mode=new URLSearchParams(location.search).get('icons')==='shared'?'shared':'custom';document.documentElement.dataset.iconMotion=mode;
 const running=new Set<Animation>(),last=new WeakMap<Element,number>();
 const play=(target:Element|undefined,frames:Keyframe[],delay=0,duration=560)=>{if(!target)return;const animation=target.animate(frames,{duration,delay,easing:'cubic-bezier(.22,1,.36,1)'});running.add(animation);animation.onfinish=()=>running.delete(animation);};
 const draw=(path:Element|undefined,delay=0)=>play(path,[{strokeDasharray:'70',strokeDashoffset:'70'},{strokeDasharray:'70',strokeDashoffset:'0'}],delay);
 const custom=(svg:SVGSVGElement)=>{const name=svg.getAttribute('class')??'',paths=[...svg.querySelectorAll('path')],circles=[...svg.querySelectorAll('circle')],rects=[...svg.querySelectorAll('rect')];let kind='';
 if(/gamepad/.test(name)){kind='gamepad';play(svg,[{rotate:'0deg'},{rotate:'-8deg',offset:.4},{rotate:'0deg'}]);circles.forEach((p,i)=>play(p,[{opacity:1},{opacity:.25,offset:.4},{opacity:1}],i*65));}
 else if(/globe|earth/.test(name)){kind='globe';paths.forEach((p,i)=>draw(p,i*45));}
 else if(/code|braces/.test(name)){kind='code';play(paths[0],[{translate:'0 0'},{translate:'-2px 0',offset:.4},{translate:'0 0'}]);play(paths.at(-1),[{translate:'0 0'},{translate:'2px 0',offset:.4},{translate:'0 0'}]);}
 else if(/folder/.test(name)){kind='folder';play(paths.at(-1),[{translate:'0 0'},{translate:'1px -2px',offset:.4},{translate:'0 0'}]);}
 else if(/shield/.test(name)){kind='shield';draw(paths.at(-1));}
 else if(/package/.test(name)){kind='package';play(svg,[{translate:'0 0'},{translate:'0 -2px',offset:.4},{translate:'0 0'}]);draw(paths.at(-1),90);}
 else if(/layout|grid/.test(name)){kind='layout';(rects.length?rects:paths).forEach((p,i)=>play(p,[{translate:'0 0'},{translate:'0 -1.8px',offset:.35},{translate:'0 0'}],i*45,420));}
 else if(/bot/.test(name)){kind='bot';(circles.length?circles:paths.slice(-2)).forEach((p,i)=>play(p,[{opacity:1},{opacity:.2,offset:.4},{opacity:1}],i*65));}
 else if(/wrench/.test(name)){kind='wrench';play(svg,[{rotate:'0deg'},{rotate:'-15deg',offset:.4},{rotate:'0deg'}]);}
 else if(/message/.test(name)){kind='message';play(svg,[{translate:'0 0'},{translate:'1px -2px',offset:.4},{translate:'0 0'}]);}
 else if(/briefcase/.test(name)){kind='briefcase';play(paths[0],[{translate:'0 0'},{translate:'0 -1.5px',offset:.4},{translate:'0 0'}]);}
 else if(/user/.test(name)){kind='user';play(circles[0],[{translate:'0 0'},{translate:'0 -1.5px',offset:.4},{translate:'0 0'}]);}
 else if(/copy/.test(name)){kind='copy';play(paths[0]??rects[0],[{translate:'0 0'},{translate:'-2px -2px',offset:.4},{translate:'0 0'}]);}
 else if(/check/.test(name)){kind='check';paths.forEach((p,i)=>draw(p,i*35));}
 else if(/external|arrow-up-right/.test(name)){kind='external-link';paths.slice(-2).forEach(p=>play(p,[{translate:'0 0'},{translate:'2px -2px',offset:.4},{translate:'0 0'}]));}
 else if(/chevron/.test(name)){kind='chevron';play(svg,[{translate:'0 0'},{translate:'0 2px',offset:.4},{translate:'0 0'}]);}
 else if(/plus/.test(name)){kind='plus';play(svg,[{rotate:'0deg'},{rotate:'90deg'}],0,520);}
 else if(/lucide-x(?: |$)/.test(name)){kind='close';play(svg,[{rotate:'0deg'},{rotate:'90deg'}],0,520);}
 else if(/menu/.test(name)){kind='menu';paths.forEach((p,i)=>play(p,[{translate:'0 0'},{translate:`${i%2?-2:2}px 0`,offset:.4},{translate:'0 0'}],i*45));}
 else if(/server/.test(name)){kind='server';circles.forEach((p,i)=>play(p,[{opacity:1},{opacity:.2,offset:.5},{opacity:1}],i*90));rects.forEach((p,i)=>draw(p,i*50));}
 else if(/plug/.test(name)){kind='integration';play(paths[0],[{translate:'0 0'},{translate:'1px -1px',offset:.4},{translate:'0 0'}]);draw(paths.at(-1),80);}
 else if(/pointer/.test(name)){kind='pointer';play(svg,[{translate:'0 0'},{translate:'2px 2px',offset:.45},{translate:'0 0'}]);}
 else{kind='trace';paths.forEach((p,i)=>draw(p,i*35));}
 svg.dataset.iconAnimation=kind;
 };
 const run=(target:EventTarget|null,related:EventTarget|null)=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||!(target instanceof Element))return;const owner=target.closest('button,a,[role=option],.owner-values>span,.stack-note,.craft-strip')??target.closest('svg.lucide');if(!owner||(related instanceof Node&&owner.contains(related)))return;const now=performance.now();if(now-(last.get(owner)??-1000)<180)return;last.set(owner,now);const icons=owner.matches('svg.lucide')?[owner as SVGSVGElement]:[...owner.querySelectorAll<SVGSVGElement>('svg.lucide')];icons.forEach(svg=>{if(mode==='shared'){svg.dataset.iconAnimation='shared';play(svg,[{translate:'0 0'},{translate:'0 -2px',offset:.4},{translate:'0 0'}]);}else custom(svg);});};
 const enter=(e:PointerEvent)=>run(e.target,e.relatedTarget),focus=(e:FocusEvent)=>{if(e.target instanceof Element&&e.target.matches(':focus-visible'))run(e.target,e.relatedTarget);};document.addEventListener('pointerover',enter);document.addEventListener('focusin',focus);
 return()=>{document.removeEventListener('pointerover',enter);document.removeEventListener('focusin',focus);running.forEach(a=>a.cancel());};
}
