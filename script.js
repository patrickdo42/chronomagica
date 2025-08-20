document.addEventListener('DOMContentLoaded', () => {
    const datetimeDiv = document.getElementById('datetime');
    const weatherDiv = document.getElementById('weather');

    function updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        datetimeDiv.textContent = now.toLocaleDateString('en-US', options);
    }

    // Update date and time every second
    setInterval(updateDateTime, 1000);
    updateDateTime(); // Initial call

    // Placeholder for weather functionality
    weatherDiv.textContent = "Weather information coming soon!";
    // To implement weather, you would typically use a weather API here.
    // Example: fetch('https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=London')
    // .then(response => response.json())
    // .then(data => {
    //     weatherDiv.textContent = `Current weather in ${data.location.name}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
    // })
    // .catch(error => console.error('Error fetching weather:', error));
});

console.log("Welcome to Chronomagica!");
