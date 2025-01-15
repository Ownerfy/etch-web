import{b as p,Q as d,a}from"./QItem.02426fde.js";import{j as S,as as x,au as q,at as _,K as k,V as C,L as i,W as m,Z as l,Q as t,O as r,T as n,X as g,M as c,S as y,U as M,a1 as v,a2 as R,R as E}from"./index.927995fe.js";import{Q as A,g as B}from"./QInput.fdef4d8c.js";import{a as f,Q as F}from"./QList.52d670e3.js";import{Q as z}from"./QSpinnerHourglass.7bb7d380.js";import{Q as I}from"./QLinearProgress.7906e966.js";import{M as L,g as w,G as N,d as P,f as U,u as W}from"./ui.d5c1e1dd.js";import{u as b}from"./restore.ec396540.js";import"./use-dark.3625dc1e.js";import"./private.use-form.a5fba0e4.js";import"./index.463654f8.js";const j=S({name:"RestoreView",mixins:[windowMixin],data(){return{mnemonicError:"",restoreAllMintsText:"Restore All Mints"}},computed:{...x(P,["mints"]),...q(U,["mnemonic"]),...q(b,["mnemonicToRestore","restoreProgress"]),...x(b,["restoringState","restoringMint","restoreStatus"]),isMnemonicValid(){return this.mnemonicToRestore?this.mnemonicToRestore.trim().split(/\s+/).length>=12:!1}},methods:{..._(b,["restoreMint"]),..._(W,["pasteFromClipboard"]),mintClass(e){return new L(e)},validateMnemonic(){return this.mnemonicToRestore.trim().split(/\s+/).length<12?(this.mnemonicError="Mnemonic should be at least 12 words.",!1):(this.mnemonicError="",!0)},async restoreMintForMint(e){if(!!this.validateMnemonic())try{this.restoreAllMintsText="Restoring mint ...",await this.restoreMint(e)}catch(s){console.error("Error restoring mint:",s),w(`Error restoring mint: ${s.message||s}`)}finally{this.restoreAllMintsText="Restore All Mints"}},async pasteMnemonic(){try{const e=await this.pasteFromClipboard();this.mnemonicToRestore=e.trim()}catch{w("Failed to read clipboard contents.")}},async restoreAllMints(){let e=0;if(!!this.validateMnemonic())try{for(const s of this.mints)this.restoreAllMintsText=`Restoring mint ${++e} of ${this.mints.length} ...`,await this.restoreMint(s.url);N("Restore finished successfully")}catch(s){console.error("Error restoring mints:",s),w(`Error restoring mints: ${s.message||s}`)}finally{this.restoreAllMintsText="Restore All Mints"}}}}),D={style:{"max-width":"800px",margin:"0 auto"}},G={class:"q-px-xs text-left","on-left":""},H={class:"row q-pt-md"},K={class:"col-12"},O={class:"q-px-xs text-left","on-left":""},X={class:"q-px-xs text-left q-mt-md","on-left":""},Y={class:"q-pb-md q-px-xs text-left","on-left":""};function Z(e,s,Q,T,$,V){const h=C("q-span");return i(),m("div",D,[l("div",G,[t(f,{padding:""},{default:r(()=>[t(p,null,{default:r(()=>[t(d,null,{default:r(()=>[t(a,{overline:"",class:"text-weight-bold"},{default:r(()=>s[1]||(s[1]=[n(" Restore from Seed Phrase ")])),_:1}),t(a,{caption:""},{default:r(()=>s[2]||(s[2]=[n(" Enter your seed phrase to restore your wallet. Before you restore, make sure you have added all the mints that you have used before. ")])),_:1}),l("div",H,[l("div",K,[t(A,{outlined:"",modelValue:e.mnemonicToRestore,"onUpdate:modelValue":s[0]||(s[0]=o=>e.mnemonicToRestore=o),label:"Seed phrase",autogrow:"",type:"textarea",error:e.mnemonicError!=="","error-message":e.mnemonicError},{append:r(()=>[t(g,{flat:"",dense:"",icon:"content_paste",onClick:e.pasteMnemonic,class:"cursor-pointer q-mt-md"},null,8,["onClick"])]),_:1},8,["modelValue","error","error-message"])])])]),_:1})]),_:1})]),_:1})]),l("div",O,[t(f,{padding:""},{default:r(()=>[t(p,null,{default:r(()=>[t(d,null,{default:r(()=>[t(a,{overline:"",class:"text-weight-bold"},{default:r(()=>s[3]||(s[3]=[n(" Information ")])),_:1}),t(a,{caption:""},{default:r(()=>s[4]||(s[4]=[n(" The wizard will only "),l("i",null,"restore",-1),n(" ecash from another seed phrase, you will not be able to use this seed phrase or change the seed phrase of the wallet that you're currently using. This means that restored ecash will not be protected by your current seed phrase as long as you don't send the ecash to yourself once. ")])),_:1})]),_:1})]),_:1})]),_:1})]),l("div",X,[t(f,{padding:""},{default:r(()=>[t(p,null,{default:r(()=>[t(d,null,{default:r(()=>[t(a,{overline:"",class:"text-weight-bold"},{default:r(()=>s[5]||(s[5]=[n(" Restore Mints ")])),_:1}),t(a,{caption:""},{default:r(()=>s[6]||(s[6]=[n(' Select the mint to restore. You can add more mints in the main screen under "Mints" and restore them here. ')])),_:1})]),_:1})]),_:1})]),_:1})]),l("div",Y,[t(g,{class:"q-ml-sm q-px-md",color:"primary",size:"md",rounded:"",dense:"",outline:"",onClick:e.restoreAllMints,disabled:!e.isMnemonicValid||e.restoringState},{default:r(()=>[e.restoringState?(i(),c(z,{key:0,size:"sm",class:"q-mr-sm"})):y("",!0),n(" "+M(e.restoreAllMintsText),1)]),_:1},8,["onClick","disabled"]),t(f,{padding:"",class:"q-pt-md"},{default:r(()=>[(i(!0),m(v,null,R(e.mints,o=>(i(),m("div",{key:o.url},[t(p,null,{default:r(()=>[t(d,null,{default:r(()=>[t(a,{class:"q-mb-xs",lines:"1",style:{"word-break":"break-all","overflow-wrap":"break-word","white-space":"normal"}},{default:r(()=>[t(E,{name:"account_balance",size:"xs",class:"q-ml-xs q-mb-xs"}),t(h,{class:"q-ma-xs",style:{"font-size":"15px"}},{default:r(()=>[n(M(o.nickname||o.url),1)]),_:2},1024)]),_:2},1024),t(a,null,{default:r(()=>[(i(!0),m(v,null,R(e.mintClass(o).units,u=>(i(),c(F,{key:u,color:"primary",label:e.formatCurrency(e.mintClass(o).unitBalance(u),u),class:"q-mx-xs q-mb-xs"},null,8,["label"]))),128))]),_:2},1024),e.restoringMint===o.url?(i(),c(a,{key:0,class:"q-px-xs q-pt-xs q-pb-xs",caption:""},{default:r(()=>[n(M(e.restoreStatus),1)]),_:1})):y("",!0),e.restoringMint===o.url?(i(),c(I,{key:1,value:e.restoreProgress,color:"primary",class:"q-pl-md",style:{"max-width":"630px"}},null,8,["value"])):y("",!0)]),_:2},1024),t(d,{side:""},{default:r(()=>[t(g,{class:"q-ml-sm q-px-md",color:"primary",size:"md",rounded:"",dense:"",outline:"",onClick:u=>e.restoreMintForMint(o.url),disabled:!e.isMnemonicValid||e.restoringState,loading:e.restoringMint===o.url},{default:r(()=>s[7]||(s[7]=[n(" Restore ")])),_:2},1032,["onClick","disabled","loading"])]),_:2},1024)]),_:2},1024),t(B,{spaced:""})]))),128))]),_:1})])])}var J=k(j,[["render",Z]]);const ee=S({name:"ErrorNotFound",components:{RestoreView:J}}),te={class:"bg-dark text-white text-center q-pa-md flex flex-center"};function se(e,s,Q,T,$,V){const h=C("RestoreView");return i(),m("div",te,[t(h)])}var fe=k(ee,[["render",se]]);export{fe as default};
