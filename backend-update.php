<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$servername = "localhost";
$username = "u240376517_propdb";
$password = "Y*Q;5gIOp2";
$dbname = "u240376517_propdb";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}

$action = $_GET['action'] ?? 'get';

if ($action === 'get') {
    $res = $conn->query("SELECT * FROM mylinks ORDER BY created_time DESC");
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
    exit;
}

if ($action === 'delete') {
    $id = intval($_GET['id'] ?? 0);
    if ($id > 0) {
        $conn->query("DELETE FROM mylinks WHERE id = $id");
        echo json_encode(["status" => "success", "message" => "Deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid ID"]);
    }
    exit;
}

// NEW: Handle click increment
if ($action === 'increment_click') {
    $id = intval($_GET['id'] ?? 0);
    if ($id > 0) {
        // Increment the click count by 1
        $sql = "UPDATE mylinks SET clicks = clicks + 1 WHERE id = $id";
        if ($conn->query($sql)) {
            // Get the new click count
            $result = $conn->query("SELECT clicks FROM mylinks WHERE id = $id");
            if ($result && $row = $result->fetch_assoc()) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Click count incremented",
                    "new_count" => intval($row['clicks'])
                ]);
            } else {
                echo json_encode(["status" => "success", "message" => "Click count incremented"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to increment click count"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid ID"]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

    $link = isset($_POST['link']) ? $conn->real_escape_string($_POST['link']) : '';
    $title = isset($_POST['title']) ? $conn->real_escape_string($_POST['title']) : '';
    $description = isset($_POST['description']) ? $conn->real_escape_string($_POST['description']) : '';
    $folder = isset($_POST['folder']) ? $conn->real_escape_string($_POST['folder']) : '';
    $tags = isset($_POST['tags']) ? $conn->real_escape_string($_POST['tags']) : '';
    $img = isset($_POST['img']) ? $conn->real_escape_string($_POST['img']) : '';
    $isfav = isset($_POST['isfav']) && ($_POST['isfav'] == '1' || $_POST['isfav'] === 1) ? 1 : 0;
    $clicks = isset($_POST['clicks']) ? intval($_POST['clicks']) : 0;

    if ($id > 0) {
        $sql = "UPDATE mylinks SET 
                    link = '$link', 
                    title = '$title', 
                    description = '$description', 
                    folder = '$folder', 
                    tags = '$tags', 
                    img = '$img', 
                    isfav = $isfav,
                    clicks = $clicks
                WHERE id = $id";

        if ($conn->query($sql)) {
            echo json_encode(["status" => "success", "message" => "Updated", "id" => $id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Update failed", "error" => $conn->error, "query" => $sql]);
        }
    } else {
        $sql = "INSERT INTO mylinks (link, title, description, folder, tags, img, isfav, clicks) 
                VALUES ('$link', '$title', '$description', '$folder', '$tags', '$img', $isfav, $clicks)";

        if ($conn->query($sql)) {
            echo json_encode(["status" => "success", "message" => "Inserted", "id" => $conn->insert_id]);
        } else {
            echo json_encode(["status" => "error", "message" => "Insert failed", "error" => $conn->error, "query" => $sql]);
        }
    }
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid action"]);
?>