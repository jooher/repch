dap

.NS("https://dap.js.org/stuff/untab.js")

.FUNC({
	convert	:{
		decode	:source=>{
			const	stack	=[],
				tab		= /;\t+/g,
				lines		= source.split(/[\r\n]+/g),
				scheme	= lines[0].charAt(0)=="#" && lines.shift().substr(1).split(tab),
				rowskey	= scheme[scheme.length-1];
				
			let	rows=[],
				last={};
				
			lines.forEach(line=>{
				
				if(!line)return;
					
				const	prep	= /^(\t*)(.*)/.exec(line),
					pads	= prep[1].length,
					tabs	= prep[2].split(tab),
					data	= {};
									
				tabs.forEach((v,i)=>data[scheme[i]]=v);
				
				if(pads>stack.length){
					stack.push(rows);
					rows=last[rowskey]=[];
				}
				
				while(pads<stack.length)
					rows=stack.pop();
					
				rows.push(data);
				last=data;
			});
			
			return Check(stack[0]);//
		}		
	}
});