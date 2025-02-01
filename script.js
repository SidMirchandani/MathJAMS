document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const bookCards = document.querySelectorAll('.book-card');
  const topics = document.querySelectorAll('.topic-card');
  const popup = document.getElementById('book-popup');
  const popupTitle = document.getElementById('popup-book-title');
  const popupInput = document.getElementById('popup-username');
  const popupButton = document.getElementById('popup-link');
  const closeBtn = document.querySelector('.close-btn');
  const reportButton = document.getElementById('report-button');
  const starSystem = document.getElementById('star-system');
  const userForm = document.getElementById('user-form');
  const emailInput = document.getElementById('username');
  const userMessage = document.getElementById('user-message');
  const leaderboardList = document.getElementById('leaderboard-list');

  let correctAnswer = "";
  let problemID = "";
  let email = "";

  // Helper: Update Leaderboard (Top 10 users by stars)
  async function updateLeaderboard() {
    leaderboardList.innerHTML = "";
    try {
      const snapshot = await db.collection('userProgress')
        .orderBy('stars', 'desc')
        .limit(10)
        .get();
      snapshot.forEach(doc => {
        const li = document.createElement('li');
        const data = doc.data();
        li.textContent = `${doc.id}: ${data.stars} star${data.stars !== 1 ? 's' : ''}`;
        leaderboardList.appendChild(li);
      });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  }

  // Handle email submission
  userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const inputEmail = emailInput.value.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail)) { // Validate email format
      email = inputEmail;
      const userDocRef = db.collection('userProgress').doc(email);
      try {
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
          const userData = docSnap.data();
          starSystem.textContent = `⭐ ${userData.stars}`;
          userMessage.textContent = `Welcome back, ${email}! Your progress is being tracked.`;
        } else {
          await userDocRef.set({ stars: 0, solvedProblems: [] });
          starSystem.textContent = `⭐ 0`;
          userMessage.textContent = `Welcome, ${email}! Your progress is now being tracked.`;
        }
        userMessage.style.color = "";
        updateLeaderboard();
      } catch (error) {
        console.error("Error accessing user progress:", error);
      }
    } else {
      userMessage.textContent = 'Please enter a valid email address.';
      userMessage.style.color = 'red';
      setTimeout(() => (userMessage.textContent = ''), 3000);
    }
  });

  // Expand/collapse topics
  topics.forEach(topic => {
    const title = topic.querySelector('.topic-title');
    const content = topic.querySelector('.topic-content');
    title.addEventListener('click', () => {
      content.classList.toggle('collapsed');
    });
  });

  // Show popup on book-card click
  bookCards.forEach(card => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      if (!email) {
        alert('Please enter your email first to start tracking progress.');
        return;
      }
      problemID = card.getAttribute('data-problem-id');
      correctAnswer = card.getAttribute('data-correct-answer');
      const title = card.getAttribute('data-title');
      popupTitle.textContent = title;
      popupInput.value = "";
      popupInput.style.borderColor = "";
      popup.classList.add('visible');
    });
  });

  // Close popup
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('visible');
  });

  // Check Answer and update progress online
  popupButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const userAnswer = popupInput.value.trim();
    if (!email) {
      alert('Please log in with your email first.');
      return;
    }
    const userDocRef = db.collection('userProgress').doc(email);
    try {
      const docSnap = await userDocRef.get();
      const userData = docSnap.data();
      if (userData.solvedProblems.includes(problemID)) {
        popupInput.style.borderColor = 'orange';
      } else if (userAnswer === correctAnswer) {
        popupInput.style.borderColor = 'green';
        const newStars = userData.stars + 1;
        const newSolved = [...userData.solvedProblems, problemID];
        await userDocRef.update({ stars: newStars, solvedProblems: newSolved });
        starSystem.textContent = `⭐ ${newStars}`;
        updateLeaderboard();
      } else {
        popupInput.style.borderColor = 'red';
        setTimeout(() => {
          popupInput.style.borderColor = '';
        }, 500);
      }
    } catch (error) {
      console.error("Error updating user progress:", error);
    }
  });

  // Report Question Functionality
  reportButton.addEventListener('click', async () => {
    if (!email) {
      alert('Please log in with your email to report a question.');
      return;
    }
    const reportMessage = `The question "${popupTitle.textContent}" has been reported. Thank you!`;
    alert(reportMessage);
    try {
      await db.collection('reportedQuestions').add({
        email,
        question: popupTitle.textContent,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error("Error reporting question:", error);
    }
  });

  // Optionally, update the leaderboard on page load
  updateLeaderboard();
});

document.addEventListener('DOMContentLoaded', () => {
  const bookCards = document.querySelectorAll('.book-card'); // All book cards
  const topics = document.querySelectorAll('.topic-card'); // All topic cards
  const popup = document.getElementById('book-popup'); // Popup container
  const popupTitle = document.getElementById('popup-book-title'); // Popup title
  const popupInput = document.getElementById('popup-username'); // Answer input field
  const popupButton = document.getElementById('popup-link'); // "Check Answer" button
  const closeBtn = document.querySelector('.close-btn'); // Close button for popup
  const reportButton = document.getElementById('report-button'); // "Report Question" button
  const starSystem = document.getElementById('star-system'); // Star counter
  const userForm = document.getElementById('user-form'); // Username form
  const usernameInput = document.getElementById('username'); // Username input
  const userMessage = document.getElementById('user-message'); // Message under the form
  let correctAnswer = ""; // Placeholder for the correct answer
  let problemID = ""; // Placeholder for the problem ID
  let username = ""; // Initialize username

  // Handle username submission
  userForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputUsername = usernameInput.value.trim();
    if (/^\d{7}$/.test(inputUsername)) { // Validate username as 7-digit number
      username = inputUsername;
      const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
      const userStars = userProgress[username]?.stars || 0; // Retrieve stars for the username or default to 0
      starSystem.textContent = `⭐ ${userStars}`; // Update the star counter
      userMessage.textContent = `Welcome, ${username}! Your progress is now being tracked.`;
      userMessage.style.color = ""; // Reset message color
      if (!userProgress[username]) {
        userProgress[username] = { stars: 0, solvedProblems: [] }; // Initialize progress for new username
        localStorage.setItem('userProgress', JSON.stringify(userProgress)); // Save user data
      }
    } else {
      userMessage.textContent = 'Please enter a valid 7-digit username.';
      userMessage.style.color = 'red';
      setTimeout(() => (userMessage.textContent = ''), 3000);
    }
  });

  // Expand/collapse topics
  topics.forEach(topic => {
    const title = topic.querySelector('.topic-title'); // Get the title inside the topic
    const content = topic.querySelector('.topic-content'); // Get the content to show/hide

    title.addEventListener('click', () => {
      // Toggle the "hidden" class to expand/collapse
      content.classList.toggle('hidden');
    });
  });

  // Show popup on book-card click
  bookCards.forEach(card => {
    card.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link navigation
      if (!username) {
        alert('Please enter your username first to start tracking progress.');
        return;
      }
      problemID = card.getAttribute('data-problem-id'); // Get the problem ID from the card
      correctAnswer = card.getAttribute('data-correct-answer'); // Get the correct answer for the problem
      const title = card.getAttribute('data-title'); // Get book title from data attribute
      popupTitle.textContent = title; // Set the title in the popup
      popupInput.value = ""; // Clear the input field
      popupInput.style.borderColor = ""; // Reset border color
      popup.classList.add('visible'); // Show popup
    });
  });

  // Close popup
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('visible'); // Hide popup
  });

  // Check Answer
  popupButton.addEventListener('click', (event) => {
    event.preventDefault();
    const userAnswer = popupInput.value.trim(); // Get user's answer
    const userProgress = JSON.parse(localStorage.getItem('userProgress')) || {};
    const userStars = userProgress[username]?.stars || 0;
    const solvedProblems = userProgress[username]?.solvedProblems || [];

    if (solvedProblems.includes(problemID)) {
      // Problem already solved
      popupInput.style.borderColor = 'orange'; // Highlight orange for warning
    } else if (userAnswer === correctAnswer) {
      // Correct answer and problem not solved yet
      popupInput.style.borderColor = 'green'; // Highlight green
      userProgress[username].stars = userStars + 1; // Increment star count
      userProgress[username].solvedProblems.push(problemID); // Mark the problem as solved
      localStorage.setItem('userProgress', JSON.stringify(userProgress)); // Save updated progress
      starSystem.textContent = `⭐ ${userProgress[username].stars}`; // Update star counter
    } else {
      // Incorrect answer
      popupInput.style.borderColor = 'red'; // Highlight red
      setTimeout(() => {
        popupInput.style.borderColor = ''; // Reset after a short delay
      }, 500);
    }
  });

  // Report Question Functionality
  reportButton.addEventListener('click', () => {
    if (!username) {
      alert('Please log in with your username to report a question.');
      return;
    }
    // Mock reporting logic
    const reportMessage = `The question "${popupTitle.textContent}" has been reported. Thank you!`;
    alert(reportMessage);

    // Optionally, log the report to localStorage for tracking purposes
    const reports = JSON.parse(localStorage.getItem('reportedQuestions')) || [];
    reports.push({ username, question: popupTitle.textContent, timestamp: new Date().toISOString() });
    localStorage.setItem('reportedQuestions', JSON.stringify(reports));
  });

  // Load saved data from localStorage when the page loads
  const savedData = JSON.parse(localStorage.getItem('userProgress')) || {};
  if (username in savedData) {
    const userStars = savedData[username].stars;
    starSystem.textContent = `⭐ ${userStars}`;
    userMessage.textContent = `Welcome back, ${username}! Your progress is being tracked.`;
  }
});
