<?php
$password = $argv[1];
$hash = $argv[2];

echo password_verify(md5($password), $hash);
?>