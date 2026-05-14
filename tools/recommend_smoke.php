<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

// Make facades available
Illuminate\Support\Facades\Facade::setFacadeApplication($app);

// Bootstrap the application so bindings (db, config, facades) are registered.
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Instantiate controller
$controller = new App\Http\Controllers\LearningPathController();

$refCourseCatalog = new ReflectionMethod($controller, 'courseCatalog');
$refCourseCatalog->setAccessible(true);
$catalog = $refCourseCatalog->invoke($controller);

// Simulated Gradio response (JSON decoded)
$responseData = [
    'recommended_topics' => [
        'Introduction to Computing',
        'Python Programming',
        'Web Development (HTML/CSS/JavaScript)'
    ],
    'complexity_level' => 'intermediate',
    'estimated_duration_minutes' => 360,
];

// Normalize like controller does
if (isset($responseData['recommended_topics']) && is_array($responseData['recommended_topics'])) {
    $responseData['learning_path'] = array_map(fn($t) => ['topic' => (string) $t], $responseData['recommended_topics']);
}


$refResolve = new ReflectionMethod($controller, 'resolveRecommendations');
$refResolve->setAccessible(true);
$recommendations = $refResolve->invoke($controller, $responseData, $catalog);

$catalogSamples = array_map(fn($c) => [
    'course_id' => $c['course_id'] ?? null,
    'course_title' => $c['course_title'] ?? null,
    'topics' => array_map(fn($t) => $t['name'] ?? ($t['title'] ?? null), $c['topics'] ?? []),
], $catalog);

echo json_encode([
    'catalog_count' => count($catalog),
    'catalog_samples' => $catalogSamples,
    'response_used' => $responseData,
    'recommendations' => $recommendations,
], JSON_PRETTY_PRINT);

