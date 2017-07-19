View = {
	getPath:function(){//depricated плохо связано с такойже функцией на сервере
		return location.pathname;
	},
	getRoot:function(){
		//Путь начинается без слэша svn/project/ например
		var p=this.getPath();
		p=p.split('/');
		p.pop();
		if(!p[0])p.shift();
		p=p.join('/');
		if(p)p+='/';
		return p;
	},
	getAGENT:function(){
		return navigator.userAgent;
	},
	getREF:function(){
		if(document.http_referrer)return document.http_referrer;
		return document.referrer
	},
	getREQUEST:function(name){
		if(this.REQUEST)return this.REQUEST;
		var REQUEST={};
		/*var DATA=this.getPOST();
		for(var i in DATA)REQUEST[i]=DATA[i];*/
		var DATA=this.getGET();
		for(var i in DATA)REQUEST[i]=DATA[i];
		this.REQUEST=REQUEST;
		return REQUEST;
	},
	getCookie:function(name){
		//if(!this.cookies){ асинхронно установленные кукисы сервером, должны обнаруживаться, для этого разбираем куки каждый раз
			this.cookies={};
			infra.forr(document.cookie.split(';'),function( cookie ) {
				var parts = cookie.split('=');
				var key=parts[0]||'';
				key=key.replace(/^\s+/,'');
				key=key.replace(/\s+$/,'');
				var val=parts[1]||'';
				val=val.replace(/^\s+/,'');
				val=val.replace(/\s+$/,'');
				this.cookies[key]=val;
			}.bind(this));
		//}
		if(name)return this.cookies[name];
		return this.cookies;
	},
	setCookie:function(name,val){
		if(val===undefined)val='';
		this.getCookie();
		
		var longdate=new Date();
		longdate.setFullYear(2020);
		
		
		if(val===''){
			var deldate=new Date();
			deldate.setFullYear(2000);
			var expire=deldate;
			delete this.cookies[name];
		}else{
			val=String(val);
			var expire=longdate;
			this.cookies[name]=val;
		}
		//var httproot=infra.plugin.getHTTPROOT();//Куки для домена который сейчас в адресной строке
		//var root=httproot?httproot.siteroot:'/';
		//var root=infra.view.getRoot();
		var root = '/';

		var val=name + "=" + escape(val) + '; path='+root+'; expires=' + expire.toGMTString();
		document.cookie = val;
		return true;
	},
	setCOOKIE:function(name,val){
		return this.setCookie(name,val);
	},
	getCOOKIE:function(name){
		return this.getCookie(name);
	},
	getQuery:function(){
		var url=location.search;
		//url=decodeURIComponent(url);
		//try {
			url=decodeURI(url);
		//}catch(e){

		//}
		/*url=url.replace(/\+/g,' ');
		var m=url.split('?');
		m.shift();
		return m.join('?');*/
		return url;
	},
	getHost:function(){
		return location.host;
	},
	getGET:function(){
		if(this.GET)return this.GET;
		var query=this.getQuery();
		var query=decodeURI(query);
		query=query.replace(/^\?/,"");
		var pars=query.split('&');
		var GET={};
		for(var i=0,l=pars.length;i<l;i++){
			var par=pars[i];
			if(!par)continue;
			par=par.split('=');
			var name=par[0];
			GET[name]=par[1];
			if(GET[name]&&Number(GET[name])==String(GET[name])){
				GET[name]=Number(GET[name]);
			}
		}
		return this.GET=GET;
	},
	setTitle:function(title){
		document.title=title;
	}
}
infra.view = View;

/*
 * Вставить элемент с id строку str всё это в сроке html
 * DOM не используется
 */

/*
 * Без аргументов вернуть текущий html
 * Только первый, добавить снизу новый html
 * Второй вставить в id
 * id true  заменить весь html
 **/
 

infra.htmlclear=function(id){
	var el=document.getElementById(id);
	if(!el)return;
	el.innerHTML='';
	el.style.display='none';
}
infra.html=function(html,id){
	if(!arguments.length)return document.body.innerHTML;

	this.html.scriptautoexec=false;
	this.html.styleautoexec=false;
	var tempid='jslibhtml'+infra.htmlGetUnick();//Одинаковый id нельзя.. если будут вложенные вызовы будет ошибка

	html='<span id="'+tempid+'" style="display:none">'+
	'<style>#'+tempid+'{ width:3px }</style>'+
	'<script type="text/javascript">infra.html.scriptautoexec=true;</script>'+
	'1</span>'+html;

	if(arguments.length==1){
		var el=document.body;
	}else if(id===true){
		var el=document.body;
	}else if(typeof(id)=='object'){
		var el=id;
	}else{
		var el=document.getElementById(id);
	}
	if(!el){
		console.log('Не найден div id');
		return;
	}
	try{
		var res=(el.innerHTML=html);
		el.style.display='';
	}catch(e){
		el.innerHTML='Ошибка, Возможно из-за вставки блочного элемента в строчный или другое какое-то нелогичное действие';
	}

	if(!this.html.scriptautoexec){

		var scripts = el.getElementsByTagName("script");
		//for (var i = 0,script; script = scripts[i]; i++){
		//подмена script через document.write или innerHTML изменяет и этот массив scripts
		for (var i=0,l=scripts.length;i<l;i++){
			(function(){
				var script=scripts[i];
				//setTimeout(function(){
					   infra.htmlexec(script);
				//},1);
			})()
		}
	}

	var bug=document.getElementById(tempid);
	if(bug){
		var b=infra.htmlGetStyle(bug,'width');
		if(b!=='3px'){
			var csss= el.getElementsByTagName("style");
			for (var i = 0,css;css=csss[i];i++){
				var t=css.cssText;//||css.innerHTML; для IE будет Undefined ну и бог с ним у него и так работает а сюда по ошибке поподаем


				var style=document.createElement('style');
				//style.innerHTML='@import url("'+href+'")';
				style.innerHTML=t;
				document.getElementsByTagName('head')[0].appendChild(style);
				//infra.style(t);
			}
		}
		try{
			el.removeChild(bug);
		}catch(e){
			if(infra.debug())alert('Ошибка при удалении временного элемента в infra.html\n'+ e);
		}
	}
	return res;
}
infra.htmlexec=function(script){
	if(!script)return;
	//if(htmlexec.busy){
	//	setTimeout(function(){
	//		infra.htmlexec(script);
	//	}.bind(this),1);
	//	return;
	//}
	//htmlexec.busy=true;
	if(script.src){

		//stencill
		//(function() { 
			//var src='http://counter.rambler.ru/top100.jcn?{config.id}';
			var src=script.src;
			var ga = document.createElement('script'); ga.type = 'text/javascript'; 
			ga.async = script.async; 
			ga.src = src;
			var s = document.getElementsByTagName('script')[0]; 
			s.parentNode.insertBefore(ga, s); 
		//})(); 
		//htmlexec.busy=false;

		/* infra.load(script.src,'ea',function(){
			htmlexec.busy=false;
		});*/
	}else{ 
		//try{
			infra.htmlGlobalEval(script.innerHTML); 
		//}catch(e){
		//	var conf=infra.config();
		//	if(conf.debug){
		//		alert('Ошибка в скрипте из шаблона\n'+e+'\n------\n'+script.innerHTML);
		//	}
		//}
		//htmlexec.busy=false;
	}
}
infra.htmlGlobalEval=function(data) {
	if(!data)return;
	var b={};
	if(typeof(window)!=='undefined'){
		b.IE=(function (){if(window.opera)return false; var rv = 0;if (navigator.appName == 'Microsoft Internet Explorer') {var ua = navigator.userAgent;var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");if (re.exec(ua) != null)rv = parseFloat(RegExp.$1);}return rv;})();
		b.opera=/opera/.test(navigator.userAgent)||window.opera;
		b.chrome=/Chrome/.test(navigator.userAgent)
		b.webkit=/WebKit/.test(navigator.userAgent);
		b.safari=(b.webkit&&!b.chrome);
	}
	// Inspired by code by Andrea Giammarchi
	// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html

	if(b.IE==false&&b.safari==false){
		window.eval(data);
	}else{
		var head = document.getElementsByTagName("head")[0] || document.documentElement, script = document.createElement("script");
		script.type = "text/javascript";
		script.text = data;
		head.insertBefore( script, head.firstChild );
		head.removeChild( script );
	}
}

infra.htmlGetStyle=function(el, cssprop){
	if (el.currentStyle) //IE
		return el.currentStyle[cssprop]
	else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
		return document.defaultView.getComputedStyle(el, "")[cssprop]
	else //try and get inline style
		return el.style[cssprop]
};
infra.htmlGetUnick=function(){
	var t=new Date().getTime();
	while(t<=infra.htmlGetUnick.last_time)t++;
	infra.htmlGetUnick.last_time=t;
	return t;
};
infra.htmlGetUnick.last_time=0;

infra.html.scriptautoexec=undefined;//Флаг выполняется ли скрипт сам при вставке html
infra.html.styleautoexec=undefined;//Флга применяется ли <style> при вставке html

if(typeof(document)=='object'){
	document.writeold=document.write;
	document.write=function(html){// нужно указывать document.write.div где нибудь в шаблоне и тогда фукнция сработает
		var sdiv=document.write.div||'documentwrite';
		var div=document.getElementById(sdiv);
		if(div){
			if(div.id=='documentwrite')div.id='';
			infra.html(html,div);
		}else{
			if(infra.debug()){
				debugger;
				alert('Нужен document.write.div указать или создать ещё элемент с id '+sdiv);
			}
		}
	}
	document.write.div='documentwrite';
} 

