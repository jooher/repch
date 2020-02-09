const

$=(t,f)=>T(t).filter(f),

client={
	
	cleanup	: json=>{
			const
			opinion	= $('entity-aspect',	o=>o.note||o.credit),
			entity	= $('entity',		e=>e.title||opinion[e.entity]),
			entry		= $('entry',		e=>entity[e.entity]),
			list		= $('list',			l=>l.title&&l.pos),
			listentity	= $('list-entity',	r=>r.pos&&list[r.list]&&entity[r.entity])
		},
	
	pack		: _=>{},
	
	adopt		: json=>{ Object.keys(json).forEach( k=> $(k).PUB=json[k] ); }

}
