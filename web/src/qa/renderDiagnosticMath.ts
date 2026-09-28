// Three bounded horizontal scanlines detect the observed full/right-rectangle black frame.
// This does not classify ordinary dark blue space as black, and does not alter any pixels.
export function classifyScanlines(rows:Uint8Array[],width:number){
 let black=0,rightBlack=0,rightCount=0,leftSum=0,leftCount=0,sum=0
 for(const row of rows)for(let x=0;x<width;x++){
  const i=x*4,total=row[i]+row[i+1]+row[i+2],zero=total===0
  sum+=total;if(zero)black++
  if(x>=Math.floor(width*.30)){rightCount++;if(zero)rightBlack++}
  if(x<Math.floor(width*.25)){leftCount++;leftSum+=total}
 }
 const count=width*rows.length,blackRatio=black/count,rightBlackRatio=rightBlack/rightCount,leftMean=leftSum/(3*leftCount)
 return {blackRatio,rightBlackRatio,leftMean,mean:sum/(3*count),suspect:blackRatio>.995||rightBlackRatio>.995&&leftMean>4}
}
export function diagnosticOptions(search:string,development:boolean){
 const q=new URLSearchParams(search),enabled=development&&q.get('render-diag')==='1'
 return {enabled,fixedDpr:enabled&&q.get('fixed-dpr')==='1.5'?1.5:null,pixels:enabled&&q.get('pixel-probe')==='1'}
}
