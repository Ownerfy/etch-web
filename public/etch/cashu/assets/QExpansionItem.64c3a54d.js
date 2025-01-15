import{B as H,F as j,k as a,Y as J,aQ as W,ae as P,r as Q,E as h,w as k,f as X,G as Z,aR as p,I as ee,R as A,A as te}from"./index.927995fe.js";import{b as ne,a as B,Q as q}from"./QItem.02426fde.js";import{h as ae,u as ie,g as O}from"./QInput.fdef4d8c.js";import{u as oe,a as le}from"./use-dark.3625dc1e.js";import{u as ue,a as re,c as se}from"./use-timeout.afd034c5.js";var de=H({name:"QSlideTransition",props:{appear:Boolean,duration:{type:Number,default:300}},emits:["show","hide"],setup(e,{slots:I,emit:T}){let s=!1,m,i,o=null,l=null,d,S;function b(){m&&m(),m=null,s=!1,o!==null&&(clearTimeout(o),o=null),l!==null&&(clearTimeout(l),l=null),i!==void 0&&i.removeEventListener("transitionend",d),d=null}function u(n,r,g){r!==void 0&&(n.style.height=`${r}px`),n.style.transition=`height ${e.duration}ms cubic-bezier(.25, .8, .50, 1)`,s=!0,m=g}function c(n,r){n.style.overflowY=null,n.style.height=null,n.style.transition=null,b(),r!==S&&T(r)}function y(n,r){let g=0;i=n,s===!0?(b(),g=n.offsetHeight===n.scrollHeight?0:void 0):(S="hide",n.style.overflowY="hidden"),u(n,g,r),o=setTimeout(()=>{o=null,n.style.height=`${n.scrollHeight}px`,d=f=>{l=null,(Object(f)!==f||f.target===n)&&c(n,"show")},n.addEventListener("transitionend",d),l=setTimeout(d,e.duration*1.1)},100)}function L(n,r){let g;i=n,s===!0?b():(S="show",n.style.overflowY="hidden",g=n.scrollHeight),u(n,g,r),o=setTimeout(()=>{o=null,n.style.height=0,d=f=>{l=null,(Object(f)!==f||f.target===n)&&c(n,"hide")},n.addEventListener("transitionend",d),l=setTimeout(d,e.duration*1.1)},100)}return j(()=>{s===!0&&b()}),()=>a(J,{css:!1,appear:e.appear,onEnter:y,onLeave:L},I.default)}});const x=W({}),ce=Object.keys(P);var be=H({name:"QExpansionItem",props:{...P,...ue,...oe,icon:String,label:String,labelLines:[Number,String],caption:String,captionLines:[Number,String],dense:Boolean,toggleAriaLabel:String,expandIcon:String,expandedIcon:String,expandIconClass:[Array,String,Object],duration:{},headerInsetLevel:Number,contentInsetLevel:Number,expandSeparator:Boolean,defaultOpened:Boolean,hideExpandIcon:Boolean,expandIconToggle:Boolean,switchToggleSide:Boolean,denseToggle:Boolean,group:String,popup:Boolean,headerStyle:[Array,String,Object],headerClass:[Array,String,Object]},emits:[...re,"click","afterShow","afterHide"],setup(e,{slots:I,emit:T}){const{proxy:{$q:s}}=X(),m=le(e,s),i=Q(e.modelValue!==null?e.modelValue:e.defaultOpened),o=Q(null),l=ae(),{show:d,hide:S,toggle:b}=se({showing:i});let u,c;const y=h(()=>`q-expansion-item q-item-type q-expansion-item--${i.value===!0?"expanded":"collapsed"} q-expansion-item--${e.popup===!0?"popup":"standard"}`),L=h(()=>{if(e.contentInsetLevel===void 0)return null;const t=s.lang.rtl===!0?"Right":"Left";return{["padding"+t]:e.contentInsetLevel*56+"px"}}),n=h(()=>e.disable!==!0&&(e.href!==void 0||e.to!==void 0&&e.to!==null&&e.to!=="")),r=h(()=>{const t={};return ce.forEach(v=>{t[v]=e[v]}),t}),g=h(()=>n.value===!0||e.expandIconToggle!==!0),f=h(()=>e.expandedIcon!==void 0&&i.value===!0?e.expandedIcon:e.expandIcon||s.iconSet.expansionItem[e.denseToggle===!0?"denseIcon":"icon"]),R=h(()=>e.disable!==!0&&(n.value===!0||e.expandIconToggle===!0)),$=h(()=>({expanded:i.value===!0,detailsId:l.value,toggle:b,show:d,hide:S})),_=h(()=>{const t=e.toggleAriaLabel!==void 0?e.toggleAriaLabel:s.lang.label[i.value===!0?"collapse":"expand"](e.label);return{role:"button","aria-expanded":i.value===!0?"true":"false","aria-controls":l.value,"aria-label":t}});k(()=>e.group,t=>{c!==void 0&&c(),t!==void 0&&E()});function N(t){n.value!==!0&&b(t),T("click",t)}function D(t){t.keyCode===13&&C(t,!0)}function C(t,v){v!==!0&&o.value!==null&&o.value.focus(),b(t),te(t)}function G(){T("afterShow")}function Y(){T("afterHide")}function E(){u===void 0&&(u=ie()),i.value===!0&&(x[e.group]=u);const t=k(i,w=>{w===!0?x[e.group]=u:x[e.group]===u&&delete x[e.group]}),v=k(()=>x[e.group],(w,z)=>{z===u&&w!==void 0&&w!==u&&S()});c=()=>{t(),v(),x[e.group]===u&&delete x[e.group],c=void 0}}function F(){const t={class:[`q-focusable relative-position cursor-pointer${e.denseToggle===!0&&e.switchToggleSide===!0?" items-end":""}`,e.expandIconClass],side:e.switchToggleSide!==!0,avatar:e.switchToggleSide},v=[a(A,{class:"q-expansion-item__toggle-icon"+(e.expandedIcon===void 0&&i.value===!0?" q-expansion-item__toggle-icon--rotated":""),name:f.value})];return R.value===!0&&(Object.assign(t,{tabindex:0,..._.value,onClick:C,onKeyup:D}),v.unshift(a("div",{ref:o,class:"q-expansion-item__toggle-focus q-icon q-focus-helper q-focus-helper--rounded",tabindex:-1}))),a(q,t,()=>v)}function K(){let t;return I.header!==void 0?t=[].concat(I.header($.value)):(t=[a(q,()=>[a(B,{lines:e.labelLines},()=>e.label||""),e.caption?a(B,{lines:e.captionLines,caption:!0},()=>e.caption):null])],e.icon&&t[e.switchToggleSide===!0?"push":"unshift"](a(q,{side:e.switchToggleSide===!0,avatar:e.switchToggleSide!==!0},()=>a(A,{name:e.icon})))),e.disable!==!0&&e.hideExpandIcon!==!0&&t[e.switchToggleSide===!0?"unshift":"push"](F()),t}function M(){const t={ref:"item",style:e.headerStyle,class:e.headerClass,dark:m.value,disable:e.disable,dense:e.dense,insetLevel:e.headerInsetLevel};return g.value===!0&&(t.clickable=!0,t.onClick=N,Object.assign(t,n.value===!0?r.value:_.value)),a(ne,t,K)}function U(){return Z(a("div",{key:"e-content",class:"q-expansion-item__content relative-position",style:L.value,id:l.value},ee(I.default)),[[p,i.value]])}function V(){const t=[M(),a(de,{duration:e.duration,onShow:G,onHide:Y},U)];return e.expandSeparator===!0&&t.push(a(O,{class:"q-expansion-item__border q-expansion-item__border--top absolute-top",dark:m.value}),a(O,{class:"q-expansion-item__border q-expansion-item__border--bottom absolute-bottom",dark:m.value})),t}return e.group!==void 0&&E(),j(()=>{c!==void 0&&c()}),()=>a("div",{class:y.value},[a("div",{class:"q-expansion-item__container relative-position"},V())])}});export{be as Q};
