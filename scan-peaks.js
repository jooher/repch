const
Scan	= (function(){

	let	w=0,h=0,context,
		dump	= false,
		paused	= false;
	
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
						unit += gap * .1;
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
					)return decoded;
			}
			
		})();
		

		return	spans=>EAN13(spans)||EAN13(spans.reverse());
	})(),

	Luma	= rgba=>{
		const	c=rgba.length>>2,
			l=new Array(c);
		for(let i=0,j=0; i<c; i++,j+=4)
			l[i]=rgba[j]+rgba[j+1]+rgba[j+2];
		return l;
	},
	
	Spans	= (luma,thresh)=>{
		
		const	spans	= luma,
			samples	= luma.length,
			flat	= samples*5/(14*7),
			least	= 40;
			
		let	i=0, l=luma[i], d=0, run=0, len=0;
			
		while(i<samples){
			while(++i<samples && d*d<thresh){
				d=luma[i]-l;	
				l=luma[i];
				run++;
			}
			if( run > flat ){
				if( len < least ){
					spans[len=0]+=i;
				}
				else i=samples; //done
			}
			else spans[len]=run;
			len++;
			run=0;
		}
		
		return spans.slice(0,len);
	},
	
	drawBars = (y,spans,style)=>{
		if(spans.length<3) return;
		context.fillStyle = style;		
		let h=10,i=0,x=0;
		while(i<spans.length){
			context.fillRect(x+=spans[i++], y, spans[i++], 8);
			x+=spans[i];
		}
		
	},
	
	scan	= (lines,thresh)=>{
		const step = h/lines;
		for(let l=0,decoded;l<lines;l++){
			const	y	= l*step,
				luma	= Luma(context.getImageData(0, y, w, 1).data),
				spans	= Spans(luma,thresh);
				
			drawBars(y,spans,'rgba(0,255,255,.25)');
			
			const dec = Barcode(spans);
			
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
					if(dump){
						window.location = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
						dump=false;
					}
					decoded=scan(lines);
				}
				if(decoded)resolve(decoded); 
				else await timeout(paused?1e3:1e2);
			};
		}),
		
		single	: (img,canvas) => {
			canvas.width	= w = img.width;
			canvas.height	= h = img.height;
			context = canvas.getContext('2d');
		},
		
		calc	: (thresh)=>{
			console.log(thresh);
			context.drawImage(img,0,0,w,h);
			decoded	= scan(10,thresh);
		},
		
		stop	: video => video.srcObject.getVideoTracks()[0].stop(),
		
		pause	: () => (paused=!paused),
		
		save	: () => {dump=true},
		
		execute	: where => new Promise(async function(resolve,reject){
			//alert("version 3");
			const	el	= t=>document.createElement(t),
				scanner	= el("div"),
				video		= scanner.appendChild(el("video")),
				canvas	= scanner.appendChild(el("canvas")),
				cancel	= scanner.appendChild(el("button"));
				//pause	= scanner.appendChild(el("button")),
				//savebtn	= scanner.appendChild(el("button"));
				//stop	=  
				
			video.autoplay	= true;
			
			scanner.className = "scanner";
			cancel.className= "cancel";
			//pause.className	= "pause";
			//savebtn.textContent="save";

			cancel.onclick	= e => {Scan.stop(video); scanner.parentNode.removeChild(scanner)};
			//pause.onclick	= e => {Scan.pause()};
			//savebtn.onclick	= e => {Scan.save(canvas)};
			
			(where||document.body).appendChild(scanner);
			
			await Scan.start(video,canvas).then(resolve).catch(reject);
			//stop();
		})
		
	};

})();