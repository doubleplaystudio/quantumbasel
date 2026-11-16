import numpy as np, json, math, sys
from PIL import Image
from skimage.morphology import skeletonize
from skimage.measure import label
S=4
im=Image.open(sys.argv[1]).convert('RGBA').crop((0,0,110,111))
big=im.resize((110*S,111*S),Image.LANCZOS)
A=np.array(big).astype(float)
mask=A[:,:,3]>110
sk=skeletonize(mask)
H,W=mask.shape
C=(266,233)
yy,xx=np.mgrid[0:H,0:W]
sk2=sk&(((xx-C[0])**2+(yy-C[1])**2)>10**2)
lab=label(sk2,connectivity=2)
branches=[]
for k in range(1,lab.max()+1):
    ys,xs=np.nonzero(lab==k)
    if len(xs)<50: continue
    pts=set(zip(xs.tolist(),ys.tolist()))
    def nbrs(p): return [(p[0]+dx,p[1]+dy) for dx in(-1,0,1) for dy in(-1,0,1) if (dx or dy) and (p[0]+dx,p[1]+dy) in pts]
    ends=[p for p in pts if len(nbrs(p))==1]
    cur=ends[0];order=[cur];seen={cur}
    while True:
        n=[q for q in nbrs(cur) if q not in seen]
        if not n: break
        n.sort(key=lambda q:abs(q[0]-cur[0])+abs(q[1]-cur[1]))
        cur=n[0];seen.add(cur);order.append(cur)
    branches.append(np.array(order,float))
print([ (len(b), b[:,0].mean()) for b in branches],file=sys.stderr)
left=min(branches,key=lambda b:b[:,0].mean()); right=max(branches,key=lambda b:b[:,0].mean())
# left branch: start at the end that is upper (smaller y)
if left[0,1]>left[-1,1]: left=left[::-1]
# right branch: start at the end that is upper (rising part goes up-right)
if right[0,1]>right[-1,1]: right=right[::-1]
P=np.vstack([[C],left,[C],right,[C]])
seg=np.r_[0,np.cumsum(np.hypot(*np.diff(P,axis=0).T))];t=seg/seg[-1]
cx,cy=W/2,H/2;sc=1/(W/2)
out=[]
ys,xs=np.nonzero(mask)
# z depth: crossing — one strand over the other. use t-based depth so left-in strand and right-in strand differ
for x,y in zip(xs,ys):
    r,g,b,a=A[y,x]
    d=(P[:,0]-x)**2+(P[:,1]-y)**2
    i=int(np.argmin(d))
    out.append([round((x-cx)*sc,4),round(-(y-cy)*sc,4),int(r),int(g),int(b),round(float(t[i]),4)])
cl=[[round((p[0]-cx)*sc,4),round(-(p[1]-cy)*sc,4)] for p in P[::2]]
json.dump({'pts':out,'path':cl},open(sys.argv[2],'w'),separators=(',',':'))
dbg=Image.new('RGB',(W,H),'black');px=dbg.load()
for x,y,*_ ,tt in [(int(round(o[0]/sc+cx)),int(round(-o[1]/sc+cy)),o[2],o[3],o[4],o[5]) for o in out]:
    px[x,y]=(int(255*tt),60,int(255*(1-tt)))
dbg.save(sys.argv[3])
print(len(out),len(cl),file=sys.stderr)
