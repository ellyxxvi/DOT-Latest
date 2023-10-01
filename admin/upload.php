<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $targetDirectory = 'image/festival';
    $targetFile = $targetDirectory . basename($_FILES['image']['name']);
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        echo "File uploaded successfully: " . $targetFile;
    } else {
        echo "Error uploading file.";
    }
} else {
    echo "Invalid request.";
}
?>
