<script>
let observer
const active=new Set()
function finish(el){
  active.delete(el)
  el.classList.remove('ink-pending','ink-active')
  el.lastElementChild.replaceChildren()
}
function finishActive(){for(const el of active)finish(el)}
// Read the browser's actual wraps, including explicit <br>. The original
// slot stays in normal flow; the decorative copies live only during reveal.
function reveal(el){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){finish(el);return}
  // Body copy stays on its final baseline; only headings need measured line overlays.
  if(!el.closest('h1,h2,h3,.cover b')){
    el.classList.add('ink-stationary')
    el.classList.replace('ink-pending','ink-active')
    el.firstElementChild.addEventListener('animationend',()=>finish(el),{once:true})
    return
  }
  const source=el.firstElementChild, origin=el.getBoundingClientRect()
  const walk=document.createTreeWalker(source,NodeFilter.SHOW_TEXT)
  const lines=[],range=document.createRange()
  let node
  function add(rect,word,spaced){
    if(!rect.width)return
    let line=lines.at(-1)
    if(!line||Math.abs(line.y-rect.top)>1){line={x:rect.left,y:rect.top,text:''};lines.push(line)}
    line.text+=(spaced && line.text?' ':'')+word
  }
  while((node=walk.nextNode())){
    for(const m of node.data.matchAll(/\S+/gu)){
      const start=m.index,end=start+m[0].length
      range.setStart(node,start);range.setEnd(node,end)
      const rects=range.getClientRects()
      if(rects.length===1)add(rects[0],m[0],start>0)
      else {let pos=start;for(const c of m[0]){range.setStart(node,pos);range.setEnd(node,pos+c.length);add(range.getBoundingClientRect(),c,pos===start&&start>0);pos+=c.length}}
    }
  }
  if(!lines.length){finish(el);return}
  const fragment=document.createDocumentFragment()
  for(const [i,line] of lines.entries()){
    const row=document.createElement('span'),type=document.createElement('span'),seed=document.createElement('span')
    row.className='ink-run';type.className='ink-type';seed.className='ink-seed'
    row.style.left=(line.x-origin.left)+'px'
    row.style.setProperty('--stagger',Math.min(i,5)*72+'ms')
    type.textContent=line.text;row.append(type,seed);fragment.append(row)
    if(i===lines.length-1)type.addEventListener('animationend',()=>finish(el),{once:true})
  }
  el.lastElementChild.replaceChildren(fragment)
  // Align the copy's glyph bounds rather than assuming a font's ascent.
  const rows=el.lastElementChild.children
  range.selectNodeContents(rows[0].firstElementChild)
  const firstTop=range.getBoundingClientRect().top
  for(let i=0;i<rows.length;i++)rows[i].style.top=(lines[i].y-firstTop)+'px'
  active.add(el);el.classList.replace('ink-pending','ink-active')
}
export default {
  mounted(){
    if(!observer){
      observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);reveal(e.target)}})
    }
    if(matchMedia('(prefers-reduced-motion:reduce)').matches)return
    this.$el.classList.add('ink-pending');observer.observe(this.$el)
    window.addEventListener('resize',finishActive)
  },
  beforeUnmount(){observer?.unobserve(this.$el);active.delete(this.$el)}
}
</script>
<template><span class="ink-word"><span class="ink-source"><slot/></span><span class="ink-paint" aria-hidden="true"></span></span></template>
