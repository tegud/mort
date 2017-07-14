(function() {
    fetch('/api/reports')
        .then(response => response.json())
        .then(data => console.log(data));
})();
