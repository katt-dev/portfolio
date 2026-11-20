import { useEffect, useLayoutEffect, useState } from 'react';
import { BriefcaseBusiness, Code2, UserRound, MessageCircle, Menu, X } from 'lucide-react';
import { BrandMark } from './FluidUI';

export function Navigation(){
 const [side,setSide]=useState(()=>matchMedia('(min-width: 1200px)').matches),[open,setOpen]=useState(false),[active,setActive]=useState('');
 useLayoutEffect(()=>{document.documentElement.dataset.nav=side?'side':'top';return()=>{delete document.documentElement.dataset.nav;};},[side]);
 useEffect(()=>{const width=matchMedia('(min-width: 1200px)'),update=()=>{setSide(width.matches);setOpen(false);};width.addEventListener('change',update);return()=>width.removeEventListener('change',update);},[]);
 useEffect(()=>{const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])setActive(visible[0].target.id);},{rootMargin:'-15% 0px -55% 0px',threshold:0});document.querySelectorAll('#work,#about,#expertise').forEach(e=>observer.observe(e));return()=>observer.disconnect();},[]);
 const links=[{id:'work',title:'Проекты',icon:BriefcaseBusiness},{id:'about',title:'Обо мне',icon:UserRound},{id:'expertise',title:'Услуги',icon:Code2}];
 return <><div className="header-space"/><header className={`header ${side?'header--side':''} ${open?'header--expanded':''}`}><a href="#main" className="wordmark" aria-label="katt — на главную"><BrandMark/>katt</a><nav className={open?'is-open':''} aria-label="Основная навигация">{links.map(l=><a href={`#${l.id}`} key={l.id} aria-current={active===l.id?'location':undefined} onClick={()=>setOpen(false)}><l.icon size={17}/><span>{l.title}</span></a>)}</nav><a className="header__contact" href="#contact" onClick={()=>setOpen(false)}><MessageCircle size={17}/><span className="header__contact-label">Обсудить проект</span></a><button className="menu-toggle icon-button" aria-label={open?'Закрыть меню':'Открыть меню'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></header></>;
}
