<?php
$_POST = json_decode(file_get_contents("php://input"), true); // Котвертирует JSON из JS-файла в PHP
echo var_dump($_POST);