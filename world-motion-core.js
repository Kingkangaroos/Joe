(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WorldMotion=api;})(typeof window==='undefined'?this:window,function(){
'use strict';
const clips={walk:{duration:1.2,stride:.78125,duty:.64},run:{duration:22/30,stride:2.2222222222222223,duty:.36}};
function speed(mode,scale=1){const c=clips[mode];return c?c.stride/c.duration*scale:0;}
function advance(state,dt,scale=1){const dx=state.target.x-state.x,dz=state.target.z-state.z,remaining=Math.hypot(dx,dz),distance=Math.min(remaining,speed(state.motion,scale)*Math.max(0,Math.min(dt,.05)));if(remaining>1e-6){state.x+=dx/remaining*distance;state.z+=dz/remaining*distance;state.heading=Math.atan2(dx,dz);}return {distance,arrived:remaining<.015||distance>=remaining,clipDelta:speed(state.motion,scale)>0?distance/speed(state.motion,scale):0};}
function footPhase(phase,mode){const duty=clips[mode]?.duty??1,p=((phase%1)+1)%1;return {contact:p<duty,swing:p<duty?0:(p-duty)/(1-duty)};}
return {clips,speed,advance,footPhase};});
