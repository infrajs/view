<?php
namespace infrajs\view;
use infrajs\infra\Load;



View::$conf = array(
	'load' => function ($str) {
		return Load::loadTEXT($str);
	}
);