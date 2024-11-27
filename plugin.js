function C(e){return{id:e.id,name:e.name,path:e.path,color:e.color,opacity:e.opacity,refId:e.id,refFile:e.libraryId,gradient:e.gradient,image:e.image}}const u="fills",g="strokes",y="shadows",_="children";function m(e,i,n){const o=new Map;for(const[t,r]of i.colors)o.set(r.id,t);if(!(o.size<=0))for(;e.length>0;){const t=e.pop();if(!t)break;if(P(t,o,n.colors),_ in t&&t[_])for(const r of t[_])e.push(r)}}function P(e,i,n){if(u in e&&e[u]instanceof Array){const o=[];let t=!1;for(const r of e[u]){const a=i.get(r.fillColorRefId??""),s=n.get(a??"");s?(o.push(s.asFill()),t=!0):o.push(r)}t&&(e[u]=o)}if(g in e&&e[g]instanceof Array){const o=[];let t=!1;for(const r of e[g]){const a=i.get(r.strokeColorRefId??""),s=n.get(a??"");s?(o.push(s.asStroke()),t=!0):o.push(r)}t&&(e[g]=o)}if(y in e&&e[y]instanceof Array){const o=[];let t=!1;for(const r of e[y]){const a=r.color;if(!a)continue;const s=i.get(a.name??""),c=n.get(s??"");if(!c){o.push(r);continue}t=!0;const f=C(c),l=r;l.color=f,o.push(l)}t&&(e[y]=o)}}const b=new Map,w=new Map;let d;b.set(penpot.library.local.id,{id:penpot.library.local.id,name:"Local",type:"Library"});R(penpot.library.local);for(const e of penpot.library.connected)R(e),b.set(e.id,{id:e.id,name:e.name,type:"Library"});penpot.ui.open("Palette Swapper",`?theme=${penpot.theme}`);penpot.ui.onMessage(e=>{var i,n,o;if(e.type=="view-will-build"&&h({type:"build_initial_ui",data:Array.from(b.values())}),e.type=="retrieve_palettes_from_library"){const t=e.data;if(!t||t instanceof Array)return;const r=w.get(t.id);if(!r)return;const a=[];for(const[s,c]of r)a.push(c.reference);h({type:"build_palette_dropdown",data:a,from:e.from})}if(e.type=="swap"){const t=e.data;if(!t||!(t instanceof Array))return;const r=t[0],a=t[1],s=t[2],c=t[3],f=e.extra,l=(i=w.get(r.id))==null?void 0:i.get(a.name),L=(n=w.get(s.id))==null?void 0:n.get(c.name),p=[];if(f=="Global"&&((o=penpot.currentFile)!=null&&o.pages))for(const S of penpot.currentFile.pages)p.push(S.root);else f=="Local"&&penpot.root&&p.push(penpot.root);if(!l||!L||p.length<=0)return;d={previousPalette:l,currentPalette:L,effectRange:f,shapes:[...p]},m(p,l,L),h({type:"finished_swapping",extra:!0})}if(e.type=="revert"){if(!d)return;m(d.shapes,d.currentPalette,d.previousPalette),h({type:"finished_swapping",extra:!1})}});penpot.on("themechange",e=>{penpot.ui.sendMessage({type:"theme_change",theme:e})});function h(e){penpot.ui.sendMessage(e)}function R(e){const i=new Map;for(const n of e.colors){if(n.path.length<=0)continue;const o=i.get(n.path);if(o)o.colors.set(n.name,n);else{const t=new Map;t.set(n.name,n),i.set(n.path,{reference:{id:n.path,name:n.path,type:"Color"},colors:t})}}w.set(e.id,i)}
