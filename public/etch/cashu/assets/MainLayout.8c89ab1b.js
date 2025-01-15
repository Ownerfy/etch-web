import{Q as Ue,a as je}from"./QLayout.8b44a56c.js";import{l as Ke,c as F,m as Ge,p as Je,q as X,t as te,v as Ce,x as ae,y as ue,z as ne,A as Ze,B as et,C as tt,D as oe,r as E,E as p,w,o as at,n as Se,F as nt,G as ot,k as Y,H as _e,I as rt,J as it,f as lt,j as ve,K as me,L as M,M as x,O as d,Q as s,R as se,S as W,T as q,U as de,V as ce,W as qe,X as Me,Y as ut,Z as Le,$ as st,a0 as dt,a1 as Te,a2 as ct,a3 as ft}from"./index.927995fe.js";import{Q as vt}from"./QToolbarTitle.bcd193f5.js";import{Q as re,a as mt}from"./QList.52d670e3.js";import{Q as pt}from"./QToolbar.49c3c0de.js";import{Q as ht}from"./QHeader.5c1467bc.js";import{Q as I,a as T,b as fe}from"./QItem.02426fde.js";import{u as yt,a as bt,b as gt,c as wt,d as kt,e as Ct}from"./use-timeout.afd034c5.js";import{u as St,a as _t}from"./use-dark.3625dc1e.js";import{g as Be,s as $e}from"./touch.9135741d.js";import{c as qt}from"./selection.0264e392.js";import{b as N,u as Mt}from"./ui.d5c1e1dd.js";import"./scroll.62b7b14d.js";import"./QResizeObserver.004c01c5.js";import"./index.463654f8.js";function ie(t,o,i){const h=ue(t);let e,n=h.left-o.event.x,l=h.top-o.event.y,f=Math.abs(n),y=Math.abs(l);const c=o.direction;c.horizontal===!0&&c.vertical!==!0?e=n<0?"left":"right":c.horizontal!==!0&&c.vertical===!0?e=l<0?"up":"down":c.up===!0&&l<0?(e="up",f>y&&(c.left===!0&&n<0?e="left":c.right===!0&&n>0&&(e="right"))):c.down===!0&&l>0?(e="down",f>y&&(c.left===!0&&n<0?e="left":c.right===!0&&n>0&&(e="right"))):c.left===!0&&n<0?(e="left",f<y&&(c.up===!0&&l<0?e="up":c.down===!0&&l>0&&(e="down"))):c.right===!0&&n>0&&(e="right",f<y&&(c.up===!0&&l<0?e="up":c.down===!0&&l>0&&(e="down")));let r=!1;if(e===void 0&&i===!1){if(o.event.isFirst===!0||o.event.lastDir===void 0)return{};e=o.event.lastDir,r=!0,e==="left"||e==="right"?(h.left-=n,f=0,n=0):(h.top-=l,y=0,l=0)}return{synthetic:r,payload:{evt:t,touch:o.event.mouse!==!0,mouse:o.event.mouse===!0,position:h,direction:e,isFirst:o.event.isFirst,isFinal:i===!0,duration:Date.now()-o.event.time,distance:{x:f,y},offset:{x:n,y:l},delta:{x:h.left-o.event.lastX,y:h.top-o.event.lastY}}}}let Lt=0;var le=Ke({name:"touch-pan",beforeMount(t,{value:o,modifiers:i}){if(i.mouse!==!0&&F.has.touch!==!0)return;function h(n,l){i.mouse===!0&&l===!0?Ze(n):(i.stop===!0&&ae(n),i.prevent===!0&&Ce(n))}const e={uid:"qvtp_"+Lt++,handler:o,modifiers:i,direction:Be(i),noop:Ge,mouseStart(n){$e(n,e)&&Je(n)&&(X(e,"temp",[[document,"mousemove","move","notPassiveCapture"],[document,"mouseup","end","passiveCapture"]]),e.start(n,!0))},touchStart(n){if($e(n,e)){const l=n.target;X(e,"temp",[[l,"touchmove","move","notPassiveCapture"],[l,"touchcancel","end","passiveCapture"],[l,"touchend","end","passiveCapture"]]),e.start(n)}},start(n,l){if(F.is.firefox===!0&&te(t,!0),e.lastEvt=n,l===!0||i.stop===!0){if(e.direction.all!==!0&&(l!==!0||e.modifiers.mouseAllDir!==!0&&e.modifiers.mousealldir!==!0)){const c=n.type.indexOf("mouse")!==-1?new MouseEvent(n.type,n):new TouchEvent(n.type,n);n.defaultPrevented===!0&&Ce(c),n.cancelBubble===!0&&ae(c),Object.assign(c,{qKeyEvent:n.qKeyEvent,qClickOutside:n.qClickOutside,qAnchorHandled:n.qAnchorHandled,qClonedBy:n.qClonedBy===void 0?[e.uid]:n.qClonedBy.concat(e.uid)}),e.initialEvent={target:n.target,event:c}}ae(n)}const{left:f,top:y}=ue(n);e.event={x:f,y,time:Date.now(),mouse:l===!0,detected:!1,isFirst:!0,isFinal:!1,lastX:f,lastY:y}},move(n){if(e.event===void 0)return;const l=ue(n),f=l.left-e.event.x,y=l.top-e.event.y;if(f===0&&y===0)return;e.lastEvt=n;const c=e.event.mouse===!0,r=()=>{h(n,c);let g;i.preserveCursor!==!0&&i.preservecursor!==!0&&(g=document.documentElement.style.cursor||"",document.documentElement.style.cursor="grabbing"),c===!0&&document.body.classList.add("no-pointer-events--children"),document.body.classList.add("non-selectable"),qt(),e.styleCleanup=v=>{if(e.styleCleanup=void 0,g!==void 0&&(document.documentElement.style.cursor=g),document.body.classList.remove("non-selectable"),c===!0){const B=()=>{document.body.classList.remove("no-pointer-events--children")};v!==void 0?setTimeout(()=>{B(),v()},50):B()}else v!==void 0&&v()}};if(e.event.detected===!0){e.event.isFirst!==!0&&h(n,e.event.mouse);const{payload:g,synthetic:v}=ie(n,e,!1);g!==void 0&&(e.handler(g)===!1?e.end(n):(e.styleCleanup===void 0&&e.event.isFirst===!0&&r(),e.event.lastX=g.position.left,e.event.lastY=g.position.top,e.event.lastDir=v===!0?void 0:g.direction,e.event.isFirst=!1));return}if(e.direction.all===!0||c===!0&&(e.modifiers.mouseAllDir===!0||e.modifiers.mousealldir===!0)){r(),e.event.detected=!0,e.move(n);return}const _=Math.abs(f),b=Math.abs(y);_!==b&&(e.direction.horizontal===!0&&_>b||e.direction.vertical===!0&&_<b||e.direction.up===!0&&_<b&&y<0||e.direction.down===!0&&_<b&&y>0||e.direction.left===!0&&_>b&&f<0||e.direction.right===!0&&_>b&&f>0?(e.event.detected=!0,e.move(n)):e.end(n,!0))},end(n,l){if(e.event!==void 0){if(ne(e,"temp"),F.is.firefox===!0&&te(t,!1),l===!0)e.styleCleanup!==void 0&&e.styleCleanup(),e.event.detected!==!0&&e.initialEvent!==void 0&&e.initialEvent.target.dispatchEvent(e.initialEvent.event);else if(e.event.detected===!0){e.event.isFirst===!0&&e.handler(ie(n===void 0?e.lastEvt:n,e).payload);const{payload:f}=ie(n===void 0?e.lastEvt:n,e,!0),y=()=>{e.handler(f)};e.styleCleanup!==void 0?e.styleCleanup(y):y()}e.event=void 0,e.initialEvent=void 0,e.lastEvt=void 0}}};if(t.__qtouchpan=e,i.mouse===!0){const n=i.mouseCapture===!0||i.mousecapture===!0?"Capture":"";X(e,"main",[[t,"mousedown","mouseStart",`passive${n}`]])}F.has.touch===!0&&X(e,"main",[[t,"touchstart","touchStart",`passive${i.capture===!0?"Capture":""}`],[t,"touchmove","noop","notPassiveCapture"]])},updated(t,o){const i=t.__qtouchpan;i!==void 0&&(o.oldValue!==o.value&&(typeof value!="function"&&i.end(),i.handler=o.value),i.direction=Be(o.modifiers))},beforeUnmount(t){const o=t.__qtouchpan;o!==void 0&&(o.event!==void 0&&o.end(),ne(o,"main"),ne(o,"temp"),F.is.firefox===!0&&te(t,!1),o.styleCleanup!==void 0&&o.styleCleanup(),delete t.__qtouchpan)}});const De=150;var Tt=et({name:"QDrawer",inheritAttrs:!1,props:{...yt,...St,side:{type:String,default:"left",validator:t=>["left","right"].includes(t)},width:{type:Number,default:300},mini:Boolean,miniToOverlay:Boolean,miniWidth:{type:Number,default:57},noMiniAnimation:Boolean,breakpoint:{type:Number,default:1023},showIfAbove:Boolean,behavior:{type:String,validator:t=>["default","desktop","mobile"].includes(t),default:"default"},bordered:Boolean,elevated:Boolean,overlay:Boolean,persistent:Boolean,noSwipeOpen:Boolean,noSwipeClose:Boolean,noSwipeBackdrop:Boolean},emits:[...bt,"onLayout","miniState"],setup(t,{slots:o,emit:i,attrs:h}){const e=lt(),{proxy:{$q:n}}=e,l=_t(t,n),{preventBodyScroll:f}=Ct(),{registerTimeout:y,removeTimeout:c}=gt(),r=tt(it,oe);if(r===oe)return console.error("QDrawer needs to be child of QLayout"),oe;let _,b=null,g;const v=E(t.behavior==="mobile"||t.behavior!=="desktop"&&r.totalWidth.value<=t.breakpoint),B=p(()=>t.mini===!0&&v.value!==!0),C=p(()=>B.value===!0?t.miniWidth:t.width),m=E(t.showIfAbove===!0&&v.value===!1?!0:t.modelValue===!0),pe=p(()=>t.persistent!==!0&&(v.value===!0||Oe.value===!0));function he(a,u){if(Ee(),a!==!1&&r.animate(),S(0),v.value===!0){const k=r.instances[V.value];k!==void 0&&k.belowBreakpoint===!0&&k.hide(!1),$(1),r.isContainer.value!==!0&&f(!0)}else $(0),a!==!1&&J(!1);y(()=>{a!==!1&&J(!0),u!==!0&&i("show",a)},De)}function ye(a,u){xe(),a!==!1&&r.animate(),$(0),S(O.value*C.value),Z(),u!==!0?y(()=>{i("hide",a)},De):c()}const{show:R,hide:P}=wt({showing:m,hideOnRouteChange:pe,handleShow:he,handleHide:ye}),{addToHistory:Ee,removeFromHistory:xe}=kt(m,P,pe),H={belowBreakpoint:v,hide:P},L=p(()=>t.side==="right"),O=p(()=>(n.lang.rtl===!0?-1:1)*(L.value===!0?1:-1)),be=E(0),Q=E(!1),U=E(!1),ge=E(C.value*O.value),V=p(()=>L.value===!0?"left":"right"),j=p(()=>m.value===!0&&v.value===!1&&t.overlay===!1?t.miniToOverlay===!0?t.miniWidth:C.value:0),K=p(()=>t.overlay===!0||t.miniToOverlay===!0||r.view.value.indexOf(L.value?"R":"L")!==-1||n.platform.is.ios===!0&&r.isContainer.value===!0),A=p(()=>t.overlay===!1&&m.value===!0&&v.value===!1),Oe=p(()=>t.overlay===!0&&m.value===!0&&v.value===!1),Qe=p(()=>"fullscreen q-drawer__backdrop"+(m.value===!1&&Q.value===!1?" hidden":"")),Ie=p(()=>({backgroundColor:`rgba(0,0,0,${be.value*.4})`})),we=p(()=>L.value===!0?r.rows.value.top[2]==="r":r.rows.value.top[0]==="l"),Pe=p(()=>L.value===!0?r.rows.value.bottom[2]==="r":r.rows.value.bottom[0]==="l"),Ae=p(()=>{const a={};return r.header.space===!0&&we.value===!1&&(K.value===!0?a.top=`${r.header.offset}px`:r.header.space===!0&&(a.top=`${r.header.size}px`)),r.footer.space===!0&&Pe.value===!1&&(K.value===!0?a.bottom=`${r.footer.offset}px`:r.footer.space===!0&&(a.bottom=`${r.footer.size}px`)),a}),Fe=p(()=>{const a={width:`${C.value}px`,transform:`translateX(${ge.value}px)`};return v.value===!0?a:Object.assign(a,Ae.value)}),We=p(()=>"q-drawer__content fit "+(r.isContainer.value!==!0?"scroll":"overflow-auto")),He=p(()=>`q-drawer q-drawer--${t.side}`+(U.value===!0?" q-drawer--mini-animate":"")+(t.bordered===!0?" q-drawer--bordered":"")+(l.value===!0?" q-drawer--dark q-dark":"")+(Q.value===!0?" no-transition":m.value===!0?"":" q-layout--prevent-focus")+(v.value===!0?" fixed q-drawer--on-top q-drawer--mobile q-drawer--top-padding":` q-drawer--${B.value===!0?"mini":"standard"}`+(K.value===!0||A.value!==!0?" fixed":"")+(t.overlay===!0||t.miniToOverlay===!0?" q-drawer--on-top":"")+(we.value===!0?" q-drawer--top-padding":""))),Ve=p(()=>{const a=n.lang.rtl===!0?t.side:V.value;return[[le,Ne,void 0,{[a]:!0,mouse:!0}]]}),ze=p(()=>{const a=n.lang.rtl===!0?V.value:t.side;return[[le,ke,void 0,{[a]:!0,mouse:!0}]]}),Xe=p(()=>{const a=n.lang.rtl===!0?V.value:t.side;return[[le,ke,void 0,{[a]:!0,mouse:!0,mouseAllDir:!0}]]});function G(){Re(v,t.behavior==="mobile"||t.behavior!=="desktop"&&r.totalWidth.value<=t.breakpoint)}w(v,a=>{a===!0?(_=m.value,m.value===!0&&P(!1)):t.overlay===!1&&t.behavior!=="mobile"&&_!==!1&&(m.value===!0?(S(0),$(0),Z()):R(!1))}),w(()=>t.side,(a,u)=>{r.instances[u]===H&&(r.instances[u]=void 0,r[u].space=!1,r[u].offset=0),r.instances[a]=H,r[a].size=C.value,r[a].space=A.value,r[a].offset=j.value}),w(r.totalWidth,()=>{(r.isContainer.value===!0||document.qScrollPrevented!==!0)&&G()}),w(()=>t.behavior+t.breakpoint,G),w(r.isContainer,a=>{m.value===!0&&f(a!==!0),a===!0&&G()}),w(r.scrollbarWidth,()=>{S(m.value===!0?0:void 0)}),w(j,a=>{D("offset",a)}),w(A,a=>{i("onLayout",a),D("space",a)}),w(L,()=>{S()}),w(C,a=>{S(),ee(t.miniToOverlay,a)}),w(()=>t.miniToOverlay,a=>{ee(a,C.value)}),w(()=>n.lang.rtl,()=>{S()}),w(()=>t.mini,()=>{t.noMiniAnimation||t.modelValue===!0&&(Ye(),r.animate())}),w(B,a=>{i("miniState",a)});function S(a){a===void 0?Se(()=>{a=m.value===!0?0:C.value,S(O.value*a)}):(r.isContainer.value===!0&&L.value===!0&&(v.value===!0||Math.abs(a)===C.value)&&(a+=O.value*r.scrollbarWidth.value),ge.value=a)}function $(a){be.value=a}function J(a){const u=a===!0?"remove":r.isContainer.value!==!0?"add":"";u!==""&&document.body.classList[u]("q-body--drawer-toggle")}function Ye(){b!==null&&clearTimeout(b),e.proxy&&e.proxy.$el&&e.proxy.$el.classList.add("q-drawer--mini-animate"),U.value=!0,b=setTimeout(()=>{b=null,U.value=!1,e&&e.proxy&&e.proxy.$el&&e.proxy.$el.classList.remove("q-drawer--mini-animate")},150)}function Ne(a){if(m.value!==!1)return;const u=C.value,k=N(a.distance.x,0,u);if(a.isFinal===!0){k>=Math.min(75,u)===!0?R():(r.animate(),$(0),S(O.value*u)),Q.value=!1;return}S((n.lang.rtl===!0?L.value!==!0:L.value)?Math.max(u-k,0):Math.min(0,k-u)),$(N(k/u,0,1)),a.isFirst===!0&&(Q.value=!0)}function ke(a){if(m.value!==!0)return;const u=C.value,k=a.direction===t.side,z=(n.lang.rtl===!0?k!==!0:k)?N(a.distance.x,0,u):0;if(a.isFinal===!0){Math.abs(z)<Math.min(75,u)===!0?(r.animate(),$(1),S(0)):P(),Q.value=!1;return}S(O.value*z),$(N(1-z/u,0,1)),a.isFirst===!0&&(Q.value=!0)}function Z(){f(!1),J(!0)}function D(a,u){r.update(t.side,a,u)}function Re(a,u){a.value!==u&&(a.value=u)}function ee(a,u){D("size",a===!0?t.miniWidth:u)}return r.instances[t.side]=H,ee(t.miniToOverlay,C.value),D("space",A.value),D("offset",j.value),t.showIfAbove===!0&&t.modelValue!==!0&&m.value===!0&&t["onUpdate:modelValue"]!==void 0&&i("update:modelValue",!0),at(()=>{i("onLayout",A.value),i("miniState",B.value),_=t.showIfAbove===!0;const a=()=>{(m.value===!0?he:ye)(!1,!0)};if(r.totalWidth.value!==0){Se(a);return}g=w(r.totalWidth,()=>{g(),g=void 0,m.value===!1&&t.showIfAbove===!0&&v.value===!1?R(!1):a()})}),nt(()=>{g!==void 0&&g(),b!==null&&(clearTimeout(b),b=null),m.value===!0&&Z(),r.instances[t.side]===H&&(r.instances[t.side]=void 0,D("size",0),D("offset",0),D("space",!1))}),()=>{const a=[];v.value===!0&&(t.noSwipeOpen===!1&&a.push(ot(Y("div",{key:"open",class:`q-drawer__opener fixed-${t.side}`,"aria-hidden":"true"}),Ve.value)),a.push(_e("div",{ref:"backdrop",class:Qe.value,style:Ie.value,"aria-hidden":"true",onClick:P},void 0,"backdrop",t.noSwipeBackdrop!==!0&&m.value===!0,()=>Xe.value)));const u=B.value===!0&&o.mini!==void 0,k=[Y("div",{...h,key:""+u,class:[We.value,h.class]},u===!0?o.mini():rt(o.default))];return t.elevated===!0&&m.value===!0&&k.push(Y("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),a.push(_e("aside",{ref:"content",class:He.value,style:Fe.value},k,"contentclose",t.noSwipeClose!==!0&&v.value===!0,()=>ze.value)),Y("div",{class:"q-drawer-container"},a)}}});const Bt=ve({name:"EssentialLink",props:{title:{type:String,required:!0},caption:{type:String,default:""},link:{type:String,default:"#"},icon:{type:String,default:""}}});function $t(t,o,i,h,e,n){return M(),x(fe,{clickable:"",tag:"a",target:"_blank",href:t.link},{default:d(()=>[t.icon?(M(),x(I,{key:0,avatar:""},{default:d(()=>[s(se,{name:t.icon},null,8,["name"])]),_:1})):W("",!0),s(I,null,{default:d(()=>[s(T,null,{default:d(()=>[q(de(t.title),1)]),_:1}),s(T,{caption:""},{default:d(()=>[q(de(t.caption),1)]),_:1})]),_:1})]),_:1},8,["href"])}var Dt=me(Bt,[["render",$t]]);const Et=[{title:"Cashu.space",caption:"cashu.space",icon:"web",link:"https://cashu.space"},{title:"Github",caption:"github.com/cashubtc",icon:"code",link:"https://github.com/cashubtc/cashu.me"},{title:"Telegram",caption:"t.me/CashuMe",icon:"chat",link:"https://t.me/CashuMe"},{title:"Twitter",caption:"@CashuBTC",icon:"rss_feed",link:"https://twitter.com/CashuBTC"},{title:"Donate",caption:"Support Cashu",icon:"favorite",link:"https://docs.cashu.space/contribute"}],xt=ve({name:"MainHeader",mixins:[windowMixin],components:{EssentialLink:Dt},setup(){const t=E(!1),o=Mt(),i=E(0);let h;return{essentialLinks:Et,leftDrawerOpen:t,toggleLeftDrawer:()=>{t.value=!t.value},isStaging:()=>location.host.includes("staging"),reload:()=>{if(i.value>0){o.unlockMutex(),clearInterval(h),i.value=0;return}o.globalMutexLock||(o.lockMutex(),i.value=3,h=setInterval(()=>{i.value--,i.value===0&&(clearInterval(h),o.unlockMutex(),location.reload())},1e3))},countdown:i,uiStore:o}}});function Ot(t,o,i,h,e,n){const l=ce("EssentialLink");return M(),qe(Te,null,[s(ht,{class:"bg-transparent"},{default:d(()=>[s(pt,null,{default:d(()=>[s(Me,{flat:"",dense:"",round:"",icon:"menu",color:"primary","aria-label":"Menu",onClick:t.toggleLeftDrawer,disable:t.uiStore.globalMutexLock},null,8,["onClick","disable"]),s(vt),s(ut,{appear:"","enter-active-class":"animated wobble","leave-active-class":"animated fadeOut"},{default:d(()=>[t.g.offline?(M(),x(re,{key:0,color:"red","text-color":"black",class:"q-mr-sm"},{default:d(()=>o[1]||(o[1]=[Le("span",null,"Offline",-1)])),_:1})):W("",!0)]),_:1}),t.isStaging()?(M(),x(re,{key:0,color:"yellow","text-color":"black",class:"q-mr-sm"},{default:d(()=>o[2]||(o[2]=[Le("span",null,"Staging \u2013 don't use with real funds!",-1)])),_:1})):W("",!0),s(st,{appear:"","enter-active-class":"animated pulse"},{default:d(()=>[t.countdown>0?(M(),x(re,{key:0,color:"negative","text-color":"white",class:"q-mr-sm",onClick:t.reload},{default:d(()=>[q(" Reload in "+de(t.countdown)+" ",1),t.countdown>0?(M(),x(dt,{key:0,size:"0.8em",thickness:10,class:"q-ml-sm",color:"white"})):W("",!0)]),_:1},8,["onClick"])):W("",!0)]),_:1}),s(Me,{flat:"",dense:"",round:"",size:"0.8em",icon:t.countdown>0?"close":"refresh",color:t.countdown>0?"negative":"primary","aria-label":"Refresh",onClick:t.reload,disable:t.uiStore.globalMutexLock&&t.countdown===0},null,8,["icon","color","onClick","disable"])]),_:1})]),_:1}),s(Tt,{modelValue:t.leftDrawerOpen,"onUpdate:modelValue":o[0]||(o[0]=f=>t.leftDrawerOpen=f),bordered:""},{default:d(()=>[s(mt,null,{default:d(()=>[s(T,{header:""},{default:d(()=>o[3]||(o[3]=[q("Settings ")])),_:1}),s(fe,{clickable:"",to:"/settings"},{default:d(()=>[s(I,{avatar:""},{default:d(()=>[s(se,{name:"settings"})]),_:1}),s(I,null,{default:d(()=>[s(T,null,{default:d(()=>o[4]||(o[4]=[q("Settings")])),_:1}),s(T,{caption:""},{default:d(()=>o[5]||(o[5]=[q("Wallet configuration")])),_:1})]),_:1})]),_:1}),s(T,{header:""},{default:d(()=>o[6]||(o[6]=[q("Terms ")])),_:1}),s(fe,{clickable:"",to:"/terms"},{default:d(()=>[s(I,{avatar:""},{default:d(()=>[s(se,{name:"gavel"})]),_:1}),s(I,null,{default:d(()=>[s(T,null,{default:d(()=>o[7]||(o[7]=[q("Terms")])),_:1}),s(T,{caption:""},{default:d(()=>o[8]||(o[8]=[q("Terms of Service")])),_:1})]),_:1})]),_:1}),s(T,{header:""},{default:d(()=>o[9]||(o[9]=[q("Links ")])),_:1}),(M(!0),qe(Te,null,ct(t.essentialLinks,f=>(M(),x(l,ft({key:f.title,ref_for:!0},f),null,16))),128))]),_:1})]),_:1},8,["modelValue"])],64)}var Qt=me(xt,[["render",Ot],["__scopeId","data-v-60a6e6be"]]);const It=ve({name:"MainLayout",mixins:[windowMixin],components:{MainHeader:Qt}});function Pt(t,o,i,h,e,n){const l=ce("MainHeader"),f=ce("router-view");return M(),x(Ue,{view:"lHh Lpr lFf"},{default:d(()=>[s(l),s(je,null,{default:d(()=>[s(f)]),_:1})]),_:1})}var ea=me(It,[["render",Pt]]);export{ea as default};
