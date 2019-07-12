const
Scan	= (function(){

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
						
				return digits;
			},
			
			verify	= digits=>{
				const decoded = digits.join("");
				//console.log("decoded: "+decoded);
				if(decoded.indexOf("*")>=0)return;
				
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

		return	luma=>{
			const	spans=extractSpans(lowpass(luma));
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

	lowpass	= pixels=>{
	
		const	bars=[],
			len=pixels.length,
	
			drift=.05,
			noise=.1,
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
	  
	scan	= (context,w,h,lines)=>{
		const step = h/lines;
		for(let l=0,decoded;l<lines;l++)
			if(decoded=Barcode(lowpass(luma(context.getImageData(0, l*step, w, 1).data))))
				return decoded;
	},
	
	timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

	return	{
		
		start	: video => new Promise(async function(resolve,reject){
		
			const	lines	= 12,
				w	= video.clientWidth,
				h	= video.clientHeight,
				canvas	= document.createElement("canvas"), //
				context = canvas.getContext('2d');
			
			canvas.width=w;
			canvas.height=h;
				
			let	decoded=null,
				track;
			
			await navigator.mediaDevices.getUserMedia({video: true}).catch(reject)
			.then(stream=>{
				video.srcObject=stream;
				track=stream.getVideoTracks()[0];
			});
			
			while (!decoded&&track.readyState==="live") {//(video.paused||)
				context.drawImage(video,0,0,w,h);
				if(decoded=scan(context,w,h,lines))
					resolve(decoded);
				else await timeout(20);
			};
			
			//reject("video terminated");
			/*
			video.width=video.videoWidth;
			video.height=video.videoHeight;
			*/
		}),
		
		stop	: video=>video.srcObject.getVideoTracks()[0].stop(),
		
		execute	: where => new Promise(async function(resolve,reject){
			const	el	= t=>document.createElement(t),
				scanner	= el("div"),
				video	= scanner.appendChild(el("video")),
				cancel	= scanner.appendChild(el("button")),
				stop	=  e=>{Scan.stop(video); scanner.parentNode.removeChild(scanner);}
				
			scanner.className = "scanner";
			video.autoplay=true;
			cancel.onclick = stop;
			(where||document.body).appendChild(scanner);
			
			await Scan.start(video)
			.then(n=>{stop();resolve(n)})
			.catch(e=>{stop();reject(e)});
		})
		
	};

})();