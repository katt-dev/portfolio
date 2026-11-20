import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Plus, X, Gamepad2, Globe2, Code2, MousePointer2, FolderOpen, ShieldCheck, PackageCheck, LayoutGrid } from 'lucide-react';
import { Navigation } from './Navigation';
import { projects, site, asset, coverOf, getProject } from './data/projects';
import type { Project } from './data/projects';
import { openProject, useRoute } from './lib/router';
import { Mascot } from './Mascot';
import { FluidDetails, FluidHint, FluidInterface, BriefWizard, CaseInspector, BrandMark, fluidRoute } from './FluidUI';

const ping = () => window.dispatchEvent(new Event('substance:react'));
const tagNames: Record<string,string> = { 'Gameplay Programming':'Игровые механики','Netcode':'Мультиплеер','UI':'Интерфейс','Systems Design':'Игровые системы','Combat':'Боевая система','Telegram Bot':'Telegram-бот','Infrastructure':'Инфраструктура','AI':'Поведение противников','Audio Systems':'Звуковые системы','Platform Integration':'Интеграция платформы','Tools':'Инструменты','Prototyping':'Прототипирование' };

function VpnVisual() {
  return <div className="freeward-cover"><span className="freeward-cover__category">МОЙ ПРОДУКТ · FREEWARD VPN</span><div className="freeward-cover__mascot"><Mascot compact/></div><div className="freeward-cover__identity"><img decoding="async" src={asset('media/projects/freeward/logo.svg')} alt=""/><strong>Freeward VPN</strong></div><div className="vpn-route"><span>Устройство</span><i/><span className="vpn-route__core">VPN</span><i/><span>Сервер</span></div><span className="freeward-cover__stack">Полностью мой продукт · Разработка и развитие</span></div>;
}

// Reconstructed directly from MainMenuView.cs and UiKit.cs. Background is a frame from the game's menu video.
function ColosseumMenu(){
 return <div className="col-menu" role="img" aria-label="Главное меню Colosseum, воссозданное по исходному интерфейсу"><img src={asset('media/projects/colosseum/menu-background.jpg')} alt="" loading="lazy" decoding="async"/><span className="col-menu__shade"/><span className="col-menu__ring ring-one"/><span className="col-menu__ring ring-two"/><strong>COLOSSEUM</strong><i className="col-menu__rule"/><small>PLANETFALL — VERTICAL SLICE 1.0</small><div className="col-menu__buttons">{['DEPLOY','MULTIPLAYER','ARMOURY','SETTINGS','QUIT'].map(t=><span key={t}>{t}</span>)}</div><span className="col-menu__footer">PROTOTYPE BUILD · SOLO OR SQUAD OF 4</span><span className="col-menu__hint">ENTER — DEPLOY</span></div>;
}

function ProjectVisual({ project, detail=false }: {project:Project;detail?:boolean}) {
  const cover=coverOf(project);
  if(project.id==='freeward')return <VpnVisual/>;
  if(project.id==='colosseum')return <ColosseumMenu/>;
  return <><img decoding="async" src={asset(cover?.src??'')} alt={cover?.alt??project.title} loading={detail?'eager':'lazy'} width={cover?.width} height={cover?.height}/>{project.id==='piworld'&&<><img decoding="async" className="project-logo" src={asset('media/projects/piworld/logo.png')} alt=""/><span className="piworld-sparks" aria-hidden="true"><i/><i/><i/></span></>}{project.id==='colosseum'&&<div className="colosseum-lockup"><span>ВЫЖИВИ НА АРЕНЕ</span><strong>COLOSSEUM</strong></div>}{project.id==='hookfold-bay'&&<><span className="hookfold-label">Hookfold Bay</span><span className="fishing-line"><i/></span><span className="water-ring"/></>}{project.id==='build-the-pyramid'&&<div className="pyramid-blocks" aria-hidden="true">{Array.from({length:6},(_,i)=><i key={i}/>)}</div>}{project.id==='colosseum'&&<div className="arena-frame" aria-hidden="true"><i/><i/><i/><i/></div>}</>;
}

function ProjectCard({p,index}:{p:Project;index:number}) {
  const ref=useRef<HTMLButtonElement>(null);
  return <button ref={ref} className={`project-card project-card--${p.id}`} data-reveal style={{'--delay':`${index%2*.08}s`} as React.CSSProperties} onClick={e=>{ping();const cover=e.currentTarget.querySelector<HTMLElement>('.project-card__visual');if(cover)cover.style.viewTransitionName=`cover-${p.id}`;fluidRoute(()=>openProject(p.id));}}>
    <div className="project-card__visual" style={{viewTransitionName:'none'}}><ProjectVisual project={p}/><div className="project-role"><span>{p.id==='freeward'?'Собственный продукт':'Моя работа'}</span><strong>{projectRoles[p.id]??p.role}</strong></div></div>
    <div className="project-card__info"><div><span className="project-card__genre">{p.genre}</span><h3>{p.title}</h3></div><span className="project-card__status">{p.status}</span></div><div className="project-card__deliverables">{(projectRoles[p.id]??p.role).split(' · ').map(t=><span key={t}><Check size={14}/>{t}</span>)}</div>
  </button>;
}

function Case({id}:{id:string}) {
  const project=getProject(id); const dialog=useRef<HTMLDialogElement>(null);const [activeImage,setActiveImage]=useState(0);
  useLayoutEffect(()=>{const d=dialog.current;if(!d)return;d.showModal();document.body.classList.add('case-is-open');setActiveImage(0);return()=>{d.close();document.body.classList.remove('case-is-open');};},[id]);
  const close=()=>fluidRoute(()=>openProject(null));
  if(!project)return <dialog ref={dialog} className="case" onCancel={close}><button onClick={close}>Закрыть</button><h2>Проект не найден</h2></dialog>;
  return <dialog ref={dialog} className={`case case--${project.id}`} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}} aria-label={project.title}>
    <div className="case__sheet"><div className="case__nav"><a href="#contact" onClick={e=>{e.preventDefault();close();setTimeout(()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}),50);}}>Обсудить похожий проект</a><button onClick={close} className="icon-button" aria-label="Закрыть проект"><X/></button></div>
      <nav className="case__toc" aria-label="Разделы проекта">{[['result','Результат'],['decisions','Решения'],['implementation','Моя работа'],['gallery','Галерея']].filter(([section])=>section!=='gallery'||project.media.length>1).map(([section,label])=><a key={section} href={`#case-${section}`} onClick={e=>{e.preventDefault();const target=document.getElementById(`case-${section}`);if(target)window.dispatchEvent(new CustomEvent('case:scroll',{detail:target}));}}>{label}</a>)}</nav><div className="case__intro" id="case-result"><span className="eyebrow">{project.genre} · {project.year}</span><h2>{project.title}</h2><p>{project.tagline}</p><div className="case__facts"><span><small>Моя роль</small>{project.role}</span><span><small>Технологии</small>{project.engine}</span><span><small>Состояние</small>{project.status}</span></div></div>
      <div className="case__cover" style={{viewTransitionName:`cover-${project.id}`}}><ProjectVisual project={project} detail/></div>{project.id==='colosseum'&&<p className="case__cover-caption">Главное меню — воссоздано по исходному интерфейсу игры.</p>}
      <div className="case__story" id="case-decisions">{project.id==='freeward'&&<div className="ownership-note"><strong>Мой собственный продукт</strong><p>Freeward VPN полностью принадлежит мне. Сам разрабатываю сервис, управляю им и отвечаю за его развитие.</p></div>}<h3>Что за проект</h3><p>{project.overview}</p><FluidDetails title="Технологии и моя работа"><dl className="case-tech"><div><dt>Технологии</dt><dd>{project.engine}</dd></div><div><dt>Моя роль</dt><dd>{project.role}</dd></div></dl><div className="tag-list">{project.contribution.map(c=><span key={c}>{tagNames[c]??c}</span>)}</div></FluidDetails><CaseInspector project={project}/></div>


      {project.media.length>1&&<section id="case-gallery" className="case__gallery"><h3>Посмотреть ближе.</h3><img decoding="async" style={{viewTransitionName:'gallery-image'}} className="case__gallery-main" src={asset(project.media[activeImage]?.src)} alt={project.media[activeImage]?.alt}/><p>{project.media[activeImage]?.alt}</p><div>{project.media.map((m,i)=><button key={m.src} aria-label={m.alt} aria-pressed={activeImage===i} onClick={()=>fluidRoute(()=>setActiveImage(i))}><img decoding="async" src={asset(m.thumb)} alt="" loading="lazy"/></button>)}</div></section>}
      {project.links.length>0&&<div className="case__links">{project.links.map(l=><a key={l.url} className="button button--dark" href={l.url} target="_blank" rel="noopener noreferrer"><span className="button__label">{l.label}</span><ExternalLink size={17}/></a>)}</div>}
      <div className="case__footer"><h3>Сделаем что-то своё?</h3><a className="button button--dark" href={`https://t.me/katt_dev?text=${encodeURIComponent(`Привет! Посмотрел проект «${project.title}» в портфолио. Хочу обсудить похожую задачу.`)}`} target="_blank" rel="noopener noreferrer"><span className="button__label">Хочу похожий проект</span></a><button className="text-button" onClick={close}>Вернуться к проектам</button></div>
    </div>
  </dialog>;
}

const projectRoles:Record<string,string>={'piworld':'Игровые системы · Мультиплеер','colosseum':'Полная разработка игры · Игровые системы','freeward':'Владелец · Разработчик','build-the-pyramid':'Полная разработка игры · Интерфейс','hookfold-bay':'Полная разработка игры · Игровые системы'};

const techHints:Record<string,string>={'Golang':'Язык для серверной логики, API и сервисов. Использую в Freeward VPN.','Netcode':'Сетевая логика: обмен состоянием игры между игроками и сервером.','UI / UX':'Структура экранов, удобство действий и визуальная обратная связь.','WebGL':'Запуск игры прямо в браузере, без установки.','Backend':'Серверная часть: данные, платежи, подписки и интеграции.'};

const services=[
 {title:'Разработать игру',text:'Прототип, игровой цикл, прогрессия и подготовка к платформе. Для ПК, мобильных устройств и WebGL.',icon:Gamepad2,tags:['Unity','Godot','WebGL'],proof:'build-the-pyramid'},
 {title:'Доработать игровые механики',text:'Боевая система, управление персонажем, противники и мультиплеер.',icon:MousePointer2,tags:['Gameplay','AI','Netcode'],proof:'colosseum'},
 {title:'Запустить приложение или сервис',text:'Приложения, сайты и боты: понятный интерфейс и рабочая серверная логика.',icon:Globe2,tags:['UI / UX','Golang','Telegram'],proof:'freeward'},
 {title:'Автоматизировать работу',text:'API, оплата, подписки и интеграции — вместо ручной работы.',icon:Code2,tags:['Golang','Python','Backend'],proof:'freeward'},
];

export default function App(){
 const route=useRoute(); const [filter,setFilter]=useState('Все проекты'),[service,setService]=useState(0),[copied,setCopied]=useState(false);

 const filterRef=useRef<HTMLDivElement>(null);const [filterInk,setFilterInk]=useState({left:0,width:0});
 useEffect(()=>{const root=filterRef.current;if(!root)return;const update=()=>{const selected=root.querySelector<HTMLElement>('[aria-pressed=true]');if(selected)setFilterInk({left:selected.offsetLeft,width:selected.offsetWidth});};const resize=new ResizeObserver(update);resize.observe(root);update();return()=>resize.disconnect();},[filter]);
 const list=projects.filter(p=>!p.id.toLowerCase().includes('doom')&&(filter==='Все проекты'||(filter==='Игры'?p.id!=='freeward':p.id==='freeward')));
 useEffect(()=>{
  document.documentElement.dataset.theme='light';document.documentElement.classList.add('redesigned');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08});
  const observe=()=>document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(e=>observer.observe(e));observe();
  const mo=new MutationObserver(observe);mo.observe(document.getElementById('root')!,{childList:true,subtree:true});
  let cancelled=false;const animations:Animation[]=[];
  document.fonts.ready.then(()=>{if(cancelled)return;const hero=document.querySelector<HTMLElement>('.hero__copy');if(!reduced.matches)document.querySelectorAll<HTMLElement>('.intro-line').forEach((el,i)=>animations.push(el.animate([{opacity:0},{opacity:1}],{duration:850,delay:i*80,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'})));if(hero)hero.dataset.intro='ready';});
  return()=>{cancelled=true;animations.forEach(a=>a.cancel());observer.disconnect();mo.disconnect();};
 },[]);
 const copyEmail=async()=>{try{await navigator.clipboard.writeText(site.email);setCopied(true);window.dispatchEvent(new CustomEvent('fluid:notice',{detail:'Почта скопирована'}));ping();setTimeout(()=>setCopied(false),2500);}catch{location.href=`mailto:${site.email}`;}};
 return <>
  <a className="skip-link" href="#main">К содержанию</a>
  <Navigation/>
  <main id="main">
   <section className="hero wrap"><div className="hero__copy" data-intro="pending"><span className="eyebrow intro-line">Разработчик цифровых продуктов</span><h1><span className="intro-line">Создаю игры,</span><span className="intro-line">приложения</span><span className="hero__outline intro-line">и сервисы<span className="hero__period">.</span></span></h1><p className="hero__lead intro-line">От прототипа до запуска. Быстрая разработка с ИИ — с моей проверкой кода и ответственностью за результат.</p><div className="hero__actions intro-line"><a className="button button--dark" href="#contact" onMouseEnter={ping}><span className="button__label">Обсудить вашу идею</span></a><a className="button button--plain" href="#work"><FolderOpen size={18}/>Мои проекты</a></div><div className="hero__availability intro-line"><span className="availability-dot"/>{site.availableLabel}<span className="hero__name">katt / independent developer</span></div></div><div className="hero__stage"><Mascot/><div className="hero__stage-footer"><span>Игры. Приложения. Сервисы.<br/>От прототипа до рабочей версии.</span><span className="hero__cross">✳</span></div></div></section>
   <div className="craft-strip wrap"><span>От механики<br/> до целого продукта</span><div>Unity <i/> C# <i/> Golang <i/> Python <i/> UI / UX</div><Code2 size={26}/></div>
   <section id="work" className="work wrap section-space"><div className="section-head" data-reveal><div><span className="eyebrow">Идеи, воплощённые в коде</span><h2>Мои проекты<span>.</span></h2></div></div><div ref={filterRef} className="filters" role="group" aria-label="Фильтр проектов"><span className="filter-ink" style={{left:filterInk.left,width:filterInk.width}}/>{['Все проекты','Игры','Сервисы'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>{setFilter(f);ping();}}><span className="filter__label">{f}</span>{filter===f&&<span className="filter__count">{list.length}</span>}</button>)}</div><div className="project-grid">{list.map((p,i)=><ProjectCard key={p.id} p={p} index={i}/>)}</div></section>
   <section id="about" className="about wrap section-space"><div className="skill-visual" data-reveal><span className="eyebrow">Разные задачи. Реальные проекты.</span>{[{id:'piworld',icon:Gamepad2,title:'Игровые системы',name:'Piworld',tags:'Unity · C# · Сеть'},{id:'freeward',icon:Globe2,title:'Сервисы и серверы',name:'Freeward VPN',tags:'Golang · Оплата · Подписки'},{id:'build-the-pyramid',icon:LayoutGrid,title:'Интерфейсы',name:'Build the Pyramid!',tags:'UI · Web · Игровая логика'}].map(p=><button key={p.id} onClick={()=>fluidRoute(()=>openProject(p.id))}><span className="skill-visual__icon"><p.icon size={25}/></span><span><small>{p.title}</small><strong>{p.name}</strong><em>{p.tags}</em></span><Plus size={17}/></button>)}</div><div className="about__copy" data-reveal><span className="eyebrow">Привет. Я katt.</span><h2>Пишу код.<br/>Отвечаю за результат.</h2><p>Пишу на C#, Golang и Python. Создаю понятные интерфейсы и системы, которые удобно развивать.</p><div className="owner-values"><span><Code2 size={20}/>Разбираюсь в коде</span><span><ShieldCheck size={20}/>Проверяю решения</span><span><PackageCheck size={20}/>Передаю исходники</span></div><div className="stack-note"><Code2 size={21}/><p><strong>Есть требования к языку или стеку?</strong>Освою нужные инструменты под задачу, проверю подход на прототипе и согласую сроки.</p></div></div></section>
   <section id="expertise" className="expertise section-space"><div className="wrap"><div className="section-head" data-reveal><div><span className="eyebrow">От вашей задачи — к конкретному результату</span><h2>Что можем сделать.</h2></div><p>Подключаюсь к команде<br/>или беру разработку целиком.</p></div><div className="expertise__layout"><div className="service-tabs">{services.map((s,i)=><button className={service===i?'is-active':''} key={s.title} onClick={()=>{setService(i);ping();}} aria-expanded={service===i}><s.icon size={24}/><span>{s.title}</span><Plus size={20}/></button>)}</div><article key={service} className="service-detail"><div className="service-detail__icon">{(()=>{const Icon=services[service].icon;return <Icon size={44}/>;})()}</div><h3>{services[service].title}</h3><p>{services[service].text}</p><div className="tag-list">{services[service].tags.map(t=>techHints[t]?<FluidHint key={t} label={t} text={techHints[t]}/>:<span key={t}>{t}</span>)}</div><button className="text-button" onClick={()=>fluidRoute(()=>openProject(services[service].proof))}>Посмотреть на примере проекта <Plus size={18}/></button></article></div></div></section>
   <section id="contact" className="contact section-space"><div className="wrap contact__layout"><div data-reveal><span className="eyebrow">Хорошие проекты начинаются с разговора</span><h2>Превратим идею<br/>в продукт<span>.</span></h2><p>Опишите задачу своими словами.<br/>Помогу определить функции и первый шаг.</p><a className="contact__telegram" href="https://t.me/katt_dev" target="_blank" rel="noopener noreferrer">Написать в Telegram<ExternalLink size={22}/></a><button className="contact__email" onClick={copyEmail}>{site.email}{copied?<Check size={17}/>:<Copy size={17}/>}</button><span className="contact__notice" role="status">{copied?'Почта скопирована':site.responseTime}</span></div><BriefWizard/></div></section>
  </main>
  <footer className="footer wrap"><a href="#" className="wordmark"><BrandMark/>katt</a><span>Идея. Реализация. Результат.</span><span>© {new Date().getFullYear()} katt</span><a href="#main">Наверх</a></footer>
  <FluidInterface/>
  {route&&<Case id={route}/>}
 </>;
}
