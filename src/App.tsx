import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Plus, X, Gamepad2, Globe2, Code2, FolderOpen, ShieldCheck, PackageCheck, LayoutGrid, Server, PlugZap, ArrowUpRight, Zap } from 'lucide-react';
import { Navigation } from './Navigation';
import { projects, site, asset, coverOf, getProject } from './data/projects';
import type { Project } from './data/projects';
import { openProject, useRoute } from './lib/router';
import { Mascot } from './Mascot';
import { ProjectGallery } from './ProjectGallery';
import { FluidDetails, FluidInterface, BriefWizard, CaseInspector, BrandMark, fluidRoute } from './FluidUI';

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
  return <button ref={ref} className={`project-card project-card--${p.id}`} aria-label={`Открыть проект ${p.title}`} data-reveal style={{'--delay':`${index%2*.08}s`} as React.CSSProperties} onClick={e=>{ping();const cover=e.currentTarget.querySelector<HTMLElement>('.project-card__visual');if(cover)cover.style.viewTransitionName=`cover-${p.id}`;fluidRoute(()=>openProject(p.id));}}>
    <div className="project-card__visual" style={{viewTransitionName:'none'}}><ProjectVisual project={p}/><div className="project-role"><span>{p.id==='freeward'?'Собственный продукт':'Моя работа'}</span><strong>{projectRoles[p.id]??p.role}</strong></div></div>
    <div className="project-card__info"><div><span className="project-card__genre">{p.genre}</span><h3>{p.title}</h3></div><span className="project-card__status">{p.status}</span></div><div className="project-card__deliverables">{(projectRoles[p.id]??p.role).split(' · ').map(t=><span key={t}><Check size={14}/>{t}</span>)}</div><span className="project-card__inspect" aria-hidden="true"><ArrowUpRight size={20}/></span>
  </button>;
}

function Case({id}:{id:string}) {
  const project=getProject(id); const dialog=useRef<HTMLDialogElement>(null);
  useLayoutEffect(()=>{const d=dialog.current;if(!d)return;d.showModal();document.body.classList.add('case-is-open');return()=>{d.close();document.body.classList.remove('case-is-open');};},[id]);
  const close=()=>fluidRoute(()=>openProject(null));
  if(!project)return <dialog ref={dialog} className="case" onCancel={close}><button onClick={close}>Закрыть</button><h2>Проект не найден</h2></dialog>;
  return <dialog ref={dialog} className={`case case--${project.id}`} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}} aria-label={project.title}>
    <div className="case__sheet"><div className="case__nav"><a href="#contact" onClick={e=>{e.preventDefault();close();setTimeout(()=>document.getElementById('contact')?.scrollIntoView({behavior:'smooth'}),50);}}>Обсудить похожий проект</a><button onClick={close} className="icon-button" aria-label="Закрыть проект"><X/></button></div>
      <nav className="case__toc" aria-label="Разделы проекта">{[['result','Результат'],['decisions','Решения'],['implementation','Моя работа'],['gallery','Галерея']].filter(([section])=>section!=='gallery'||project.media.length>1).map(([section,label])=><a key={section} href={`#case-${section}`} onClick={e=>{e.preventDefault();const target=document.getElementById(`case-${section}`);if(target)window.dispatchEvent(new CustomEvent('case:scroll',{detail:target}));}}>{label}</a>)}</nav><div className="case__intro" id="case-result"><span className="eyebrow">{project.genre} · {project.year}</span><h2>{project.title}</h2><p>{project.tagline}</p><div className="case__facts"><span><small>Моя роль</small>{project.role}</span><span><small>Технологии</small>{project.engine}</span><span><small>Состояние</small>{project.status}</span></div></div>
      <div className="case__cover" style={{viewTransitionName:`cover-${project.id}`}}><ProjectVisual project={project} detail/></div>{project.id==='colosseum'&&<p className="case__cover-caption">Главное меню — воссоздано по исходному интерфейсу игры.</p>}
      <div className="case__story" id="case-decisions">{project.id==='freeward'&&<div className="ownership-note"><strong>Мой собственный продукт</strong><p>Freeward VPN полностью принадлежит мне. Сам разрабатываю сервис, управляю им и отвечаю за его развитие.</p></div>}<h3>Что за проект</h3><p>{project.overview}</p><FluidDetails title="Технологии и моя работа"><dl className="case-tech"><div><dt>Технологии</dt><dd>{project.engine}</dd></div><div><dt>Моя роль</dt><dd>{project.role}</dd></div></dl><div className="tag-list">{project.contribution.map(c=><span key={c}>{tagNames[c]??c}</span>)}</div></FluidDetails><CaseInspector project={project}/></div>


      {project.media.length>1&&<ProjectGallery key={project.id} project={project}/>}
      {project.links.length>0&&<div className="case__links">{project.links.map(l=><a key={l.url} className="button button--dark" href={l.url} target="_blank" rel="noopener noreferrer"><span className="button__label">{l.label}</span><ExternalLink size={17}/></a>)}</div>}
      <div className="case__footer"><h3>Сделаем что-то своё?</h3><a className="button button--dark" href={`https://t.me/katt_dev?text=${encodeURIComponent(`Привет! Посмотрел проект «${project.title}» в портфолио. Хочу обсудить похожую задачу.`)}`} target="_blank" rel="noopener noreferrer"><span className="button__label">Хочу похожий проект</span></a><button className="text-button" onClick={close}>Вернуться к проектам</button></div>
    </div>
  </dialog>;
}

const projectRoles:Record<string,string>={'piworld':'Игровые системы · Мультиплеер','colosseum':'Полная разработка игры · Игровые системы','freeward':'Владелец · Разработчик','build-the-pyramid':'Полная разработка игры · Интерфейс','hookfold-bay':'Полная разработка игры · Игровые системы'};

function SystemSection(){
 const [selected,setSelected]=useState(0);
 const layers=[{label:'Интерфейс',icon:LayoutGrid,text:'Экраны и действия пользователя.',project:'build-the-pyramid',example:'Интерфейс и игровой цикл Build the Pyramid!'},{label:'Логика',icon:Code2,text:'Механики, правила и состояние.',project:'colosseum',example:'Боевая система и полный игровой цикл Colosseum'},{label:'Серверная часть',icon:Server,text:'Данные, подписки и доступ.',project:'freeward',example:'Подписки и серверная логика Freeward VPN'},{label:'Интеграции',icon:PlugZap,text:'Платежи, Telegram и внешние API.',project:'freeward',example:'Оплата и Telegram-бот Freeward VPN'}];const layer=layers[selected],project=getProject(layer.project)!;
 return <section id="expertise" className="expertise section-space"><div className="wrap"><div className="section-head" data-reveal><div><span className="eyebrow">От интерфейса до работающей системы</span><h2>Один разработчик.<br/>Целая система.</h2></div><p>Соединяю части продукта<br/>и отвечаю за их совместную работу.</p></div><div className="system-map"><svg className="system-map__connections" viewBox="0 0 800 320" preserveAspectRatio="none" aria-hidden="true"><path d="M160 80H270Q300 80 300 110V140Q300 160 330 160H400M640 80H530Q500 80 500 110V140Q500 160 470 160H400M160 240H270Q300 240 300 210V180Q300 160 330 160H400M640 240H530Q500 240 500 210V180Q500 160 470 160H400"/></svg><div className="system-map__core"><PackageCheck size={35}/><strong>Рабочий продукт</strong><span>Все части связаны</span></div>{layers.map((item,i)=><button key={item.label} className={`system-node system-node--${i}`} aria-pressed={selected===i} onClick={()=>setSelected(i)}><item.icon size={26}/><strong>{item.label}</strong><span>{item.text}</span><i aria-hidden="true"/></button>)}</div><div className="system-example"><span className="system-example__label">В реальном проекте</span><button onClick={e=>{const cover=e.currentTarget.querySelector<HTMLElement>('[data-project-preview]');if(cover)cover.style.viewTransitionName=`cover-${project.id}`;fluidRoute(()=>openProject(project.id));}}><span className="skill-project-preview" data-project-preview={project.id} style={{viewTransitionName:'none'}} aria-hidden="true"><span className="skill-project-preview__frame"><ProjectVisual project={project}/></span></span><span className="system-example__copy" key={selected}><strong>{layer.example}</strong><span>Открыть разбор проекта</span></span><Plus size={19}/></button></div></div></section>;
}

export default function App(){
 const route=useRoute(); const [filter,setFilter]=useState('Все проекты'),[copied,setCopied]=useState(false);

 const filterRef=useRef<HTMLDivElement>(null);const [filterInk,setFilterInk]=useState({left:0,width:0});
 useLayoutEffect(()=>{const root=filterRef.current;if(!root)return;const update=()=>{const selected=root.querySelector<HTMLElement>('[aria-pressed=true]');if(selected)setFilterInk({left:selected.offsetLeft,width:selected.offsetWidth});};const resize=new ResizeObserver(update);resize.observe(root);update();return()=>resize.disconnect();},[filter]);
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
  <div className="page-scroll"><div className="page-scroll__content">
  <main id="main">
   <section className="hero wrap"><div className="hero__copy" data-intro="pending"><span className="eyebrow intro-line">Разработчик цифровых продуктов</span><h1><span className="intro-line">Создаю игры,</span><span className="intro-line">приложения</span><span className="hero__outline intro-line">и сервисы<span className="hero__period">.</span></span></h1><div className="hero__lead hero__proof intro-line"><span><Zap size={19}/>Быстрее с ИИ</span><span><ShieldCheck size={19}/>Код под моим контролем</span></div><div className="hero__actions intro-line"><a className="button button--dark" href="#contact" onMouseEnter={ping}><span className="button__label">Обсудить вашу идею</span></a><a className="button button--plain" href="#work"><FolderOpen size={18}/>Мои проекты</a></div><div className="hero__availability intro-line"><span className="availability-dot"/>{site.availableLabel}<span className="hero__name">katt / independent developer</span></div></div><div className="hero__stage"><Mascot/><div className="hero__stage-footer"><span>Игры. Приложения. Сервисы.<br/>От прототипа до рабочей версии.</span><span className="hero__cross">✳</span></div></div></section>
   <div className="craft-strip wrap"><span>От механики<br/> до целого продукта</span><div>Unity <i/> C# <i/> Golang <i/> Python <i/> UI / UX</div><Code2 size={26}/></div>
   <section id="work" className="work wrap section-space"><div className="section-head" data-reveal><div><span className="eyebrow">Идеи, воплощённые в коде</span><h2>Мои проекты<span>.</span></h2></div></div><div ref={filterRef} className="filters" role="group" aria-label="Фильтр проектов"><span className="filter-ink" style={{left:filterInk.left,width:filterInk.width}}/>{['Все проекты','Игры','Сервисы'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>{setFilter(f);ping();}}><span className="filter__label">{f}</span>{filter===f&&<span className="filter__count">{list.length}</span>}</button>)}</div><div className="project-grid">{list.map((p,i)=><ProjectCard key={p.id} p={p} index={i}/>)}</div></section>
   <section id="about" className="about wrap section-space"><div className="skill-visual" data-reveal><div className="capability-proof__head"><Code2 size={23}/><h3>Что я делаю сам</h3></div>{[{id:'piworld',icon:Gamepad2,title:'Механики и мультиплеер',name:'Piworld',tags:'Механики игры и взаимодействие игроков.'},{id:'freeward',icon:Globe2,title:'Сервис от оплаты до доступа',name:'Freeward VPN',tags:'Серверная часть, бот и подписки. Мой продукт.'},{id:'build-the-pyramid',icon:LayoutGrid,title:'Полный игровой цикл',name:'Build the Pyramid!',tags:'Логика игры, прогрессия и интерфейс.'}].map(p=><button key={p.id} onClick={e=>{const preview=e.currentTarget.querySelector<HTMLElement>('.skill-project-preview');if(preview)preview.style.viewTransitionName=`cover-${p.id}`;fluidRoute(()=>openProject(p.id));}}><span className="skill-project-preview" data-project-preview={p.id} style={{viewTransitionName:'none'}} aria-hidden="true"><span className="skill-project-preview__frame"><ProjectVisual project={getProject(p.id)!}/></span></span><span className="skill-visual__icon"><p.icon size={25}/></span><span className="skill-project-text"><strong>{p.title}</strong><small>{p.name}</small></span><ArrowUpRight size={18}/></button>)}</div><div className="about__copy" data-reveal><span className="eyebrow">Привет. Я katt.</span><h2>Пишу код.<br/>Отвечаю за результат.</h2><p>C#, Go и Python. От первой механики до запуска продукта.</p><div className="owner-values"><span><Code2 size={20}/>Разбираюсь в коде</span><span><ShieldCheck size={20}/>Проверяю решения</span><span><PackageCheck size={20}/>Передаю исходники</span></div><div className="stack-note"><Code2 size={21}/><p><strong>Есть требования к языку или стеку?</strong>Освою под задачу. Проверю на прототипе, согласую сроки.</p></div></div></section>
   <SystemSection/>
   <section id="contact" className="contact section-space"><div className="wrap contact__layout"><div data-reveal><span className="eyebrow">Хорошие проекты начинаются с разговора</span><h2>Превратим идею<br/>в продукт<span>.</span></h2><p>Опишите задачу своими словами.<br/>Помогу определить функции и первый шаг.</p><a className="contact__telegram" href="https://t.me/katt_dev" target="_blank" rel="noopener noreferrer">Написать в Telegram<ExternalLink size={22}/></a><button className="contact__email" onClick={copyEmail}>{site.email}{copied?<Check size={17}/>:<Copy size={17}/>}</button><span className="contact__notice" role="status">{copied?'Почта скопирована':site.responseTime}</span></div><BriefWizard/></div></section>
  </main>
  <footer className="footer wrap"><a href="#" className="wordmark"><BrandMark/>katt</a><span>Идея. Реализация. Результат.</span><span>© {new Date().getFullYear()} katt</span><a href="#main">Наверх</a></footer>
  </div></div>
  <FluidInterface/>
  {route&&<Case id={route}/>}
 </>;
}
