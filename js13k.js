function SfxrParams(){this.setSettings=function(t){for(var e=0;24>e;e++)this[String.fromCharCode(97+e)]=t[e]||0;this.c<.01&&(this.c=.01);var i=this.b+this.c+this.e;if(.18>i){var s=.18/i;this.b*=s,this.c*=s,this.e*=s}}}function SfxrSynth(){this._params=new SfxrParams;var t,e,i,s,a,n,h,r,o,c,d,p;this.reset=function(){var t=this._params;s=100/(t.f*t.f+.001),a=100/(t.g*t.g+.001),n=1-t.h*t.h*t.h*.01,h=-t.i*t.i*t.i*1e-6,t.a||(d=.5-t.n/2,p=5e-5*-t.o),r=1+t.l*t.l*(t.l>0?-.9:10),o=0,c=1==t.m?0:(1-t.m)*(1-t.m)*2e4+32},this.totalReset=function(){this.reset();var s=this._params;return t=s.b*s.b*1e5,e=s.c*s.c*1e5,i=s.e*s.e*1e5+12,3*((t+e+i)/3|0)},this.synthWave=function(u,v){var l=this._params,f=1!=l.s||l.v,g=l.v*l.v*.1,y=1+3e-4*l.w,w=l.s*l.s*l.s*.1,I=1+1e-4*l.t,m=1!=l.s,b=l.x*l.x,k=l.g,x=l.q||l.r,E=l.r*l.r*l.r*.2,T=l.q*l.q*(l.q<0?-1020:1020),S=l.p?((1-l.p)*(1-l.p)*2e4|0)+32:0,A=l.d,M=l.j/2,L=l.k*l.k*.01,O=l.a,W=t,X=1/t,Y=1/e,G=1/i,C=5/(1+l.u*l.u*20)*(.01+w);C>.8&&(C=.8),C=1-C;for(var P,q,B,R,_,j,D=!1,K=0,U=0,F=0,N=0,z=0,H=0,J=0,Q=0,V=0,Z=0,$=new Array(1024),te=new Array(32),ee=$.length;ee--;)$[ee]=0;for(var ee=te.length;ee--;)te[ee]=2*Math.random()-1;for(var ee=0;v>ee;ee++){if(D)return ee;if(S&&++V>=S&&(V=0,this.reset()),c&&++o>=c&&(c=0,s*=r),n+=h,s*=n,s>a&&(s=a,k>0&&(D=!0)),q=s,M>0&&(Z+=L,q*=1+Math.sin(Z)*M),q|=0,8>q&&(q=8),O||(d+=p,0>d?d=0:d>.5&&(d=.5)),++U>W)switch(U=0,++K){case 1:W=e;break;case 2:W=i}switch(K){case 0:F=U*X;break;case 1:F=1+2*(1-U*Y)*A;break;case 2:F=1-U*G;break;case 3:F=0,D=!0}x&&(T+=E,B=0|T,0>B?B=-B:B>1023&&(B=1023)),f&&y&&(g*=y,1e-5>g?g=1e-5:g>.1&&(g=.1)),j=0;for(var ie=8;ie--;){if(J++,J>=q&&(J%=q,3==O))for(var se=te.length;se--;)te[se]=2*Math.random()-1;switch(O){case 0:_=d>J/q?.5:-.5;break;case 1:_=1-J/q*2;break;case 2:R=J/q,R=6.28318531*(R>.5?R-1:R),_=1.27323954*R+.405284735*R*R*(0>R?1:-1),_=.225*((0>_?-1:1)*_*_-_)+_;break;case 3:_=te[Math.abs(32*J/q|0)]}f&&(P=H,w*=I,0>w?w=0:w>.1&&(w=.1),m?(z+=(_-H)*w,z*=C):(H=_,z=0),H+=z,N+=H-P,N*=1-g,_=N),x&&($[Q%1024]=_,_+=$[(Q-B+1024)%1024],Q++),j+=_}j*=.125*F*b,u[ee]=j>=1?32767:-1>=j?-32768:32767*j|0}return v}}var synth=new SfxrSynth;window.jsfxr=function(t){synth._params.setSettings(t);var e=synth.totalReset(),i=new Uint8Array(4*((e+1)/2|0)+44),s=2*synth.synthWave(new Uint16Array(i.buffer,44),e),a=new Uint32Array(i.buffer,0,44);a[0]=1179011410,a[1]=s+36,a[2]=1163280727,a[3]=544501094,a[4]=16,a[5]=65537,a[6]=44100,a[7]=88200,a[8]=1048578,a[9]=1635017060,a[10]=s,s+=44;for(var n=0,h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r="data:audio/wav;base64,";s>n;n+=3){var o=i[n]<<16|i[n+1]<<8|i[n+2];r+=h[o>>18]+h[o>>12&63]+h[o>>6&63]+h[63&o]}return r};var ArcadeAudio=function(){this.sounds={}};ArcadeAudio.prototype.add=function(t,e,i){this.sounds[t]=[],i.forEach(function(i,s){this.sounds[t].push({tick:0,count:e,pool:[]});for(var a=0;e>a;a++){var n=new Audio;n.src=jsfxr(i),this.sounds[t][s].pool.push(n)}},this)},ArcadeAudio.prototype.play=function(t){var e=this.sounds[t],i=e.length>1?e[Math.floor(Math.random()*e.length)]:e[0];i.pool[i.tick].play(),i.tick=i.tick<i.count-1?i.tick+1:0};var Emitter=function(){};Emitter.prototype.update=function(){},Emitter.prototype.draw=function(){},window.raf=function(){return window.requestAnimationFrame||function(t){window.setTimeout(t,1e3/60)}}();var Game=function(t,e){var i=window.document;this.canvas=i.createElement("canvas"),this.canvas.width=t,this.canvas.height=e,this.fps=1e3/60,this.ctx=this.canvas.getContext("2d"),i.getElementsByTagName("body")[0].appendChild(this.canvas),this.io=new IO(this.canvas,this),this.sounds=new ArcadeAudio,this.player=new Wisp(this,this.canvas.width/2,this.canvas.height/2,"user"),this.cpus=[new Wisp(this,Math.random()*this.canvas.width,Math.random()*this.canvas.height),new Wisp(this,Math.random()*this.canvas.width,Math.random()*this.canvas.height),new Wisp(this,Math.random()*this.canvas.width,Math.random()*this.canvas.height)];for(var s,a=0,n=this.cpus.length;n>a;a++)s=Math.random(),this.cpus[a].state=s>.75?"earth":s>.5?"air":s>.25?"water":"fire"};Game.prototype.start=function(){var t=this;this.interval=window.setInterval(function(){t.update()},this.fps),this.tick()},Game.prototype.pause=function(){window.clearInterval(this.interval),delete this.interval},Game.prototype.update=function(){this.player.update(this.io.activeInput);for(var t=0,e=this.cpus.length;e>t;t++)this.cpus[t].update()},Game.prototype.render=function(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.ctx.fillStyle="#ccc",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height),this.player.render(this.ctx);for(var t=0,e=this.cpus.length;e>t;t++)this.cpus[t].render(this.ctx)},Game.prototype.tick=function(){this.interval&&(this.render(),window.raf(this.tick.bind(this)))};var IO=function(t){this.el=t,this.ongoingTouches=[],this.delegate=this,this.addEvents(),this.activeInput={earth:!1,water:!1,air:!1,fire:!1,up:!1,down:!1,left:!1,right:!1}};IO.prototype.addEvents=function(){this.el.addEventListener("touchstart",this.delegate.handleEvent.bind(this.delegate),!1),this.el.addEventListener("touchmove",this.delegate.handleEvent.bind(this.delegate),!1),this.el.addEventListener("touchend",this.delegate.handleEvent.bind(this.delegate),!1),this.el.addEventListener("touchcancel",this.delegate.handleEvent.bind(this.delegate),!1),window.addEventListener("keydown",this.delegate.handleEvent.bind(this.delegate),!0),window.addEventListener("keyup",this.delegate.handleEvent.bind(this.delegate),!0)},IO.prototype.removeEvents=function(){this.el.removeEventListener("touchstart",this.delegate.handleEvent.bind(this.delegate),!1),this.el.removeEventListener("touchmove",this.delegate.handleEvent.bind(this.delegate),!1),this.el.removeEventListener("touchend",this.delegate.handleEvent.bind(this.delegate),!1),this.el.removeEventListener("touchcancel",this.delegate.handleEvent.bind(this.delegate),!1),window.removeEventListener("keydown",this.delegate.handleEvent.bind(this.delegate),!0),window.removeEventListener("keyup",this.delegate.handleEvent.bind(this.delegate),!0)},IO.prototype.handleEvent=function(t){switch(t.type){case"keydown":this.setKeyState(t.keyCode,!0);break;case"keyup":this.setKeyState(t.keyCode,!1);break;case"touchstart":this.handleTouchStart(t);break;case"touchmove":this.handleTouchMove(t);break;case"touchend":case"touchcancel":this.handleTouchEnd(t)}},IO.prototype.copyTouch=function(t,e){return{identifier:t.identifier,startX:e?e.startX:t.pageX,startY:e?e.startY:t.pageY,pageX:t.pageX,pageY:t.pageY}},IO.prototype.ongoingTouchIndexById=function(t){var e,i,s;for(e=0,i=this.ongoingTouches.length;i>e;e++)if(s=this.ongoingTouches[e].identifier,s===t)return e;return-1},IO.prototype.handleTouchStart=function(t){t.preventDefault();var e,i,s;for(s=t.changedTouches,e=0,i=s.length;i>e;e++)this.ongoingTouches.push(this.copyTouch(s[e]))},IO.prototype.handleTouchMove=function(t){t.preventDefault();var e,i,s,a;for(s=t.changedTouches,e=0,i=s.length;i>e;e++)a=this.ongoingTouchIndexById(s[e].identifier),a>=0&&this.ongoingTouches.splice(a,1,this.copyTouch(s[e],this.ongoingTouches[a]));this.updateActiveInput()},IO.prototype.handleTouchEnd=function(t){t.preventDefault();var e,i,s,a;for(s=t.changedTouches,e=0,i=s.length;i>e;e++)a=this.ongoingTouchIndexById(s[e].identifier),a>=0&&this.ongoingTouches.splice(a,1);this.updateActiveInput()},IO.prototype.updateActiveInput=function(){var t,e,i,s,a;a=32,t=this.ongoingTouches[0]||!1,t&&(i=t.pageX-t.startX,s=t.pageY-t.startY,i>a?(this.activeInput.left=!1,this.activeInput.right=!0):-a>i?(this.activeInput.left=!0,this.activeInput.right=!1):this.activeInput.left=this.activeInput.right=!1,s>a?(this.activeInput.up=!1,this.activeInput.down=!0):-a>s?(this.activeInput.up=!0,this.activeInput.down=!1):this.activeInput.up=this.activeInput.down=!1),e=this.ongoingTouches[1]||!1,e&&(i=e.pageX-e.startX,s=e.pageY-e.startY,this.activeInput.earth=!1,this.activeInput.water=!1,this.activeInput.air=!1,this.activeInput.fire=!1,i>a?i>s&&i>-s&&(this.activeInput.earth=!0):-a>i?-i>s&&-i>-s&&(this.activeInput.air=!0):s>a?s>i&&s>-i&&(this.activeInput.water=!0):-a>s&&-s>i&&-s>-i&&(this.activeInput.fire=!0))},IO.prototype.setKeyState=function(t,e){switch(t){case 49:e?(this.activeInput.earth=!0,this.activeInput.water=!1,this.activeInput.air=!1,this.activeInput.fire=!1):this.activeInput.earth=!1;break;case 50:e?(this.activeInput.earth=!1,this.activeInput.water=!0,this.activeInput.air=!1,this.activeInput.fire=!1):this.activeInput.water=!1;break;case 51:e?(this.activeInput.earth=!1,this.activeInput.water=!1,this.activeInput.air=!0,this.activeInput.fire=!1):this.activeInput.air=!1;break;case 52:e?(this.activeInput.earth=!1,this.activeInput.water=!1,this.activeInput.air=!1,this.activeInput.fire=!0):this.activeInput.fire=!1;break;case 37:this.activeInput.left=e;break;case 39:this.activeInput.right=e;break;case 38:this.activeInput.up=e;break;case 40:this.activeInput.down=e}};var Wisp=function(t,e,i,s){this.game=t,this.type=s||"cpu",this.game.sounds.add("fire",10,[[3,.25,.27,.76,.54,.5571,,.1799,-.0999,.0035,.56,-.6597,.61,.0862,-.8256,,.5,.5,.71,-.0181,,.0368,.0333,.5]]),this.game.sounds.add("air",10,[[3,.33,.89,.25,.81,.4692,,-.0122,.0113,-.5995,.23,-.54,-.1575,,.2234,.84,-.4,.6599,.17,-.3399,.96,.25,.72,.5]]),this.position={x:e||0,y:i||0},this.speed={x:0,y:0},this.PI2=2*Math.PI,this.accelerate=1,this.maxSpeed=5,this.state="normal"};Wisp.prototype.update=function(t){"user"===this.type?(t.left&&(this.speed.x-=this.accelerate),t.right&&(this.speed.x+=this.accelerate),t.up&&(this.speed.y-=this.accelerate),t.down&&(this.speed.y+=this.accelerate)):"cpu"===this.type&&(this.speed.x+=5*Math.random()-2.5,this.speed.y+=5*Math.random()-2.5),this.speed.x>this.maxSpeed?this.speed.x=this.maxSpeed:this.speed.x<-this.maxSpeed&&(this.speed.x=-this.maxSpeed),this.speed.x*=.9,this.speed.y*=.9,this.position.x+=this.speed.x,this.position.y+=this.speed.y,this.position.x>this.game.canvas.width?this.position.x-=this.game.canvas.width:this.position.x<0&&(this.position.x+=this.game.canvas.width),this.position.y>this.game.canvas.height?(this.position.y=this.game.canvas.height,this.speed.y=-this.speed.y):this.position.y<0&&(this.position.y=0,this.speed.y=-this.speed.y),"user"===this.type&&(this.state=t.earth?"earth":t.water?"water":t.air?"air":t.fire?"fire":"normal")},Wisp.prototype.render=function(t){switch(t.save(),t.translate(this.position.x,this.position.y),t.beginPath(),t.arc(0,0,10,0,this.PI2,!1),this.state){case"earth":t.fillStyle="#0f0";break;case"water":t.fillStyle="#00f";break;case"air":t.fillStyle="rgba(255, 255, 255, 0.5)";break;case"fire":t.fillStyle="#f00";break;default:t.fillStyle="#fff"}t.fill(),t.restore()},window.onload=function(){var t=new Game(320,480);t.start()};