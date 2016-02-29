<?php
namespace infrajs\view;
use infrajs\ans\Ans;

if (!is_file('vendor/autoload.php')) {
	chdir('../../../../');
	require_once('vendor/autoload.php');
}

$ans = array();
$ans['title'] = 'Проверка методов view';

View::setCookie('test',true);
$val = View::getCookie('test');
if (!$val) {
	return Ans::err($ans, 'Неудалось восстановить значение из COOKIE');
}

return Ans::ret($ans);