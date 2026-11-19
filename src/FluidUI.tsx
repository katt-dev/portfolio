import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import Lenis from 'lenis';
import { flushSync } from 'react-dom';

export function fluidRoute(action:()=>void){
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.startViewTransition(()=>flushSync(action));}else action();
}

export function FluidSelect({value,onChange,options}:{value:string;onChange:(s:string)=>void;options:string[]}){
 const [open,setOpen]=useState(false);const [active,setActive]=useState(0);const root=useRef<HTMLDivElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 const choose=(n:number)=>{onChange(options[n]);setOpen(false);trigger.current?.focus();};
 return <div className={`fluid-select ${open?'is-open':''}`} ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}}>
 <button ref={trigger} id="kind" className="fluid-select__trigger" type="button" role="combobox" aria-controls="kind-options" aria-expanded={open} aria-haspopup="listbox" aria-activedescendant={open?`kind-${active}`:undefined} onClick={()=>{setActive(Math.max(0,options.indexOf(value)));setOpen(!open);}} onKeyDown={e=>{if(['ArrowDown','ArrowUp','Home','End','Escape','Enter',' '].includes(e.key)){e.preventDefault();if(e.key==='Escape'){setOpen(false);return;}if(e.key==='Enter'||e.key===' '){if(open)choose(active);else setOpen(true);return;}setOpen(true);setActive(n=>e.key==='Home'?0:e.key==='End'?options.length-1:(n+(e.key==='ArrowDown'?1:-1)+options.length)%options.length);}}}><span>{value}</span><ChevronDown size={18}/></button>
 {open&&<div className="fluid-select__options" role="listbox" id="kind-options" aria-label="Тип проекта">{options.map((o,i)=><div id={`kind-${i}`} key={o} role="option" aria-selected={value===o} className={active===i?'is-active':''} onPointerMove={()=>setActive(i)} onPointerDown={e=>e.preventDefault()} onClick={()=>choose(i)}><span>{o}</span>{value===o&&<Check size={16}/>}</div>)}</div>}
 </div>;
}

export function FluidHint({label,text}:{label:string;text:string}){
 const [open,setOpen]=useState(false);const id=useRef(`hint-${Math.random().toString(36).slice(2)}`);
 return <span className={`fluid-hint ${open?'is-open':''}`} onPointerEnter={()=>setOpen(true)} onPointerLeave={()=>setOpen(false)}><button type="button" aria-expanded={open} aria-describedby={open?id.current:undefined} onFocus={()=>setOpen(true)} onBlur={()=>setOpen(false)} onClick={()=>setOpen(!open)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}>{label}<i>?</i></button><span role="tooltip" id={id.current} hidden={!open}>{text}</span></span>;
}

export function FluidDetails({title,children}:{title:string;children:React.ReactNode}){
 const [open,setOpen]=useState(false);const id=useRef(`detail-${Math.random().toString(36).slice(2)}`);
 return <div className={`fluid-details ${open?'is-open':''}`}><button type="button" aria-expanded={open} aria-controls={id.current} onClick={()=>setOpen(!open)}>{title}<span>{open?'−':'+'}</span></button><div className="fluid-details__body" id={id.current} inert={!open}><div>{children}</div></div></div>;
}

export function FluidInterface(){
 const [progress,setProgress]=useState(0),[notice,setNotice]=useState('');const rail=useRef<HTMLDivElement>(null);const scroller=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let lenis:Lenis|undefined;
  const create=()=>{lenis?.destroy();lenis=undefined;if(!reduced.matches)lenis=new Lenis({autoRaf:true,lerp:.09,smoothWheel:true,anchors:{offset:-35},prevent:node=>!!node.closest('.case,.fluid-select__options,[data-lenis-prevent]')});};create();reduced.addEventListener('change',create);
  const scroll=()=>{const modal=document.querySelector<HTMLElement>('dialog[open]');scroller.current=modal??document.scrollingElement as HTMLElement;const el=scroller.current;setProgress(el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight));};
  document.addEventListener('scroll',scroll,true);window.addEventListener('resize',scroll);const mo=new MutationObserver(()=>{if(document.body.classList.contains('case-is-open'))lenis?.stop();else lenis?.start();scroll();});mo.observe(document.body,{attributes:true,attributeFilter:['class']});scroll();
  const pointer=(e:PointerEvent)=>{const el=(e.target as Element).closest<HTMLElement>('.button,.icon-button,.fluid-select__trigger,.project-card__visual,.fluid-details>button');if(el){const b=el.getBoundingClientRect();el.style.setProperty('--hx',`${e.clientX-b.left}px`);el.style.setProperty('--hy',`${e.clientY-b.top}px`);}};
  const down=(e:PointerEvent)=>{const el=(e.target as Element).closest<HTMLElement>('button,.button');if(!el)return;const b=el.getBoundingClientRect();const drop=document.createElement('i');drop.className='ink-ripple';drop.style.left=`${e.clientX-b.left}px`;drop.style.top=`${e.clientY-b.top}px`;el.appendChild(drop);drop.addEventListener('animationend',()=>drop.remove(),{once:true});};
  const notify=(e:Event)=>{setNotice((e as CustomEvent<string>).detail);};window.addEventListener('fluid:notice',notify);document.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('pointerdown',down);
  return()=>{lenis?.destroy();mo.disconnect();reduced.removeEventListener('change',create);document.removeEventListener('scroll',scroll,true);window.removeEventListener('resize',scroll);document.removeEventListener('pointermove',pointer);document.removeEventListener('pointerdown',down);window.removeEventListener('fluid:notice',notify);};
 },[]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(t);},[notice]);
 const seek=(y:number)=>{const box=rail.current?.getBoundingClientRect(),el=scroller.current;if(!box||!el)return;const n=Math.max(0,Math.min(1,(y-box.top)/box.height));el.scrollTo({top:n*(el.scrollHeight-el.clientHeight),behavior:'instant'});};
 return <><svg width="0" height="0" className="fluid-defs" aria-hidden="true"><defs><filter id="ink-goo" x="-30%" y="-60%" width="160%" height="220%" colorInterpolationFilters="sRGB"><feGaussianBlur in="SourceGraphic" stdDeviation="5"/><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></defs></svg><div ref={rail} className="fluid-scroll" role="scrollbar" tabIndex={0} aria-label="Прокрутка страницы" aria-controls="root" aria-valuenow={Math.round(progress*100)} aria-valuemin={0} aria-valuemax={100} aria-orientation="vertical" onKeyDown={e=>{const el=scroller.current;if(!el)return;if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key)){e.preventDefault();el.scrollBy({top:e.key==='Home'?-el.scrollHeight:e.key==='End'?el.scrollHeight:(e.key.includes('Up')?-1:1)*(e.key.startsWith('Page')?innerHeight*.8:80),behavior:'smooth'});}}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);seek(e.clientY);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))seek(e.clientY);}}><span style={{top:`${progress*88}%`}}/></div>
 <div className={`fluid-toast ${notice?'is-visible':''}`} role="status" aria-live="polite">{notice&&<><Check size={18}/><span>{notice}</span><button aria-label="Закрыть уведомление" onClick={()=>setNotice('')}><X size={16}/></button></>}</div></>;
}
import type { Project } from './data/projects';
import { asset, coverOf } from './data/projects';

export function BrandMark(){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;let animation:Animation|undefined;let stopped=false,angle=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const spin=()=>{if(stopped||reduced.matches)return;const next=angle+(Math.random()>.45?1:-1)*(100+Math.random()*300);animation=el.animate([{transform:`rotate(${angle}deg)`},{transform:`rotate(${next}deg)`}],{duration:3500+Math.random()*3500,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});angle=next;animation.onfinish=spin;};
 const change=()=>{animation?.cancel();if(!reduced.matches)spin();};spin();reduced.addEventListener('change',change);return()=>{stopped=true;animation?.cancel();reduced.removeEventListener('change',change);};},[]);
 return <span ref={ref} className="wordmark__blob" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M31 5C40 3 43 14 51 17C62 22 62 33 55 40C50 45 54 56 43 59C32 63 30 54 22 54C11 55 6 47 10 37C13 29 1 24 9 14C15 6 23 10 31 5Z"/></svg></span>;
}

export function HeroDemo(){
 const [mode,setMode]=useState(0),[score,setScore]=useState(0);
 const titles=['Игра','Сервис','Автоматизация'];
 return <div className="hero-demo" data-lenis-prevent><span className="eyebrow">Попробуйте интерфейс</span><div className="hero-demo__tabs" role="group" aria-label="Демонстрация интерфейса">{titles.map((t,i)=><button key={t} aria-pressed={mode===i} onClick={()=>{setMode(i);setScore(0);}}>{t}</button>)}</div><div className={`hero-demo__stage demo-mode-${mode}`}><span className="demo-link link-a"/><span className="demo-link link-b"/><button className="demo-node node-a" aria-label={mode===0?'Собрать ресурс':mode===1?'Создать подписку':'Добавить задачу'} onClick={()=>setScore(n=>n+1)}>{mode===0?'Ресурс':mode===1?'Подписка':'Задача'}</button><span className="demo-node node-b">{mode===0?'Инвентарь':mode===1?'Оплата':'Обработка'}</span><span className={`demo-node node-c ${score?'has-score':''}`}>{score?`${score} ${mode===0?'собрано':mode===1?'готово':'выполнено'}`:'Результат'}</span>{score>0&&<i key={score} className="demo-packet"/>}</div><p>Нажмите «{mode===0?'Ресурс':mode===1?'Подписка':'Задача'}» — действие пройдёт по всей цепочке.</p><small>Интерактивная схема, не экран готового приложения.</small></div>;
}

const briefKinds=['Разработать игру','Приложение или сервис','Сайт','Бот и автоматизация','Доработать готовый проект','Пока хочу обсудить'];
export function BriefWizard(){
 const [step,setStep]=useState(0),[kind,setKind]=useState(briefKinds[0]),[brief,setBrief]=useState(''),[contact,setContact]=useState(''),[error,setError]=useState(''),[sent,setSent]=useState(false);const heading=useRef<HTMLHeadingElement>(null);
 const advance=()=>{if(step===1&&brief.trim().length<10){setError('Добавьте подробностей — минимум 10 символов.');document.getElementById('brief')?.focus();return;}setError('');setStep(s=>Math.min(2,s+1));};
 const submit=(e:React.FormEvent)=>{e.preventDefault();if(step<2){advance();return;}if(brief.trim().length<10){setStep(1);setError('Добавьте подробностей — минимум 10 символов.');return;}const text=`Привет! Хочу обсудить проект.\n\nЗадача: ${kind}\n${brief.trim()}${contact.trim()?`\n\nУже есть / детали связи: ${contact.trim()}`:''}`;window.open(`https://t.me/katt_dev?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');setSent(true);};
 return <form className="brief-form brief-wizard" noValidate onSubmit={submit}><div className="brief-progress" aria-label={`Шаг ${step+1} из 3`}>{['Задача','Подробности','Связь'].map((s,i)=><button type="button" key={s} aria-current={step===i?'step':undefined} disabled={i>step} onClick={()=>{setStep(i);setError('');}}><i/>{s}</button>)}</div><h3 ref={heading} tabIndex={-1}>{['Что хотите создать?','Что важно в проекте?','Как продолжим?'][step]}</h3><div className="brief-wizard__screen" key={step}>
 {step===0&&<><label htmlFor="kind">Выберите направление</label><FluidSelect value={kind} onChange={setKind} options={briefKinds}/><p className="brief-help">Точное ТЗ не обязательно. Начнём с вашей идеи.</p></>}
 {step===1&&<><label htmlFor="brief">Задача, аудитория и что уже готово</label><textarea id="brief" value={brief} maxLength={2000} required minLength={10} aria-invalid={!!error} aria-describedby="brief-feedback" placeholder="Например: нужен бот для записи клиентов. Есть список услуг и пример интерфейса." onChange={e=>{setBrief(e.target.value);if(e.target.value.trim().length>=10)setError('');}}/><div id="brief-feedback" className={`brief-feedback ${error?'has-error':''}`} aria-live="polite"><span>{error||(brief.trim().length<10?`${brief.trim().length} / 10 символов минимум`:'Можно продолжать')}</span><span className="brief-meter"><i style={{width:`${Math.min(100,brief.trim().length*10)}%`}}/></span></div></>}
 {step===2&&<><div className="brief-summary"><strong>{kind}</strong><p>{brief}</p></div><label htmlFor="brief-contact">Дополнительные детали — по желанию</label><input id="brief-contact" value={contact} onChange={e=>setContact(e.target.value)} maxLength={300} placeholder="Ссылка на материалы, срок или контакт"/><p className="brief-help">Откроется личный чат в Telegram с готовым текстом. Сообщение отправляете вы.</p></>}
 </div><div className="brief-wizard__actions">{step>0&&<button className="brief-back" type="button" onClick={()=>{setStep(s=>s-1);setError('');}}>Назад</button>}<button className="button button--dark" type="submit">{step===2?'Подготовить сообщение в Telegram':'Продолжить'}</button></div><p role="status">{sent?'Проверьте подготовленный текст в Telegram и отправьте сообщение.':'Без регистрации. Вы управляете отправкой.'}</p>
 <div className="brief-faq"><FluidDetails title="Что с исходниками?"><p>Передаю исходники и поясняю запуск проекта в рамках согласованного объёма работы.</p></FluidDetails><FluidDetails title="Используете ИИ?"><p>Да, для ускорения разработки. Архитектуру и код контролирую сам. По запросу работаю полностью вручную.</p></FluidDetails><FluidDetails title="Можно доработать чужой проект?"><p>Да. Сначала изучу код и задачу, затем предложу объём доработки.</p></FluidDetails></div></form>;
}

export function CaseInspector({project}:{project:Project}){
 const [active,setActive]=useState(0);const systems=project.systems;if(!systems.length)return null;const system=systems[active],image=coverOf(project);
 return <section id="case-implementation" className={`case-inspector inspector--${project.id}`}><div className="case-inspector__heading"><h4>Как это работает</h4><p>Выберите систему — покажу задачу и решение.</p></div><div className="case-inspector__scene">{image&&<img src={asset(image.src)} alt={image.alt} loading="lazy" width={image.width} height={image.height}/>}<div className="inspector-controls" role="group" aria-label="Системы проекта">{systems.map((s,i)=><button key={s.title} aria-pressed={active===i} onClick={()=>setActive(i)}><span className="inspector-dot"/>{s.title}</button>)}</div></div><article className="case-inspector__answer" key={active}><strong>{system.title}</strong><p>{system.task}</p><p>{system.approach}</p><span><Check size={17}/>{system.result}</span></article></section>;
}
