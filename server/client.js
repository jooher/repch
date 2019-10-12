const
client={
	
	cleanup	: json=>{
			const
			opinion	= $('opinion')	.filter(o=>o.note||o.credit),
			entity	= $('entity')	.filter(e=>e.title||opinion[e.entity]),
			entry		= $('entry')	.filter(e=>entity[e.entity]),
			list		= $('list')		.filter(l=>l.title&&l.pos),
			listentity	= $('listentity')	.filter(le=>le.pos&&list[le.list]&&entity[le.entity])
		},
	
	pack		: _=>{},
	
	adopt		: json=>{ Object.keys(json).forEach( k=> $(k).PUB=json[k] ); }

}
