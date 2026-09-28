export const mix=(a,b,t)=>a+(b-a)*t;
const hash=(x,y,z)=>{let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,2147483647);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295*2-1};
export function noise(x,y,z){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z),fx=x-ix,fy=y-iy,fz=z-iz,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz);return mix(mix(mix(hash(ix,iy,iz),hash(ix+1,iy,iz),u),mix(hash(ix,iy+1,iz),hash(ix+1,iy+1,iz),u),v),mix(mix(hash(ix,iy,iz+1),hash(ix+1,iy,iz+1),u),mix(hash(ix,iy+1,iz+1),hash(ix+1,iy+1,iz+1),u),v),w)}
export const smoothMin=(a,b,k=.3)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
export const ellipsoid=(x,y,z,rx,ry,rz)=>(Math.hypot(x/rx,y/ry,z/rz)-1)*Math.min(rx,ry,rz);
export function rockVariation(x,y,z){return .4*noise(x*.6,y*.74,z*.6)+.2*noise(x*1.6,y*1.9,z*1.5)+.08*noise(x*3.7,y*4.2,z*3.3)}
