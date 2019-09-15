const
Scan	= (function(){

	let	w=0,h=0,context,
		paused = false;
	
	const

	Barcode	=(function(){

		const
		
		EAN13	=(function(){
			
			const	EAN	={ "3211":"0", "2221":"1", "2122":"2", "1411":"3", "1132":"4", "1231":"5", "1114":"6", "1312":"7", "1213":"8", "3112":"9" },
				HED	={ "LLLLLL":"0", "LLGLGG":"1", "LLGGLG":"2", "LLGGGL":"3", "LGLLGG":"4", "LGGLLG":"5", "LGGGLL":"6", "LGLGLG":"7", "LGLGGL":"8", "LGGLGL":"9" },
				
				GRDS=3,
				DIGS=6*4,
				MIDS=5,
				BARS=GRDS+DIGS+MIDS+DIGS+GRDS,
				
			fit3	= (spans,o)=>{
				const	r0=spans[o+0]+2, r1=spans[o+1]+2, r2=spans[o+2]+2, half=(r0+r1+r2)/2;
				return r0<half && r1<half && r2<half;
			},
			
			group	= (spans,o,count,left)=>{
				
				const
				WDTH = 7,
				THIN = 1,
				WIDE = 4,
				TRIES= 6;
				
				let	digits=[],
					p=[],
					parity="",
					unit=(spans[o+0]+spans[o+1]+spans[o+2]+spans[o+3])/WDTH;
						
				for(let dig=0; dig<count; dig++, o+=4 )
				{
					let	gap,
						tries=0,
						d;
					do{	
						const u=1.0/unit;
						gap=WDTH;
						for(let i=0; i<4; i++) gap-=(p[i]=Math.round(u*spans[o+i]));
						unit += unit * gap * .75;
					}while(gap!=0 && tries++<TRIES);
					
					const t=p.map(n=> n<THIN?THIN:n>WIDE?WIDE:n);
					parity += (d=EAN[t.join("")]) ? 'L' : (left && (d=EAN[t.reverse().join("")])) ? 'G' : gap;
					digits.push(d||'*');
				}
				if(left)
					digits.unshift(HED[parity]||"*");
						
				return	digits;
			},
			
			verify	= digits=>{				
				const	decoded = digits.join(""),
					unclear	= decoded.match(/\*/g);
					
				//console.log("decoded: "+decoded);
				if(unclear)return digits.length-unclear.length;
				
				let	check	= 10-digits.pop(),//[12],//
					sum	= digits.reduce((s,n,i)=>s+(i%2?3*n:1*n),0);
				
				return (sum%10 == check)&&decoded;
			};

			return	spans=>{
				const	HOPE=spans.length-BARS+4;
				let	left, right,decoded;
				for( let o=0; o <= HOPE; o++ )
					if(	fit3(spans,o) && fit3(spans,o+GRDS+DIGS)
						&& (left=group(spans,o+GRDS,6,true))
						&& (right=group(spans,o+GRDS+DIGS+MIDS,6,false))
						&& (decoded=verify(left.concat(right)))
					)
						return decoded;
			}
			
		})();

		extractSpans	= luma=>{
			
			const	spans	= luma, //recycle luma on the go
				samples	= luma.length,
				flat	= samples*5/(14*7),
				least	= 40;
		
			let	zone=luma[0],
				i=0, run=0, len=0;
				
			while( ++i < samples ){			
				if(zone*luma[i]<0){ //cross the 0
					zone=-zone;
					if( run > flat ){
						if( len < least ){
							spans[len=0]=i;
							zone=-1; //restart
						}
						else i=samples; //done
					}
					else spans[len]=run;
					len++;
					run=0;
				}
				run++;
			}
			
			return spans.slice(0,len);
		};

		return	filtered=>{
			const	spans=extractSpans(filtered);
			return	EAN13(spans)||EAN13(spans.reverse());
		}
	})(),

	luma	= rgba=>{
		const	c=rgba.length>>2,
			l=new Array(c);
		for(let i=0,j=0; i<c; i++,j+=4)
			l[i]=rgba[j]+rgba[j+1]+rgba[j+2];
		return l;
	},
	
	filter	={
		symm	: (Y,l,h)=>{
			
			const	r = unpass(Y.slice(0).reverse(),h,l).reverse(),
				s = unpass(Y,h,l);
				
			for(let x=Y.length; x-->0; ){
				r[x]+=s[x];
			}
			
			return r;
		},
		
		lopass	: (Y,k)=>{
			for(let x=Y.length, a0=Y[x-1], a=a0, b=a0; x-->0; ){
				a0	= Y[x];
				b	= Y[x] = b + k * (a0 - b);
				a	= a0;
			}
		},
		
		hipass	: (Y,k)=>{
			for(let x=Y.length, a0=Y[x-1], a=a0, b=a0; x-->0; ){
				a0	= Y[x];
				b	= Y[x] = k * (a0 + (b - a) );
				a	= a0;
			}
		}
	},

	hlpass	= (pixels,noise,drift)=>{
	
		const	bars=[],
			len=pixels.length,
	
			gain=1/(drift*noise);
		
		let	y=pixels[0],
			l=y;
			
		// forward pass
		for(let i=0; i<len; i++ ){
			y -= l;
			l += noise * (pixels[i] - l);
			y = drift * ( y + l );
			bars[i]=y*gain;
		}
		
		// backward pass
		for(let i=len; i-->0; ){
			y -= l;
			l += noise * (pixels[i] - l);
			y = drift * ( y + l );
			bars[i]+=y*gain;
		}
		
		return bars;
	},
	
	osci	= (y,Y,a,style)=>{
		context.strokeStyle = style;			
		context.beginPath();
		context.moveTo(w,y);
		for(let x=w;x-->0;)
			context.lineTo(x,y+Y[x]*a);
		context.lineWidth=1;
		context.stroke();
	},
/**/	  
	scan	= lines=>{
		const step = h/lines;
		for(let l=0,decoded;l<lines;l++){
			const	y	= l*step
				pxluma	= luma(context.getImageData(0, y, w, 1).data),
				pxlow	= hlpass(pxluma,.05,.05),
				dec	= Barcode(pxlow);
				
			osci(y,pxlow,.05,'rgba(0,255,255,1)');
			
			context.beginPath();
			context.moveTo(0,y);
			context.lineTo(w,y);
			context.strokeStyle = dec>100?'green':dec>6?'red':'gray';			
			context.lineWidth = dec>100?10:dec||1;// decoded?8:1;
			context.stroke();

			if(decoded) return decoded;
		}
	},
	
	timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

	return	{
		
		start	: (video,canvas) => new Promise(async function(resolve,reject){
		
			await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).catch(reject)
			.then(stream=>video.srcObject=stream);

			const	lines	= 10,
				track	= video.srcObject.getVideoTracks()[0];
			
			let	decoded=null;
			
			while (track.readyState==="live" && !paused) {//!decoded&&
				if(video.videoWidth!=w){
					canvas.width	= w = video.videoWidth;
					canvas.height	= h = video.videoHeight;
					context = canvas.getContext('2d');
				}
				if(w){
					context.drawImage(video,0,0,w,h);
					decoded=scan(lines);
				}
				if(decoded)resolve(decoded); 
				else await timeout(paused?1e3:1e2);
			};
		}),
		
		stop	: video => video.srcObject.getVideoTracks()[0].stop(),
		
		pause	: () => (paused=!paused),
		
		execute	: where => new Promise(async function(resolve,reject){
			alert("version 3");
			const	el	= t=>document.createElement(t),
				scanner	= el("div"),
				video	= scanner.appendChild(el("video")),
				canvas	= scanner.appendChild(el("canvas")),
				cancel	= scanner.appendChild(el("button")),
				pause	= scanner.appendChild(el("button"));
				
			scanner.className = "scanner";
			video.autoplay	= true;
			cancel.onclick	= e => {Scan.stop(video); scanner.parentNode.removeChild(scanner)};
			pause.onclick	= e => {Scan.pause()};
			(where||document.body).appendChild(scanner);
			
			await Scan.start(video,canvas).then(resolve).catch(reject);
			//stop();
		})
		
	};

})();