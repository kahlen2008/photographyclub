// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB75NlK8DiwmmnC1rYdhsCme5CeoodFuSI",
  authDomain: "photographyclub-6945b.firebaseapp.com",
  projectId: "photographyclub-6945b",
  storageBucket: "photographyclub-6945b.firebasestorage.app",
  messagingSenderId: "785362633502",
  appId: "1:785362633502:web:e598eab82ffc90b7be7f0f",
  measurementId: "G-9ZL9C3SCFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- General Functions ---

// Fade-in on scroll
const reveals = document.querySelectorAll('.reveal');
if (reveals.length > 0) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
}


// --- Page-Specific Logic ---

// Logic for the Join Page
if (document.getElementById('joinForm')) {
    const form = document.getElementById('joinForm');
    const reasonField = form.querySelector('#reason');
    const thankYou = document.getElementById('submittedData');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // --- START: MODIFIED CODE FOR GENDER VALIDATION ---
        // Manually check if a gender is selected to display feedback correctly
        const isGenderSelected = form.querySelector('input[name="gender"]:checked');
        const genderFeedback = document.getElementById('gender-feedback');

        if (!isGenderSelected) {
            // If no gender is selected, make the feedback message visible
            genderFeedback.style.display = 'block';
        } else {
            // If a gender is selected, hide the feedback message
            genderFeedback.style.display = 'none';
        }
        // --- END: MODIFIED CODE FOR GENDER VALIDATION ---

        // Custom validation for age
        const dobInput = document.getElementById('dob');
        const dob = new Date(dobInput.value);
        const ageLimit = 16;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        if (age < ageLimit) {
            dobInput.setCustomValidity(`You must be at least ${ageLimit} years old.`);
        } else {
            dobInput.setCustomValidity("");
        }

        // Custom validation for reason word count
        const wordCount = reasonField.value.trim().split(/\s+/).filter(Boolean).length;
        const minWords = parseInt(reasonField.getAttribute('data-word-min'), 10);
        if (wordCount < minWords) {
            reasonField.setCustomValidity(`Please enter at least ${minWords} words.`);
        } else {
            reasonField.setCustomValidity("");
        }
        
        // This check will now work alongside the manual gender feedback
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // Disable button to prevent multiple submissions
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            // Add a new document with a generated id.
            await addDoc(collection(db, "submissions"), {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                dob: document.getElementById('dob').value,
                gender: form.querySelector('input[name="gender"]:checked').value,
                experience: document.getElementById('experience').value,
                reason: reasonField.value.trim(),
                submittedAt: serverTimestamp() // Add a server-side timestamp
            });

            // Hide the form and show the thank you message
            form.classList.add('d-none');
            thankYou.classList.remove('d-none');
            // Populate the thank you message for the user
            document.getElementById('submittedList').innerHTML = `
                <li class="list-group-item"><strong>Name:</strong> ${document.getElementById('name').value}</li>
                <li class="list-group-item"><strong>Email:</strong> ${document.getElementById('email').value}</li>
                <li class="list-group-item"><strong>Phone:</strong> ${document.getElementById('phone').value}</li>
                <li class="list-group-item"><strong>Date of Birth:</strong> ${document.getElementById('dob').value}</li>
                <li class="list-group-item"><strong>Gender:</strong> ${form.querySelector('input[name="gender"]:checked').value}</li>
                <li class="list-group-item"><strong>Experience:</strong> ${document.getElementById('experience').value}</li>
                <li class="list-group-item"><strong>Reason:</strong> ${reasonField.value.trim()}</li>
                <li class="list-group-item">Your application has been received!</li>
            `;

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("There was an error submitting your application. Please try again.");
            // Re-enable the button if submission fails
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
        }
    });
}

// Logic for the Admin Page
if (document.getElementById('formDataTable')) {
    const tableBody = document.getElementById('formDataTable');

    const loadSubmissions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "submissions"));
            let index = 1;
            tableBody.innerHTML = ''; // Clear existing content

            if (querySnapshot.empty) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No submissions yet.</td></tr>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const submissionDate = data.submittedAt ? data.submittedAt.toDate().toLocaleString() : 'N/A';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index++}</td>
                    <td>${data.name}</td>
                    <td>${data.email}</td>
                    <td>${data.reason}</td>
                    <td>${data.gender}</td>
                    <td>${data.experience}</td>
                    <td>${data.phone}</td>
                    <td>${data.dob}</td>
                    <td>${submissionDate}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error loading submissions: ", error);
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Failed to load data. See console for details.</td></tr>';
        }
    };
    
    // Load the data when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', loadSubmissions);
}