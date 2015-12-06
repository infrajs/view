<?php
namespace infrajs\view;
use infrajs\ans\Ans;

require_once('../../../../vendor/autoload.php');

$ans = array();
$ans['title'] = 'Проверка методов view';


$val = View::getCookie('test2');
if (!$val) {
	View::setCookie('test2',true);
	return Ans::err($ans, 'Неудалось восстановить значение из COOKIE. Требуется F5');
}

return Ans::ret($ans);