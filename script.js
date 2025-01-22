document.addEventListener('DOMContentLoaded', () => {
    const bookCards = document.querySelectorAll('.book-card'); // All book cards
    const popup = document.getElementById('book-popup'); // Popup container
    const popupTitle = document.getElementById('popup-book-title'); // Popup title
    const popupLink = document.getElementById('popup-link'); // Popup link button
    const popupRating = document.getElementById('popup-rating'); // Rating section in popup
    const popupUsername = document.getElementById('popup-username'); // Username input field
    const closeBtn = document.querySelector('.close-btn'); // Close button for popup
    let selectedRating = 0; // Track the selected rating

    // Show popup on book card click
    bookCards.forEach(card => {
        card.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link navigation

            const title = card.getAttribute('data-title'); // Get book title from data attribute
            const url = card.getAttribute('data-url'); // Get book link from data attribute

            // Set popup content
            popupTitle.textContent = title; // Set the title in the popup
            popupLink.href = url; // Set the link for the button

            // Reset rating and username input
            selectedRating = 0; // Reset the selected rating
            popupRating.querySelectorAll('span').forEach(star => star.classList.remove('selected'));
            popupUsername.value = ""; // Clear the input field
            popupUsername.style.borderColor = ""; // Reset border color

            // Show popup
            popup.classList.add('visible');
        });
    });

    // Close popup
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('visible'); // Hide popup
    });

    // Click logic for rating
    popupRating.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') {
            // Validate username
            const username = popupUsername.value.trim();
            if (!/^\d{7}$/.test(username)) { // Check if it's a valid 7-digit username
                popupUsername.style.borderColor = 'red'; // Flash red border
                setTimeout(() => {
                    popupUsername.style.borderColor = ''; // Reset border color after a short delay
                }, 500);
                return; // Prevent rating selection
            }

            // Set selected rating
            const value = parseInt(event.target.getAttribute('data-value'), 10); // Clicked star value
            selectedRating = value; // Save the selected rating
            popupRating.querySelectorAll('span').forEach(star => {
                const starValue = parseInt(star.getAttribute('data-value'), 10);
                star.classList.toggle('selected', starValue >= value); // Reverse: select stars right to left
            });

            // Send email
            sendEmail(username, selectedRating, popupTitle.textContent);

            console.log(`Rated ${selectedRating} stars for "${popupTitle.textContent}" by ${username}`);
        }
    });

    // Function to send email
    function sendEmail(username, rating, bookTitle) {
        // Use EmailJS or another email-sending service
        emailjs.send("service_id", "template_id", {
            to_email: "mirchandanis28@mcmsnj.net",
            username: username,
            rating: rating,
            book_title: bookTitle,
        }).then(response => {
            console.log('Email sent successfully:', response);
        }).catch(error => {
            console.error('Error sending email:', error);
        });
    }
});
