<?php
// Saves/loads the study-tracking state as one JSON file on the server.
// GET  -> {"ok":true,"data":{...}}
// POST -> body is the full JSON state object; replaces the stored file.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const MAX_BYTES = 2 * 1024 * 1024;
$dir  = __DIR__ . '/../data';
$file = $dir . '/state.json';

function fail(int $code, string $msg): void {
	http_response_code($code);
	echo json_encode(['ok' => false, 'error' => $msg]);
	exit;
}

// Basic CSRF guard: the app always sends this custom header (cross-site forms cannot).
if (($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') !== 'cct121') {
	fail(400, 'Bad request');
}

if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
	fail(500, 'Data folder missing and could not be created');
}
if (!is_writable($dir)) {
	fail(500, 'Data folder is not writable');
}

// Defence in depth: block direct web access to the data folder (Apache).
$ht = $dir . '/.htaccess';
if (!file_exists($ht)) {
	@file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n");
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
	$raw = is_file($file) ? @file_get_contents($file) : false;
	$data = $raw ? json_decode($raw, true) : null;
	if (!is_array($data) || !$data) {
		echo '{"ok":true,"data":{}}';
	} else {
		echo json_encode(['ok' => true, 'data' => $data]);
	}
	exit;
}

if ($method === 'POST') {
	$raw = file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
	if ($raw === false || strlen($raw) > MAX_BYTES) {
		fail(413, 'Payload too large');
	}
	$data = json_decode($raw, true);
	if (!is_array($data)) {
		fail(400, 'Invalid JSON');
	}
	$json = json_encode($data, JSON_UNESCAPED_UNICODE);

	$tmp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
	$lock = fopen($dir . '/.lock', 'c');
	if ($lock === false || !flock($lock, LOCK_EX)) {
		fail(500, 'Could not lock');
	}
	$ok = @file_put_contents($tmp, $json) !== false && @rename($tmp, $file);
	if (!$ok) { @unlink($tmp); }
	flock($lock, LOCK_UN);
	fclose($lock);
	if (!$ok) {
		fail(500, 'Could not write state file');
	}
	@chmod($file, 0640);
	echo '{"ok":true}';
	exit;
}

header('Allow: GET, POST');
fail(405, 'Method not allowed');
