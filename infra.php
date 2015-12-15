<?php
namespace infrajs\view;
use infrajs\load\Load;
use infrajs\path\Path;

View::$conf['load'] = function ($str) {
	if(!Path::theme($str)) {
		throw new \Exception('Не найден файл '.$str);
	}
	return Load::loadTEXT($str);
};
