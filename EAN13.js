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
		if(decoded.indexOf("*")>=0)return;

		//let sum=0, check=10-digits[12];
		//for(int i=0; i<12; i+=2) sum += (1*digits[i])+(3*digits[i+1]);
		
		let	check	= 10-digits.pop(),//[12],//
			sum	= digits.reduce((s,n,i)=>s+((i%2)?(3*n):(1*n)),0);
		
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
