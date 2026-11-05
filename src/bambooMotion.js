// Pick the image URLs before Vue mounts, so the lightweight path never requests animated SVGs.
export function needsStill({memory,cores,network,reduced,manual}){
  return Boolean(reduced||manual||network?.saveData||
    ['slow-2g','2g','3g'].includes(network?.effectiveType)||
    (network?.downlink>0 && network.downlink<1.5)||
    (memory>0 && memory<=4)||(cores>0 && cores<=4))
}
// Stop sampling after four seconds; two consecutive slow windows exclude a lone long task.
export function frameMonitor(downgrade){
  let id=0,last=0,windowTime=0,frames=0,slow=0,total=0
  function tick(t){
    if(document.hidden)return
    if(last){
      const dt=t-last
      total+=dt;windowTime+=dt;frames++
      if(windowTime>=650){
        slow=windowTime/frames>34?slow+1:0
        if(slow>=2){downgrade();return}
        frames=0;windowTime=0
      }
    }
    last=t
    if(total<4000)id=requestAnimationFrame(tick)
  }
  id=requestAnimationFrame(tick)
  return ()=>cancelAnimationFrame(id)
}
