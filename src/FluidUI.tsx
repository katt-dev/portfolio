import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X, Gamepad2, Globe2, LayoutGrid, Bot, Wrench, MessageCircle } from 'lucide-react';
import Lenis from 'lenis';
import { flushSync } from 'react-dom';
import { BreathingInk } from './Mascot';
import { Plus } from 'lucide-react';

let transitionIndex=0;
const projectOrigins=new Map<string,HTMLElement>();
export function fluidRoute(action:()=>void){
 const index=++transitionIndex;
 const before=new URLSearchParams(location.search).get('project');
 const origin=[...document.querySelectorAll<HTMLElement>('.project-card__visual,.skill-project-preview')].find(el=>el.style.viewTransitionName.startsWith('cover-'));if(!before&&origin)projectOrigins.set(origin.style.viewTransitionName.slice(6),origin);
 const update=()=>{flushSync(action);document.querySelectorAll<HTMLElement>('.project-card__visual,.skill-project-preview').forEach(el=>el.style.viewTransitionName='none');const after=new URLSearchParams(location.search).get('project');if(before&&!after){const candidates=[...document.querySelectorAll<HTMLElement>(`[data-project-preview="${CSS.escape(before)}"],.project-card--${CSS.escape(before)} .project-card__visual`)];const remembered=projectOrigins.get(before);if(remembered?.isConnected)candidates.unshift(remembered);const card=candidates.find(el=>{const b=el.getBoundingClientRect();return b.top<innerHeight&&b.bottom>0;})??candidates[0];if(card)card.style.viewTransitionName=`cover-${before}`;}window.dispatchEvent(new Event('ink:refresh'));};
 const clean=()=>{if(index===transitionIndex)document.querySelectorAll<HTMLElement>('.project-card__visual,.skill-project-preview').forEach(el=>el.style.viewTransitionName='none');};
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const transition=document.startViewTransition(update);transition.finished.then(clean,clean);}else{update();clean();}
}

export function FluidSelect({value,onChange,options}:{value:string;onChange:(s:string)=>void;options:string[]}){
 const [open,setOpen]=useState(false);const [active,setActive]=useState(0);const [placement,setPlacement]=useState('bottom');const [maxHeight,setMaxHeight]=useState(344);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 useLayoutEffect(()=>{if(!open)return;const update=()=>{const b=trigger.current?.getBoundingClientRect();if(!b)return;const below=innerHeight-b.bottom-20,above=b.top-20,up=below<300&&above>below;setPlacement(up?'top':'bottom');setMaxHeight(Math.min(344,Math.max(150,up?above:below)));};update();window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);},[open]);
 const icons=[Gamepad2,Globe2,LayoutGrid,Bot,Wrench,MessageCircle];
 const choose=(n:number)=>{onChange(options[n]);setOpen(false);trigger.current?.focus();};
 return <div className={`fluid-select ${open?'is-open':''}`} data-placement={placement} style={{'--select-max-height':`${maxHeight}px`} as React.CSSProperties} ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
 <button ref={trigger} id="kind" className="fluid-select__trigger" type="button" role="combobox" aria-controls="kind-options" aria-expanded={open} aria-haspopup="listbox" aria-activedescendant={open?`kind-${active}`:undefined} onClick={()=>{setActive(Math.max(0,options.indexOf(value)));setOpen(!open);}} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End','Escape','Enter',' '].includes(e.key)){e.preventDefault();if(e.key==='Escape'){setOpen(false);return;}if(e.key==='Enter'||e.key===' '){if(open)choose(active);else setOpen(true);return;}setOpen(true);setActive(n=>e.key==='Home'?0:e.key==='End'?options.length-1:(n+(e.key==='ArrowDown'?1:-1)+options.length)%options.length);}}}><span>{value}</span><ChevronDown size={18}/></button>
 {open&&<div className="fluid-select__options" role="listbox" id="kind-options" aria-label="Тип проекта">{options.map((o,i)=>{const Icon=icons[i%icons.length];return <div id={`kind-${i}`} key={o} role="option" aria-selected={value===o} className={active===i?'is-active':''} onPointerMove={()=>setActive(i)} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(i)}><Icon size={18} className="select-option__icon"/><span>{o}</span>{value===o&&<Check size={16} className="select-option__check"/>}</div>})}</div>}
 </div>;
}

export function FluidHint({label,text}:{label:string;text:string}){
 const [open,setOpen]=useState(false);const id=useRef(`hint-${Math.random().toString(36).slice(2)}`);
 return <span className={`fluid-hint ${open?'is-open':''}`} onPointerEnter={()=>setOpen(true)} onPointerLeave={()=>setOpen(false)}><button type="button" aria-expanded={open} aria-describedby={open?id.current:undefined} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onClick={()=>setOpen(!open)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}>{label}<i>?</i></button><span role="tooltip" id={id.current} hidden={!open}>{text}</span></span>;
}

export function FluidDetails({title,children}:{title:string;children:React.ReactNode}){
 const [open,setOpen]=useState(false);const id=useRef(`detail-${Math.random().toString(36).slice(2)}`);
 return <div className={`fluid-details ${open?'is-open':''}`}><button type="button" aria-expanded={open} aria-controls={id.current} onClick={()=>setOpen(!open)}>{title}<span className="disclosure-glyph"><Plus size={14}/></span></button><div className="fluid-details__body" id={id.current} inert={!open}><div>{children}</div></div></div>;
}

export function FluidInterface(){
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let main:Lenis|undefined,modal:Lenis|undefined,wrapper:HTMLElement|null=null;
  const easing=(t:number)=>1-Math.pow(1-t,4);
  const setupModal=()=>{const next=document.querySelector<HTMLElement>('dialog[open]');if(next!==wrapper){modal?.destroy();modal=undefined;wrapper=next;if(next&&!reduced.matches){const content=next.querySelector<HTMLElement>('.case__sheet');if(content)modal=new Lenis({wrapper:next,content,autoRaf:true,lerp:0,duration:.7,easing,smoothWheel:true,stopInertiaOnNavigate:true});}}if(next)main?.stop();else main?.start();};
  const create=()=>{main?.destroy();modal?.destroy();main=undefined;modal=undefined;wrapper=null;if(!reduced.matches)main=new Lenis({autoRaf:true,lerp:0,duration:.7,easing,smoothWheel:true,stopInertiaOnNavigate:true,anchors:{offset:-35},prevent:node=>!!node.closest('.case,.fluid-select__options,[data-lenis-prevent]')});setupModal();};create();reduced.addEventListener('change',create);
  const observer=new MutationObserver(setupModal);observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  const caseScroll=(e:Event)=>{const target=(e as CustomEvent<HTMLElement>).detail;if(modal)modal.scrollTo(target,{offset:-155,duration:.7});else target?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});};window.addEventListener('case:scroll',caseScroll);
  document.documentElement.dataset.darkHover='sweep';document.documentElement.dataset.fillTempo='steady';
  const selector='button,a.button,.header nav a,.header__contact,.contact__telegram,.case__toc a,[role=option]';
  // Entry and exit each capture their own origin; movement inside leaves it fixed.
  const fillOrigin=(e:PointerEvent)=>{const owner=(e.target as Element).closest<HTMLElement>(selector);if(!owner||owner.closest('.filters')||(e.relatedTarget instanceof Node&&owner.contains(e.relatedTarget)))return;const rect=owner.getBoundingClientRect();if(!rect.width||!rect.height)return;const x=Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100)),y=Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100));owner.style.setProperty('--fill-x',`${x.toFixed(1)}%`);owner.style.setProperty('--fill-y',`${y.toFixed(1)}%`);owner.style.setProperty('--fill-duration','.7s');};document.addEventListener('pointerover',fillOrigin);document.addEventListener('pointerout',fillOrigin);
  const pressed=new WeakMap<HTMLElement,Animation>();
  const press=(target:EventTarget|null,clientX?:number,clientY?:number)=>{if(reduced.matches)return;const el=(target as Element)?.closest<HTMLElement>('button,a.button,.header__contact,.contact__telegram');if(!el||el.matches(':disabled'))return;pressed.get(el)?.cancel();const b=el.getBoundingClientRect();const x=clientX===undefined?50:Math.max(0,Math.min(100,(clientX-b.left)/b.width*100)),y=clientY===undefined?50:Math.max(0,Math.min(100,(clientY-b.top)/b.height*100));el.dataset.pressFeedback='true';el.style.setProperty('--press-x',`${x}%`);el.style.setProperty('--press-y',`${y}%`);const animation=el.animate([{clipPath:`circle(0% at ${x}% ${y}%)`,opacity:.18},{clipPath:`circle(150% at ${x}% ${y}%)`,opacity:0}],{duration:550,easing:'cubic-bezier(.2,.7,.3,1)',pseudoElement:'::after'});if(animation.effect instanceof KeyframeEffect&&animation.effect.pseudoElement==='::after'){pressed.set(el,animation);}else{animation.cancel();const original=getComputedStyle(el).boxShadow;pressed.set(el,el.animate([{boxShadow:original},{boxShadow:'inset 0 0 0 2px #80808055',offset:.25},{boxShadow:original}],{duration:400}));}};
  const down=(e:PointerEvent)=>press(e.target,e.clientX,e.clientY),key=(e:KeyboardEvent)=>{if(!e.repeat&&(e.key==='Enter'||e.key===' '))press(e.target);};document.addEventListener('pointerdown',down);document.addEventListener('keydown',key);
  const notify=(e:Event)=>setNotice((e as CustomEvent<string>).detail);window.addEventListener('fluid:notice',notify);
  return()=>{main?.destroy();modal?.destroy();observer.disconnect();reduced.removeEventListener('change',create);window.removeEventListener('case:scroll',caseScroll);window.removeEventListener('fluid:notice',notify);document.removeEventListener('pointerover',fillOrigin);document.removeEventListener('pointerout',fillOrigin);document.removeEventListener('pointerdown',down);document.removeEventListener('keydown',key);};
 },[]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(timer);},[notice]);
 return <div className={`fluid-toast ${notice?'is-visible':''}`} role="status" aria-live="polite">{notice&&<><Check size={18}/><span>{notice}</span><button aria-label="Закрыть уведомление" onClick={()=>setNotice('')}><X size={16}/></button></>}</div>;
}
import type { Project } from './data/projects';
import { asset, coverOf } from './data/projects';

export function BrandMark(){
 return <span className="wordmark__blob" aria-hidden="true"><BreathingInk small/></span>;
}

const briefKinds=['Разработать игру','Приложение или сервис','Сайт','Бот и автоматизация','Доработать готовый проект','Пока хочу обсудить'];
export function BriefWizard(){
 const [step,setStep]=useState(0),[kind,setKind]=useState(briefKinds[0]),[brief,setBrief]=useState(''),[contact,setContact]=useState(''),[error,setError]=useState(''),[sent,setSent]=useState(false);const heading=useRef<HTMLHeadingElement>(null);
 const advance=()=>{if(step===1&&brief.trim().length<10){setError('Добавьте подробностей — минимум 10 символов.');document.getElementById('brief')?.focus();return;}setError('');setStep(s=>Math.min(2,s+1));};
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(step<2){advance();return;}if(brief.trim().length<10){setStep(1);setError('Добавьте подробностей — минимум 10 символов.');return;}const text=`Привет! Хочу обсудить проект.\n\nЗадача: ${kind}\n${brief.trim()}${contact.trim()?`\n\nУже есть / детали связи: ${contact.trim()}`:''}`;window.open(`https://t.me/katt_dev?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');setSent(true);};
 return <form className="brief-form brief-wizard" noValidate onSubmit={submit}><div className="brief-progress" aria-label={`Шаг ${step+1} из 3`}>{['Задача','Подробности','Связь'].map((s,i)=><button type="button" key={s} aria-current={step===i?'step':undefined} disabled={i>step} onClick={()=>{setStep(i);setError('');}}>{s}</button>)}</div><h3 ref={heading} tabIndex={-1}>{['Что хотите создать?','Что важно в проекте?','Как продолжим?'][step]}</h3><div className="brief-wizard__screen" key={step}>
 {step===0&&<><label htmlFor="kind">Выберите направление</label><FluidSelect value={kind} onChange={setKind} options={briefKinds}/><p className="brief-help">Точное ТЗ не обязательно. Начнём с вашей идеи.</p></>}
 {step===1&&<><label htmlFor="brief">Задача, аудитория и что уже готово</label><textarea id="brief" value={brief} maxLength={2000} required minLength={10} aria-invalid={!!error} aria-describedby="brief-feedback" placeholder="Например: нужен бот для записи клиентов. Есть список услуг и пример интерфейса." onChange={e=>{setBrief(e.target.value);if(e.target.value.trim().length>=10)setError('');}}/><div id="brief-feedback" className={`brief-feedback ${error?'has-error':''}`} aria-live="polite"><span>{error||(brief.trim().length<10?`${brief.trim().length} / 10 символов минимум`:'Можно продолжать')}</span><span className="brief-meter"><i style={{width:`${Math.min(100,brief.trim().length*10)}%`}}/></span></div></>}
 {step===2&&<><div className="brief-summary"><strong>{kind}</strong><p>{brief}</p></div><label htmlFor="brief-contact">Дополнительные детали — по желанию</label><input id="brief-contact" value={contact} onChange={e=>setContact(e.target.value)} maxLength={300} placeholder="Ссылка на материалы, срок или контакт"/><p className="brief-help">Откроется личный чат в Telegram с готовым текстом. Сообщение отправляете вы.</p></>}
 </div><div className="brief-wizard__actions">{step>0&&<button className="brief-back" type="button" onClick={()=>{setStep(s=>s-1);setError('');}}>Назад</button>}<button className="button button--dark" type="submit"><span className="button__label">{step===2?'Подготовить сообщение в Telegram':'Продолжить'}</span></button></div><p role="status">{sent?'Проверьте подготовленный текст в Telegram и отправьте сообщение.':'Без регистрации. Вы управляете отправкой.'}</p>
 <div className="brief-faq"><FluidDetails title="Что с исходниками?"><p>Передаю исходники и поясняю запуск проекта в рамках согласованного объёма работы.</p></FluidDetails><FluidDetails title="Используете ИИ?"><p>Да, для ускорения разработки. Архитектуру и код контролирую сам. По запросу работаю полностью вручную.</p></FluidDetails><FluidDetails title="Можно доработать чужой проект?"><p>Да. Сначала изучу код и задачу, затем предложу объём доработки.</p></FluidDetails></div></form>;
}

export function CaseInspector({project}:{project:Project}){
 const [active,setActive]=useState(0);const systems=project.systems;if(!systems.length)return null;const system=systems[active],image=coverOf(project);
 return <section id="case-implementation" className={`case-inspector inspector--${project.id}`}><div className="case-inspector__heading"><h4>Как это работает</h4><p>Выберите систему — покажу задачу и решение.</p></div><div className="case-inspector__scene">{image&&<img src={asset(image.src)} alt={image.alt} loading="lazy" width={image.width} height={image.height}/>}<div className="inspector-controls" role="group" aria-label="Системы проекта">{systems.map((s,i)=><button key={s.title} aria-pressed={active===i} onClick={()=>setActive(i)}><span className="control__label">{s.title}</span></button>)}</div></div><article className="case-inspector__answer" key={active}><strong>{system.title}</strong><p>{system.task}</p><p>{system.approach}</p><span><Check size={17}/>{system.result}</span></article></section>;
}
