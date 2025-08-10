// Fade-in on scroll (both when scrolling down and up)
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible'); // Allow re-animation on scroll up
    }
  });
}, { threshold: 0.1 });

reveals.forEach(reveal => observer.observe(reveal));

// Form validation and local display
(() => {
  const form = document.querySelector('#joinForm');  
  const reasonField = form.querySelector('#reason');
  const thankYou = document.getElementById('submittedData');
  const submittedList = document.querySelector('#submittedData ul'); // Get the list directly

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Check age
    const dob = new Date(document.getElementById('dob').value);
    const ageLimit = 16;
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();
    const isOldEnough = (age > ageLimit) || (age === ageLimit && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

    if (!isOldEnough) {
      document.getElementById('dob').setCustomValidity(`You must be at least ${ageLimit} years old.`);
    } else {
      document.getElementById('dob').setCustomValidity("");
    }

    // Check reason word count
    const wordCount = reasonField.value.trim().split(/\s+/).filter(Boolean).length;
    const minWords = parseInt(reasonField.getAttribute('data-word-min'), 10);
    if (wordCount < minWords) {
      reasonField.setCustomValidity(`Please enter at least ${minWords} words.`);
    } else {
      reasonField.setCustomValidity("");
    }

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Build and display summary
    const data = {
      Name: document.getElementById('name').value,
      Email: document.getElementById('email').value,
      Phone: document.getElementById('phone').value,
      Dob: document.getElementById('dob').value,
      Gender: form.querySelector('input[name="gender"]:checked').value,
      Experience: document.getElementById('experience').value,
      Reason: reasonField.value.trim()
    };

    // Store data in localStorage
    localStorage.setItem('formData', JSON.stringify(data));

    // Clear and populate summary list
    submittedList.innerHTML = '';
    for (let key in data) {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<strong>${key}:</strong> ${data[key]}`;
      submittedList.appendChild(li);
    }

    // Reset and hide the form
    form.classList.add('d-none');
    thankYou.classList.remove('d-none');
  });

  // Smooth scroll for hero section
  const scrollDownButton = document.querySelector('.scroll-down-btn');
  if (scrollDownButton) {
    scrollDownButton.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop,
          behavior: 'smooth'
        });
      }
    });
  }

})();
