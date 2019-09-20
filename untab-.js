dap

.NS("https://dap.js.org/stuff/untab.js")

.FUNC({
	convert	:{
		decode	:source=>{
			const	stack	=[],
				tab		= /;\t+/g,
				lines		= source.split(/[\r\n]+/g),
				scheme	= lines.shift().split(tab),
				rowskey	= scheme[scheme.length-1];
				
			let	rows=[],
				last={};
				
			lines.forEach(line=>if(line){
				const	row	= line.split(tab),
					head	= row.shift().split("\t"),
					tabs	= head.length,
					data	= {};
					
				row.unshift(head.pop());
				row.forEach((v,i)=>data[scheme[i]]=v);
				
				if(tabs>stack.length){
					stack.push(rows);
					rows=last[rowskey]=[];
				}
				
				while(tabs<stack.length)
					rows=stack.pop();
					
				rows.push(data);
				last=data;
			});
			return Check(stack[0]);//
		}		
	}
})




			lines.forEach(line=>if(line){
				const	prep	= /^(\t*)(.*)/.exec(line),
					pads	= prep[1].length,
					tabs	= prep[2].split(tab),
					data	= {};
									
				row.forEach((v,i)=>data[scheme[i]]=v);
				
				if(pads>stack.length){
					stack.push(rows);
					rows=last[rowskey]=[];
				}
				
				while(tabs<stack.length)
					rows=stack.pop();
					
				rows.push(data);
				last=data;
			});

