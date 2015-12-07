<?php
namespace infrajs\view;

class View {
	public static $conf=array(
		'js'=>array()
	);
	public static function getHost()
	{
		return $_SERVER['HTTP_HOST'];
	}
	public static function getSchema()
	{
		if(!empty($_SERVER['REQUEST_SCHEME']))return $_SERVER['REQUEST_SCHEME'].'://';
		return 'http://';
	}
	public static function getAgent()
	{
		return $_SERVER['HTTP_USER_AGENT'];
	}
	public static function getIP()
	{
		return $_SERVER['REMOTE_ADDR'];
	}
	public static function getRef()
	{
		return $_SERVER['HTTP_REFERER'];
	}
	public static function getCookie($name = null)
	{
		if (is_null($name)) {
			return $_COOKIE;
		}

		return @$_COOKIE[$name];
	}
	public static function setCookie($name, $val = null)
	{
		$_COOKIE[$name] = $val;
		$root = static::getRoot();
		if (is_null($val)) {
			$time = time() - 60 * 60 * 24 * 30 * 24;
		} else {
			$time = time() + 60 * 60 * 24 * 30 * 24;
		}

		return setcookie($name, $val, $time, $root);
	}
	public static function getPath()
	{
		return static::getSchema().static::getHost().static::getRoot();
	}

	/**
	 * Возвращает путь до сайта от корня сервера
	 * Всегда есть 1 слэш.
	 */
	public static function getRoot()
	{
		$path = substr(static::getcwd(), strlen(static::realpath($_SERVER['DOCUMENT_ROOT']))).'/';

		return $path;
	}
	public static function realpath($dir){
		$dir = realpath($dir);
		if (DIRECTORY_SEPARATOR != '/') {
			str_replace(DIRECTORY_SEPARATOR, '/', $dir);
		}
		return $dir;
	}
	public static function getcwd(){
		$dir = getcwd();
		if (DIRECTORY_SEPARATOR != '/') {
			str_replace(DIRECTORY_SEPARATOR, '/', $dir);
		}
		return $dir;
	}



	/*
	View::html() получить весь html
	View::html($html) Добавить html снизу всего 
	View::html($html,true) Установить новый html 
	View::html($html,$id) Добавить html в блок с id=$id 
	 */
	public static $js='';
	public static $html='';
	public static $unick=0;
	public static function unick()
	{
		$t = time();
		while ($t <= static::$unick) $t++;
		static::$unick = $t;
		return $t;
	}
	public static function json($src = null)
	{
		if (is_null($src)) return static::$js;
		$conf=static::$conf;
		if(!empty($conf['js'][$src])) return;

		$conf['js'][$src]=true;
		static::$js .= "\n\n".'//require json '.$src."\n";
		static::$js .= $conf['load']($src).';';
		static::$js .= $conf['jsonfix']($src);
	}
	public static function js($src = null){
		if (is_null($src)) return static::$js;
		$conf=static::$conf;
		if(!empty($conf['js'][$src])) return;
		$conf['js'][$src]=true;

		static::$js .= "\n\n".'//require js '.$src."\n";
		static::$js .= $conf['load']($src);
		static::$js .= $conf['jsfix']($src);
	}
	public static function html($html = null, $id = null)
	{
		$args = func_get_args();
		if (is_null($html)) return static::$html;
		if (is_null($id)) {
			static::$html .= $html;
			//return $infra_store_html;
			return true;
		}
		if ($id === true) {
			static::$html = $html;
			return true;
		}

		$t = '·';
		while (strpos(static::$html, $t) !== false) {
			//Смотрим нет ли указанного символа в шаблоне, если нет то можно его использовать в качестве временной замены
			$t = static::unick();
		}
		$storhtml = preg_replace("/[\r\n]/", $t, static::$html);
		preg_match('/(.*?id *= *["\']'.$id.'["\'].*?>)(.*)/i', $storhtml, $m);
		if (sizeof($m) === 3) {
			$hl = $m[1];
			$hl = preg_replace('/'.$t.'/', "\n", $hl);
			$hr = $m[2];
			$hr = preg_replace('/'.$t.'/', "\n", $hr);
			static::$html = $hl.$html.$hr;
			//$stor_html=($m[1]||'').preg_replace(new RegExp(t,'g'),'\n')+html+(m[2]||'').replace(new RegExp(t,'g'),'\n');
			return true;
		} else {
			return false;
		}
	}
}

View::$conf = array(
	'load' => function ($str) {
		return file_get_contents($str);
	},
	'jsfix' => function ($src) {
		return '';
		return 'infra.store("require")["'.$src.'"]={value:true};'; //код отметки о выполненных файлах
	},
	'jsonfix' => function($src){
		return '';
		return 'infra.store("loadJSON")["'.$src.'"]={status:"pre"};infra.store("loadJSON")["'.$src.'"].value = obj'; //код отметки о выполненных файлах
	}
);