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
	
	diff	= Y=>{
		for(let x=Y.length-1;x>1;x--)Y[x]-=Y[x-1];
		return Y;//.map(y=>y*y>thresh?y:0);
	},
	
	Spans	= (Y,thresh)=>{
		
		const	D	= diff(Y),
			spans	= Array(200),
			len	= D.length,
			FLAT	= len*5/(14*7),
			LEAST	= 40;
			
		let	x=1, count=0, d, w=0, dd=0;
			
		while(x<len){
			
			let	x0=x;
			
			while( ++x<len ){
				d=D[x];
				if(d*d>thresh)
					break;
			}				
			
			w += x-x0;
			x0 = x;
			
			if(d*dd>0){
//				w+=spans[count];
				spans[count++]=w/2; /// TODO yet
			}
			
			dd=d;
			
			let	s=0,
				y=d;
			
			while( ++x<len ){
				d=D[x];
				if( d*d<thresh || d*dd<0 )
					break;
				s+=(y+=d);
			}
			
			const a = s/y;
			
			w += a;
			
			spans[count++] = w;

/*			
			if( w<FLAT )
				spans[count++] = w;
			else
				if( count < LEAST )
					spans[count=0]+=w;
				else break;//x=len; //done

*/				
			w = x-x0-a;
		}
		
		return spans.slice(0,count);
	},
	
	drawY	= (y0,Y,style,k)=>{
		context.beginPath();
		for(let x=0;x<Y.length;x++){
			context.moveTo(x+.5,y0);
			context.lineTo(x+.5,y0+Y[x]*k);
		}
		context.strokeStyle = style;			
		context.lineWidth = 1;
		context.stroke();
	},

	drawW = (y0,W,style)=>{
		context.fillStyle = style;		
		let i=0,x=0;
		while(i<W.length){
			const a=W[i++], b=W[i++];
			context.fillRect(x+a, y0, b, 10);
			x+=a+b;
		}
	};
		
	
	scan	= (lines,thresh)=>{
		const step = h/lines;
		for(let l=0;l<lines;l++){
			
			const	y	= l*step,
				Y	= (Luma(context.getImageData(0, y, w, 1).data));
			
			drawY(y,Y,'rgba(255,255,255,.5)',.05);
			
			const	spans	= Spans(Y,thresh),
				decoded = Barcode(spans);
				
//			drawW(y,spans,'rgba(255,0,0,.25)');

			if(decoded>100)
				console.log("decoded: "+decoded);
			
			context.beginPath();
			context.moveTo(0,y);
			context.lineTo(w,y);
			context.strokeStyle = decoded>100?'green':decoded>6?'red':'gray';			
			context.lineWidth = decoded>100?10:decoded||1;// decoded?8:1;
			context.stroke();

			if(decoded>100)
				return decoded;
		}
	},
		
	timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

	return	{
		
		
		pause	: () => (paused=!paused),
		
		save	: () => {dump=true},

		exec		: async function(where){
					const	el		= t=>document.createElement(t),
						scanner	= el("scanner"),
						video		= scanner.appendChild(el("video")),
						canvas	= scanner.appendChild(el("canvas")),
						cancel	= scanner.appendChild(el("button"));
						
					(where||document.body).appendChild(scanner);
					
					await	navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
						//.catch(reject)
						.then(stream=>video.srcObject=stream);
						
					const	lines	= 10,
						track	= video.srcObject.getVideoTracks()[0],
						stop	= e => {track.stop(); scanner.parentNode.removeChild(scanner)};
						
					cancel.onclick = stop;	
					video.play();
					
					let decoded=null;
						
					while (!decoded && track.readyState==="live") {// && !paused
						if(video.videoWidth!=w){
							canvas.width	= w = video.videoWidth;
							canvas.height	= h = video.videoHeight;
							console.log("video size: "+w+" x "+h);
							context = canvas.getContext('2d');
						}
						if(w){
							context.drawImage(video,0,0,w,h);
							if(dump){
								window.location = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
								dump=false;
							}
							decoded=scan(lines,20000);
						}
						await timeout(25); //paused?1e3:
					};
					
					stop();
					return decoded; //"1234567890122";//
					//return new Promise(Scan.start(video,canvas));//.then(resolve).catch(reject);			
		}
		
	};

})();