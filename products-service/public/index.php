<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
require __DIR__ . '/../vendor/autoload.php';
$app = AppFactory::create();
$app->addErrorMiddleware(false, true, true);
$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    $origin = $request->getHeaderLine('Origin');
    $allowed = explode(',', getenv('ALLOWED_ORIGINS') ?: 'http://localhost:5173');
    if (in_array($origin, $allowed, true)) $response = $response->withHeader('Access-Control-Allow-Origin', $origin)->withHeader('Vary', 'Origin');
    return $response->withHeader('Access-Control-Allow-Headers', 'Content-Type')->withHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
});
function database() {
    $host = getenv('DB_HOST') ?: 'database';
    $port = getenv('DB_PORT') ?: '5432';
    $name = getenv('DB_NAME') ?: 'ecommerce_db';
    $ssl = getenv('DB_SSLMODE') ?: 'prefer';
    return new PDO("pgsql:host=$host;port=$port;dbname=$name;sslmode=$ssl", getenv('DB_USER') ?: 'user', getenv('DB_PASSWORD') ?: 'password', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
}
$app->options('/{routes:.+}', function (Request $request, Response $response) { return $response->withStatus(204); });
$app->get('/health', function (Request $request, Response $response) {
    try { database()->query('SELECT 1'); $response->getBody()->write('{"status":"ok"}'); }
    catch (PDOException $e) { $response->getBody()->write('{"status":"starting"}'); return $response->withStatus(503)->withHeader('Content-Type','application/json'); }
    return $response->withHeader('Content-Type','application/json');
});
$app->get('/products', function (Request $request, Response $response) {
    try {
        $products = database()->query('SELECT id,name,description,price,stock,"imageUrl" FROM "Product" ORDER BY id')->fetchAll();
        $response->getBody()->write(json_encode($products));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (PDOException $e) {
        error_log('Products database request failed');
        $response->getBody()->write('{"error":"Catalog is starting. Please retry shortly."}');
        return $response->withStatus(503)->withHeader('Content-Type', 'application/json');
    }
});
$app->run();
