import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Flip } from 'gsap/Flip';
import { gsap } from 'gsap';
import { BriefcaseBusiness, Code2, UserRound, MessageCircle, Menu, X } from 'lucide-react';
import { BrandMark } from './FluidUI';
gsap.registerPlugin(Flip);

export function Navigation(){
 const [docked,setDocked]=useState(false),[open,setOpen]=useState(false);const current=useRef(false);const animation=useRef<gsap.core.Timeline|null>(null);
 useEffect(()=>{let frame=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const update=()=>{frame=0;const next=innerWidth>=1200&&scrollY>260;if(next===current.current)return;animation.current?.kill();const state=Flip.getState('.header,.header .wordmark,.header nav,.header nav a,.header__contact');current.current=next;flushSync(()=>setDocked(next));document.documentElement.dataset.nav=next?'side':'top';if(!reduced.matches)animation.current=Flip.from(state,{duration:.85,ease:'power3.inOut',nested:true,prune:true});};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);schedule();return()=>{cancelAnimationFrame(frame);animation.current?.kill();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);delete document.documentElement.dataset.nav;};},[]);
 const links=[{id:'work',title:'Проекты',icon:BriefcaseBusiness},{id:'about',title:'Обо мне',icon:UserRound},{id:'expertise',title:'Услуги',icon:Code2}];
 return <><div className="header-space"/><header className={`header ${docked?'header--side':''} ${open?'header--expanded':''}`}><a href="#main" className="wordmark" aria-label="katt — на главную"><BrandMark/>katt</a><nav className={open?'is-open':''} aria-label="Основная навигация">{links.map(l=><a href={`#${l.id}`} key={l.id} onClick={()=>setOpen(false)}><l.icon size={17}/><span>{l.title}</span></a>)}</nav><a className="header__contact" href="#contact" onClick={()=>setOpen(false)}><MessageCircle size={17}/><span className="header__contact-label">Обсудить проект</span></a><button className="menu-toggle icon-button" aria-label={open?'Закрыть меню':'Открыть меню'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header></>;
}
