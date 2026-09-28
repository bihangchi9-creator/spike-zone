// Shared stations: every body skin meets the same shoulder/waist boundary.
// Z goes from nose to stern. No independent floating side-pod volumes.
export function sample(keys,t){
 const x=Math.max(keys[0][0],Math.min(keys.at(-1)[0],t));let i=0;while(i<keys.length-2&&keys[i+1][0]<x)i++
 const a=keys[i],b=keys[i+1],p=keys[Math.max(0,i-1)],n=keys[Math.min(keys.length-1,i+2)],d=b[0]-a[0],u=(x-a[0])/d
 return a.slice(1).map((v,j)=>{const c=j+1,m0=(b[c]-p[c])/(b[0]-p[0]),m1=(n[c]-a[c])/(n[0]-a[0]);return (2*u**3-3*u*u+1)*v+(u**3-2*u*u+u)*d*m0+(-2*u**3+3*u*u)*b[c]+(u**3-u*u)*d*m1})
}
// Cubic Hermite bridge with explicit endpoint derivatives in model units per Z.
export function hermite(a,b,ma,mb,u,span){return a.map((v,i)=>(2*u**3-3*u*u+1)*v+(u**3-2*u*u+u)*span*ma[i]+(-2*u**3+3*u*u)*b[i]+(u**3-u*u)*span*mb[i])}
export function derivative(keys,t){
 const x=Math.max(keys[0][0],Math.min(keys.at(-1)[0],t));let i=0;while(i<keys.length-2&&keys[i+1][0]<x)i++
 const a=keys[i],b=keys[i+1],p=keys[Math.max(0,i-1)],n=keys[Math.min(keys.length-1,i+2)],span=b[0]-a[0],u=(x-a[0])/span
 return a.slice(1).map((v,j)=>{const c=j+1,ma=(b[c]-p[c])/(b[0]-p[0]),mb=(n[c]-a[c])/(n[0]-a[0]);return ((6*u*u-6*u)*v+(3*u*u-4*u+1)*span*ma+(-6*u*u+6*u)*b[c]+(3*u*u-2*u)*span*mb)/span})
}
export const canopy=[[-1.72,.035,.285,.016],[-1.30,.36,.30,.30],[-.55,.52,.32,.60],[.20,.50,.36,.63],[.72,.31,.43,.37],[1.02,.014,.49,.018]]
// z, outer width, shoulder crest, upper chine, waist, bottom
export const stations=[[-2.94,.018,.050,.025,-.012,-.025],[-2.40,.48,.245,.12,-.075,-.16],[-1.72,.98,.385,.14,-.12,-.25],[-1.30,1.17,.465,.18,-.17,-.31],[-.55,1.43,.625,.21,-.205,-.39],[.30,1.64,.73,.22,-.22,-.425],[1.0,1.66,.67,.20,-.20,-.39],[1.55,1.647,.492,.172,-.205,-.31]]
export function innerEdge(z){
 if(z<canopy[0][0])return sample([[-2.94,.006,.044],[-2.40,.25,.226],[-1.72,.115,.285]],z)
 if(z<=canopy.at(-1)[0]){const [w,y]=sample(canopy,z);return [w+.08,y-.004]}
 const rear=[[1.02,.094,.486],[1.26,.39,.47],[1.55,.72,.405]]
 if(z<1.26)return hermite([.094,.486],[.39,.47],derivative(canopy,1.02).slice(0,2),derivative(rear,1.26),(z-1.02)/.24,.24)
 return sample(rear,z)
}
export function shoulderPoint(z,q,side=1){
 const [w,peak,edge]=sample(stations,z),[ix,iy]=innerEdge(z),v=1-q
 // Directed upper planes, a rounded shoulder break, then a steep outer return.
 const [f,y]=sample([[0,0,iy],[.18,.17,iy+(peak-iy)*.75],[.43,.45,peak],[.70,.76,peak*.78+edge*.22],[.9,.94,peak*.35+edge*.65],[1,1,edge]],v)
 return [side*(ix+(w-ix)*f),y,z]
}
export function sidePoint(z,v,side=1){const [w,,edge,waist]=sample(stations,z),[x,h]=sample([[0,1,0],[.18,.994,.18],[.72,.947,.77],[1,.895,1]],v);return [side*w*x,edge+(waist-edge)*h,z]}
export function bellyPoint(z,v){const [w,,,waist,bottom]=sample(stations,z),x=(v*2-1);return [w*.895*x,bottom+(waist-bottom)*Math.abs(x)**3,z]}
export function nosePoint(z,v){const [w,y]=innerEdge(z),x=(v*2-1)*w;return[x,y+.022*(1-(x/w)**2),z]}
