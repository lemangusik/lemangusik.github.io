<script setup>
import {ref,onMounted,onUnmounted,nextTick} from 'vue'
import ArrowIcon from './ArrowIcon.vue'
import InkText from './InkText.vue'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import {needsStill,frameMonitor} from './bambooMotion.js'
import grove from '/bamboo.svg?url'
import branches from '/bamboo-front.svg?url'
import groveStill from '/bamboo-still.webp?url'
import branchesStill from '/bamboo-front-still.webp?url'
const motionPref=matchMedia('(prefers-reduced-motion:reduce)')
const net=navigator.connection
const manual=new URLSearchParams(location.search).get('motion')==='lite'
function preferStill(){return needsStill({memory:navigator.deviceMemory,cores:navigator.hardwareConcurrency,network:net,reduced:motionPref.matches,manual})}
const still=ref(preferStill())
let stopProbe,sceneObserver
function useStill(){still.value=true;stopProbe?.()}
function reevaluate(){if(preferStill())useStill()}
const services=[['Лендинги','Одна страница, одна цель. Рассказываем о продукте и ведём посетителя к заявке.'],['Корпоративные сайты','Собираем продукты, команду и экспертизу компании в понятную структуру.'],['Дизайн и разработка','От прототипа до запуска: интерфейс, адаптивная вёрстка и интеграции.'],['Поддержка и развитие','Помогаем обновлять контент, улучшать сценарии и развивать сайт после запуска.']]
const steps=[['ПОГРУЖАЕМСЯ','Сначала — суть','Разбираемся в бизнесе, аудитории и задаче. Фиксируем объём работы и план.'],['ПРОЕКТИРУЕМ','Затем — форма','Собираем структуру, пишем тексты и находим визуальный язык.'],['ЗАПУСКАЕМ','В итоге — сайт','Разрабатываем, проверяем на устройствах и передаём всё для работы.']]
const cases=[['Срез','Архитектурное бюро','Каталог частных домов, где можно пройти от фасада к планировке и материалам.','Архитектура'],['Такт','Фестиваль звука','Афиша независимой сцены с расписанием на два дня и страницами музыкантов.','Культура'],['Поля','Малое издательство','Книжная витрина: крупные развороты, заметки редакторов и тематические подборки.','Издательское дело']]
const rail=ref(null),dialog=ref(null),selected=ref(0),grid=ref(null),status=ref(''),busy=ref(false),endpoint=import.meta.env.VITE_CONTACT_ENDPOINT
let observer,ro,lenis,preference
function syncMotion(){
  lenis?.destroy();lenis=undefined
  if(!preference.matches) lenis=new Lenis({autoRaf:true,anchors:true,lerp:.12,syncTouch:false,virtualScroll:({event,deltaY})=>{
    if(event.type!=='wheel')return true
    const el=event.target
    if(el instanceof Element && el.closest('.rail') && event.shiftKey)return false
    if(el instanceof HTMLTextAreaElement && ((deltaY<0 && el.scrollTop>1)||(deltaY>0 && el.scrollTop+el.clientHeight<el.scrollHeight-1)))return false
    return true
  },prevent:el=>el.tagName==='DIALOG'})
}
function measure(){
  const g=grid.value;if(!g)return
  const gr=g.getBoundingClientRect(),dot=Math.min(56,Math.max(29,gr.width*.047))
  ;[...g.children].forEach((el,i)=>{
    const r=el.getBoundingClientRect()
    el.style.setProperty('--dx',(gr.left+gr.width*(.09+i*.27333)-r.left-r.width/2)+'px')
    el.style.setProperty('--dy',(gr.top-dot*.9-r.top-r.height/2)+'px')
    el.style.setProperty('--sx',dot/r.width);el.style.setProperty('--sy',dot/r.height)
  })
}
onMounted(()=>{
  motionPref.addEventListener('change',reevaluate);net?.addEventListener?.('change',reevaluate)
  sceneObserver=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries){
    target.classList.toggle('offstage',!isIntersecting)
    if(target.matches('.hero')&&isIntersecting&&!still.value&&!stopProbe)stopProbe=frameMonitor(useStill)
    if(target.matches('.hero')&&!isIntersecting&&stopProbe){stopProbe();stopProbe=null}
    const lava=target.querySelector('.lava')
    if(lava){if(isIntersecting)lava.unpauseAnimations?.();else lava.pauseAnimations?.()}
  }})
  document.querySelectorAll('.hero,.process,.contact').forEach(el=>sceneObserver.observe(el))
  preference=motionPref;syncMotion();preference.addEventListener('change',syncMotion)
  measure();ro=new ResizeObserver(measure);ro.observe(grid.value)
  observer=new IntersectionObserver(entries=>entries.forEach(e=>{
    if(!e.isIntersecting)return
    e.target.classList.add('shown')
    observer.unobserve(e.target)
  }),{threshold:.10})
  document.querySelectorAll('.watch,.services article').forEach(el=>observer.observe(el))
})
onUnmounted(()=>{stopProbe?.();sceneObserver?.disconnect();motionPref.removeEventListener('change',reevaluate);net?.removeEventListener?.('change',reevaluate);observer?.disconnect();ro?.disconnect();lenis?.destroy();preference?.removeEventListener('change',syncMotion)})
function move(d){rail.value.scrollBy({left:d*(rail.value.firstElementChild.offsetWidth+24),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}
async function openCase(i){selected.value=i;await nextTick();dialog.value.showModal()}
async function submit(e){const data=Object.fromEntries(new FormData(e.target));busy.value=true;try{if(endpoint){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error();status.value='Заявка отправлена.';e.target.reset()}else{const url=URL.createObjectURL(new Blob(['Имя: '+data.name+'\nКонтакт: '+data.contact+'\nПроект: '+data.project],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);status.value='Бриф сохранён в файл.'}}catch{status.value='Отправить не удалось. Попробуйте ещё раз.'}finally{busy.value=false}}
</script>
<template>
<header id="top"><div class="bar"><a href="#top" class="brand"><img src="/panda.svg" alt="">ЧЁРНЫМ<br>ПО БЕЛОМУ</a><nav><a href="#works">Работы</a><a href="#services">Услуги</a><a href="#process">Подход</a></nav><a class="btn" href="#contact">Обсудить проект <ArrowIcon/></a></div></header>
<main><section class="hero"><img class="forest" :src="still ? groveStill : grove" decoding="async" alt="" fetchpriority="high"><div class="hero-inner"><div class="intro"><small><InkText>НЕЗАВИСИМАЯ ВЕБ-СТУДИЯ / ДИЗАЙН + КОД</InkText></small><svg width="0" height="0" class="filter-def" aria-hidden="true"><defs><filter id="ink-edge" x="-30%" y="-65%" width="160%" height="240%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 9 -3.1"/></filter></defs></svg><h1 aria-label="Сайты. Всё ясно."><span v-for="(line,l) in ['САЙТЫ.','ВСЁ ЯСНО.']" aria-hidden="true" class="ink-line" :style="{'--ink-delay':l*175+'ms'}"><span class="ink-type">{{line}}</span><span class="ink-seed"></span></span></h1><p><InkText>Делаем сложное понятным. Создаём сайты, которые раскрывают ваш бизнес и помогают клиентам сделать следующий шаг.</InkText></p><a class="btn" href="#contact"><InkText>Обсудить проект</InkText> <ArrowIcon/></a></div><aside class="poster"><small><InkText>[ ЧБ / DIGITAL STUDIO ]</InkText></small><img src="/panda.svg" alt="Панда в самурайской шляпе"><small><InkText>ХАРАКТЕР ЕСТЬ.<br>ЛИШНЕГО НЕТ.</InkText></small></aside></div><img class="forest front" :src="still ? branchesStill : branches" decoding="async" alt="" aria-hidden="true"></section>
<section id="services" class="section"><small><InkText>01 / ЧТО МЫ ДЕЛАЕМ</InkText></small><h2><InkText>От первого смысла до последнего пикселя.</InkText></h2><div class="services watch" ref="grid"><article v-for="([name,desc],i) in services" :style="{'--i':i}"><div class="skin"></div><div class="service-copy"><small><InkText>0{{i+1}}</InkText></small><h3><InkText>{{name}}</InkText></h3><p><InkText>{{desc}}</InkText></p><a href="#contact" :aria-label="'Обсудить: '+name"><ArrowIcon/></a></div></article></div></section>
<section class="process watch" id="process"><div class="pond"><svg viewBox="0 0 1000 440" preserveAspectRatio="none" aria-hidden="true"><g v-for="n in 12" :style="{'--i':n}"><circle cx="235" cy="-190" :r="550-(n-1)*30" :fill="n%2?'#171717':'white'"/></g></svg><small><InkText>02 / КАК МЫ РАБОТАЕМ</InkText></small><h2><InkText>ПРОЗРАЧНО<br>НА КАЖДОМ ЭТАПЕ</InkText></h2></div><div class="steps"><article v-for="([label,title,desc],i) in steps"><small><InkText>0{{i+1}} / {{label}}</InkText></small><h3><InkText>{{title}}</InkText></h3><p><InkText>{{desc}}</InkText></p></article></div></section>
<section class="section works" id="works"><small><InkText>03 / ПОРТФОЛИО</InkText></small><div class="work-head"><h2><InkText>Избранные работы.</InkText></h2><div><button @click="move(-1)" aria-label="Предыдущая работа"><ArrowIcon direction="left"/></button><button @click="move(1)" aria-label="Следующая работа"><ArrowIcon direction="right"/></button></div></div><div class="rail" data-lenis-prevent-horizontal ref="rail" tabindex="0" aria-label="Галерея работ"><article v-for="(c,i) in cases"><div class="cover" :class="'c'+i"><small><InkText>ЧБ / ЭТЮД 00{{i+1}}</InkText></small><div class="art"></div><b><InkText>{{c[0]}}.</InkText></b></div><small><InkText>0{{i+1}} / {{c[3]}}</InkText></small><h3><InkText>{{c[1]}} «{{c[0]}}»</InkText></h3><a :href="'#case-'+i" @click.prevent="openCase(i)"><InkText>Посмотреть концепт</InkText> <ArrowIcon/></a></article></div></section>
<section id="contact" class="contact"><svg class="lava" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path fill="white" d="M0 0H48Q62 20 48 42T50 76Q56 89 45 100H0Z"><animate attributeName="d" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" values="M0 0H48Q62 20 48 42T50 76Q56 89 45 100H0Z;M0 0H48Q42 20 53 42T46 76Q44 89 51 100H0Z;M0 0H48Q62 20 48 42T50 76Q56 89 45 100H0Z"/></path></svg><div class="contact-inner"><div><small><InkText>04 / НАЧНЁМ С РАЗГОВОРА</InkText></small><h2><InkText>Обсудим<br>проект?</InkText></h2></div><form @submit.prevent="submit"><label class="entry"><input required name="name" aria-label="Ваше имя" placeholder=" "><span class="hint"><InkText>Ваше имя</InkText></span></label><label class="entry"><input required name="contact" aria-label="Email или Telegram" placeholder=" "><span class="hint"><InkText>Email или Telegram</InkText></span></label><label class="entry"><textarea required name="project" aria-label="Пара слов о проекте" placeholder=" "></textarea><span class="hint"><InkText>Пара слов о проекте</InkText></span></label><label v-if="endpoint"><input required type="checkbox"> <InkText>Согласен на обработку данных заявки</InkText></label><button class="btn" :disabled="busy"><InkText>{{endpoint?'Отправить заявку':'Скачать бриф'}}</InkText> <ArrowIcon/></button><small aria-live="polite"><InkText v-if="status" :key="status">{{status}}</InkText></small></form></div></section></main><footer><a href="#top" class="brand"><img src="/panda.svg" alt=""><InkText>ЧЁРНЫМ<br>ПО БЕЛОМУ</InkText></a><small><InkText>ЧЁРНЫМ ПО БЕЛОМУ © 2026</InkText></small><a href="#top"><InkText>Наверх</InkText> <ArrowIcon direction="up"/></a></footer>
<dialog ref="dialog" @click="e=>{if(e.target===dialog)dialog.close()}"><small><InkText>ПОРТФОЛИО / КОНЦЕПТ 0{{selected+1}}</InkText></small><h2><InkText>{{cases[selected][0]}}.</InkText></h2><h3><InkText>{{cases[selected][1]}}</InkText></h3><p><InkText>{{cases[selected][2]}}</InkText></p><button class="btn" @click="dialog.close()"><InkText>Закрыть ×</InkText></button></dialog></template>
