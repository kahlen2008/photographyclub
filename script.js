// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1ykezGqrKIgVsU9pNovIxrNo5wRmGDHQ",
  authDomain: "photography-club-ded6a.firebaseapp.com",
  projectId: "photography-club-ded6a",
  storageBucket: "photography-club-ded6a.firebasestorage.app",
  messagingSenderId: "327920025367",
  appId: "1:327920025367:web:df782a84cd2ca02556c152",
  measurementId: "G-XQF9HVCHM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Admin email prefix
const ADMIN_EMAIL_PREFIX = '252642m';

// =============================================
//  INITIALIZE FLATPICKR & CHOICES
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof flatpickr !== 'undefined') {
        flatpickr('input[type="date"]', {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
        });
        flatpickr('input[type="time"]', {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i K",
        });
    }

    if (typeof Choices !== 'undefined') {
        document.querySelectorAll('select').forEach(select => {
            new Choices(select, {
                searchEnabled: false,
                itemSelectText: '',
                shouldSort: false
            });
        });
    }
});

// =============================================
//  SIDEBAR MOBILE TOGGLE
// =============================================
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
  });
}


// =============================================
//  SCROLL REVEAL ANIMATION
// =============================================
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


// =============================================
//  GALLERY FILTERING & SEARCH
// =============================================
const galleryFilters = document.getElementById('galleryFilters');
const galleryGrid = document.getElementById('galleryGrid');
const gallerySearch = document.getElementById('gallerySearch');

if (galleryFilters && galleryGrid) {
  const filterBtns = galleryFilters.querySelectorAll('.filter-btn');
  const cards = galleryGrid.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  if (gallerySearch) {
    gallerySearch.addEventListener('input', () => {
      const query = gallerySearch.value.toLowerCase().trim();
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const author = (card.dataset.author || '').toLowerCase();
        const category = (card.dataset.category || '').toLowerCase();
        if (title.includes(query) || author.includes(query) || category.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
      if (query) {
        filterBtns.forEach(b => b.classList.remove('active'));
      } else {
        filterBtns[0].classList.add('active');
      }
    });
  }
}

// Gallery Favorites
document.querySelectorAll('.card-favorite').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.classList.toggle('liked');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('liked')) {
      icon.classList.remove('bi-heart');
      icon.classList.add('bi-heart-fill');
    } else {
      icon.classList.remove('bi-heart-fill');
      icon.classList.add('bi-heart');
    }
  });
});


// =============================================
//  EVENTS TABS
// =============================================
const eventsTabs = document.getElementById('eventsTabs');
const upcomingEvents = document.getElementById('upcomingEvents');
const pastEvents = document.getElementById('pastEvents');

if (eventsTabs && upcomingEvents && pastEvents) {
  const tabBtns = eventsTabs.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.tab === 'upcoming') {
        upcomingEvents.style.display = '';
        pastEvents.style.display = 'none';
      } else {
        upcomingEvents.style.display = 'none';
        pastEvents.style.display = '';
      }
    });
  });
}


// =============================================
//  ADMIN TABS
// =============================================
const adminTabs = document.getElementById('adminTabs');
if (adminTabs) {
  const tabBtns = adminTabs.querySelectorAll('.admin-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-tab-content').forEach(tc => tc.classList.remove('active'));
      const target = document.getElementById('tab-' + btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}


// =============================================
//  PHOTO UPLOAD MODAL
// =============================================
const openPhotoUpload = document.getElementById('openPhotoUpload');
const photoUploadModal = document.getElementById('photoUploadModal');
const closePhotoModal = document.getElementById('closePhotoModal');

if (openPhotoUpload && photoUploadModal) {
  openPhotoUpload.addEventListener('click', () => {
    photoUploadModal.classList.add('show');
  });
}

if (closePhotoModal && photoUploadModal) {
  closePhotoModal.addEventListener('click', () => {
    photoUploadModal.classList.remove('show');
  });
  photoUploadModal.addEventListener('click', (e) => {
    if (e.target === photoUploadModal) {
      photoUploadModal.classList.remove('show');
    }
  });
}

// File dropzone preview
const photoFileInput = document.getElementById('photoFile');
const photoDropzone = document.getElementById('photoDropzone');
const photoFileName = document.getElementById('photoFileName');
const photoPreview = document.getElementById('photoPreview');

if (photoFileInput) {
  photoFileInput.addEventListener('change', () => {
    const file = photoFileInput.files[0];
    if (file) {
      if (photoDropzone) photoDropzone.classList.add('has-file');
      if (photoFileName) {
        photoFileName.textContent = file.name;
        photoFileName.classList.remove('d-none');
      }
      if (photoPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
          photoPreview.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
      }
    }
  });
}

// Photo Upload Form Submission
const photoUploadForm = document.getElementById('photoUploadForm');
if (photoUploadForm) {
  photoUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = photoFileInput.files[0];
    const title = document.getElementById('photoTitle').value.trim();
    const category = document.getElementById('photoCategory').value;
    const author = document.getElementById('photoAuthor').value.trim();
    const submitBtn = document.getElementById('photoSubmitBtn');
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const successMsg = document.getElementById('photoUploadSuccess');

    if (!file || !title || !category || !author) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    progressDiv.style.display = 'block';

    try {
      // Upload to Firebase Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `photos/${timestamp}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          progressBar.style.width = progress + '%';
          progressText.textContent = `Uploading... ${progress}%`;
        },
        (error) => {
          console.error('Upload error:', error);
          alert('Upload failed. Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Photo';
          progressDiv.style.display = 'none';
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Save metadata to Firestore
          await addDoc(collection(db, 'photoSubmissions'), {
            title,
            category,
            author,
            imageUrl: downloadURL,
            storagePath: `photos/${timestamp}_${file.name}`,
            submittedBy: auth.currentUser ? auth.currentUser.email : 'unknown',
            submittedAt: serverTimestamp(),
            status: 'pending' // requires admin approval
          });

          // Success
          progressText.textContent = 'Upload complete!';
          progressBar.style.width = '100%';
          successMsg.classList.remove('d-none');
          photoUploadForm.reset();
          if (photoDropzone) photoDropzone.classList.remove('has-file');
          if (photoFileName) photoFileName.classList.add('d-none');
          if (photoPreview) { photoPreview.innerHTML = ''; photoPreview.classList.add('d-none'); }

          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Photo';

          // Update photo count
          const userPhotoCount = document.getElementById('userPhotoCount');
          if (userPhotoCount) {
            const currentCount = parseInt(userPhotoCount.textContent) || 0;
            userPhotoCount.textContent = currentCount + 1;
          }

          setTimeout(() => {
            progressDiv.style.display = 'none';
            progressBar.style.width = '0%';
          }, 2000);
        }
      );
    } catch (error) {
      console.error('Photo submission error:', error);
      alert('Failed to submit photo. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Photo';
      progressDiv.style.display = 'none';
    }
  });
}


// =============================================
//  JOIN FORM LOGIC (Preserved from original)
// =============================================
if (document.getElementById('joinForm')) {
    const form = document.getElementById('joinForm');
    const reasonField = form.querySelector('#reason');
    const thankYou = document.getElementById('submittedData');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isGenderSelected = form.querySelector('input[name="gender"]:checked');
        const genderFeedback = document.getElementById('gender-feedback');

        if (!isGenderSelected) {
            genderFeedback.style.display = 'block';
        } else {
            genderFeedback.style.display = 'none';
        }

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

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            await addDoc(collection(db, "submissions"), {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                dob: document.getElementById('dob').value,
                gender: form.querySelector('input[name="gender"]:checked').value,
                experience: document.getElementById('experience').value,
                reason: reasonField.value.trim(),
                status: 'pending',
                submittedAt: serverTimestamp()
            });

            form.classList.add('d-none');
            thankYou.classList.remove('d-none');
            document.getElementById('submittedList').innerHTML = `
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Name:</strong> ${document.getElementById('name').value}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Email:</strong> ${document.getElementById('email').value}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Phone:</strong> ${document.getElementById('phone').value}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Date of Birth:</strong> ${document.getElementById('dob').value}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Gender:</strong> ${form.querySelector('input[name="gender"]:checked').value}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Experience:</strong> ${document.getElementById('experience').value}</li>
                <li style="padding: 0.5rem 0; border-bottom: 1px solid #e5e0db;"><strong>Reason:</strong> ${reasonField.value.trim()}</li>
                <li style="padding: 0.75rem 0; color: #2d6a4f; font-weight: 600;">✓ Your application has been received!</li>
            `;

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("There was an error submitting your application. Please try again.");
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Application';
        }
    });
}


// =============================================
//  ADMIN: LOAD SUBMISSIONS
// =============================================
async function loadAdminSubmissions() {
    const submissionsList = document.getElementById('submissionsList');
    if (!submissionsList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "submissions"));
        let pending = 0, approved = 0, rejected = 0;
        
        if (querySnapshot.empty) {
            submissionsList.innerHTML = '<div class="empty-state"><i class="bi bi-inbox"></i><p>No submissions yet.</p></div>';
            updateAdminStats(0, 0, 0);
            return;
        }

        let html = '';
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const status = data.status || 'pending';
            const submissionDate = data.submittedAt ? data.submittedAt.toDate().toLocaleDateString() : 'N/A';

            if (status === 'pending') pending++;
            else if (status === 'approved') approved++;
            else if (status === 'rejected') rejected++;

            const statusBadge = `<span class="status-badge ${status}">${status}</span>`;
            
            const actionButtons = status === 'pending' ? `
                <div class="submission-actions">
                    <button class="btn-approve" onclick="window.handleSubmission('${docSnapshot.id}', 'approved')">
                        <i class="bi bi-check-lg"></i> Approve
                    </button>
                    <button class="btn-reject" onclick="window.handleSubmission('${docSnapshot.id}', 'rejected')">
                        <i class="bi bi-x-lg"></i> Reject
                    </button>
                </div>
            ` : `<div class="submission-actions">${statusBadge}</div>`;

            html += `
                <div class="submission-card" id="submission-${docSnapshot.id}">
                    <div class="submission-info">
                        <h3>${data.name || 'Unknown'} ${status === 'pending' ? statusBadge : ''}</h3>
                        <div class="submission-email">${data.email || 'N/A'} · Submitted ${submissionDate}</div>
                        <div class="submission-details">
                            <div class="detail-item">
                                <span class="detail-label">Phone</span>
                                <span class="detail-value">${data.phone || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">DOB</span>
                                <span class="detail-value">${data.dob || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Gender</span>
                                <span class="detail-value">${data.gender || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Experience</span>
                                <span class="detail-value">${data.experience || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="submission-reason">"${data.reason || 'No reason provided'}"</div>
                    </div>
                    ${actionButtons}
                </div>
            `;
        });

        submissionsList.innerHTML = html;
        updateAdminStats(pending, approved, rejected);

    } catch (error) {
        console.error("Error loading submissions:", error);
        submissionsList.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Failed to load submissions.</p></div>';
    }
}

function updateAdminStats(pending, approved, rejected) {
    const sp = document.getElementById('statPending');
    const sa = document.getElementById('statApproved');
    const sr = document.getElementById('statRejected');
    if (sp) sp.textContent = pending;
    if (sa) sa.textContent = approved;
    if (sr) sr.textContent = rejected;
}

// Handle approve/reject
window.handleSubmission = async function(docId, newStatus) {
    try {
        await updateDoc(doc(db, "submissions", docId), { status: newStatus });
        // Reload submissions
        loadAdminSubmissions();
    } catch (error) {
        console.error("Error updating submission:", error);
        alert("Failed to update. Please try again.");
    }
};


// =============================================
//  ADMIN: EVENT MANAGEMENT
// =============================================
const addEventForm = document.getElementById('addEventForm');
const eventsListView = document.getElementById('eventsListView');
const addEventView = document.getElementById('addEventView');
const btnShowAddEvent = document.getElementById('btnShowAddEvent');
const btnBackToEvents = document.getElementById('btnBackToEvents');
const btnCancelAddEvent = document.getElementById('btnCancelAddEvent');
const eventDescInput = document.getElementById('eventDesc');
const eventDescCharCount = document.getElementById('eventDescCharCount');

if (btnShowAddEvent && eventsListView && addEventView) {
    const showAddView = () => {
        eventsListView.classList.add('d-none');
        addEventView.classList.remove('d-none');
    };
    const showListView = () => {
        eventsListView.classList.remove('d-none');
        addEventView.classList.add('d-none');
        addEventForm.reset();
        addEventForm.classList.remove('was-validated');
        if (eventDescCharCount) eventDescCharCount.textContent = '0/500';
    };

    btnShowAddEvent.addEventListener('click', showAddView);
    btnBackToEvents.addEventListener('click', showListView);
    btnCancelAddEvent.addEventListener('click', showListView);
}

if (eventDescInput && eventDescCharCount) {
    eventDescInput.addEventListener('input', () => {
        const len = eventDescInput.value.length;
        eventDescCharCount.textContent = `${len}/500`;
    });
}

if (addEventForm) {
    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('eventTitle').value.trim();
        const desc = document.getElementById('eventDesc').value.trim();
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value.trim();
        const endTime = document.getElementById('eventEndTime') ? document.getElementById('eventEndTime').value.trim() : '';
        const location = document.getElementById('eventLocation').value.trim();
        const successMsg = document.getElementById('eventSuccess');
        const btn = addEventForm.querySelector('button[type="submit"]');

        if (!addEventForm.checkValidity()) {
            addEventForm.classList.add('was-validated');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Adding...';

        try {
            await addDoc(collection(db, "events"), {
                title,
                description: desc,
                date,
                time,
                endTime,
                location,
                createdAt: serverTimestamp()
            });

            successMsg.classList.remove('d-none');
            setTimeout(() => {
                successMsg.classList.add('d-none');
                eventsListView.classList.remove('d-none');
                addEventView.classList.add('d-none');
            }, 2000);

            addEventForm.reset();
            addEventForm.classList.remove('was-validated');
            if (eventDescCharCount) eventDescCharCount.textContent = '0/500';
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-lg"></i> Add Event';
            loadAdminEvents();

        } catch (error) {
            console.error("Error adding event:", error);
            alert("Failed to add event. Please try again.");
            btn.disabled = false;
            btn.textContent = 'Add Event';
        }
    });
}

async function loadAdminEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "events"));
        
        const se = document.getElementById('statEvents');
        if (se) se.textContent = querySnapshot.size;

        if (querySnapshot.empty) {
            eventsList.innerHTML = '<div class="empty-state"><i class="bi bi-calendar-x"></i><p>No events yet. Add one above!</p></div>';
            return;
        }

        let html = '';
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const dateObj = new Date(data.date + 'T00:00:00');
            const month = months[dateObj.getMonth()] || '???';
            const day = dateObj.getDate() || '??';

            html += `
                <div class="event-list-item" id="event-${docSnapshot.id}">
                    <div class="event-list-badge">
                        <span class="month">${month}</span>
                        <span class="day">${day}</span>
                    </div>
                    <div class="event-list-info">
                        <h4>${data.title}</h4>
                        <p>${data.time} · ${data.location}</p>
                    </div>
                    <button class="btn-delete" onclick="window.deleteEvent('${docSnapshot.id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            `;
        });

        eventsList.innerHTML = html;

    } catch (error) {
        console.error("Error loading events:", error);
        eventsList.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Failed to load events.</p></div>';
    }
}

window.deleteEvent = async function(docId) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        await deleteDoc(doc(db, "events", docId));
        loadAdminEvents();
    } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event.");
    }
};


// =============================================
//  ADMIN: PHOTO SUBMISSIONS
// =============================================
async function loadAdminPhotos() {
    const photosList = document.getElementById('photoSubmissionsList');
    if (!photosList) return;

    try {
        const querySnapshot = await getDocs(collection(db, "photoSubmissions"));
        
        if (querySnapshot.empty) {
            photosList.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><i class="bi bi-image"></i><p>No photo submissions yet.</p></div>';
            return;
        }

        let html = '';
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const status = data.status || 'pending';
            const statusBadge = `<span class="status-badge ${status}">${status}</span>`;

            const actions = status === 'pending' ? `
                <div class="photo-sub-actions">
                    <button class="btn-approve" style="flex:1;" onclick="window.handlePhoto('${docSnapshot.id}', 'approved')">Approve</button>
                    <button class="btn-reject" style="flex:1;" onclick="window.handlePhoto('${docSnapshot.id}', 'rejected')">Reject</button>
                </div>
            ` : `<div class="photo-sub-actions">${statusBadge}</div>`;

            html += `
                <div class="photo-submission-card">
                    <img src="${data.imageUrl}" alt="${data.title}" loading="lazy">
                    <div class="photo-sub-info">
                        <h4>${data.title}</h4>
                        <p>by ${data.author} · ${data.category}</p>
                    </div>
                    ${actions}
                </div>
            `;
        });

        photosList.innerHTML = html;

    } catch (error) {
        console.error("Error loading photo submissions:", error);
        photosList.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><i class="bi bi-exclamation-triangle"></i><p>Failed to load photos.</p></div>';
    }
}

window.handlePhoto = async function(docId, newStatus) {
    try {
        await updateDoc(doc(db, "photoSubmissions", docId), { status: newStatus });
        loadAdminPhotos();
    } catch (error) {
        console.error("Error updating photo:", error);
        alert("Failed to update. Please try again.");
    }
};


// =============================================
//  AUTH & PORTAL LOGIC
// =============================================

function isAdmin(email) {
    return email && email.toLowerCase().startsWith(ADMIN_EMAIL_PREFIX);
}

onAuthStateChanged(auth, async (user) => {
    const navLoginBtn = document.getElementById('navLoginBtn');
    const navLogoutBtn = document.getElementById('navLogoutBtn');
    const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
    const adminNavLink = document.getElementById('adminNavLink');

    if (user) {
        // User is signed in
        if (navLogoutBtn) navLogoutBtn.style.display = 'block';
        if (sidebarLoginBtn) {
            sidebarLoginBtn.textContent = 'Portal';
            sidebarLoginBtn.href = 'portal.html';
            sidebarLoginBtn.style.display = 'block';
        }

        // Check admin and set role
        const userIsAdmin = isAdmin(user.email);
        
        // Auto-assign admin role in Firestore if email matches
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const currentRole = userDocSnap.data().role;
                if (userIsAdmin && currentRole !== 'admin') {
                    await updateDoc(userDocRef, { role: 'admin' });
                }
            } else {
                await setDoc(userDocRef, {
                    email: user.email,
                    role: userIsAdmin ? 'admin' : 'member'
                });
            }
        } catch (err) {
            console.error("Error managing user role", err);
        }

        // Show admin link in sidebar
        if (adminNavLink && userIsAdmin) {
            adminNavLink.style.display = '';
        }

        // Check if we are on the portal page to load data
        if (document.getElementById('portalWelcome')) {
            const portalUserEmail = document.getElementById('portalUserEmail');
            if (portalUserEmail) {
                portalUserEmail.textContent = user.email.split('@')[0];
            }
            
            // Fetch Role
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const role = userDoc.data().role || 'member';
                    const portalUserRole = document.getElementById('portalUserRole');
                    if (portalUserRole) {
                        portalUserRole.textContent = role === 'admin' ? 'Admin' : 'Active Member';
                    }
                }
            } catch (err) {
                console.error("Error fetching user role", err);
            }

            // Count user's photos
            try {
                const photosQuery = query(
                    collection(db, "photoSubmissions"),
                    where("submittedBy", "==", user.email)
                );
                const photosSnap = await getDocs(photosQuery);
                const userPhotoCount = document.getElementById('userPhotoCount');
                if (userPhotoCount) userPhotoCount.textContent = photosSnap.size;
            } catch (err) {
                console.error("Error counting photos", err);
            }
        }
        
        // If on login page, redirect to portal
        if (document.getElementById('loginForm')) {
            window.location.href = 'portal.html';
        }

        // Load admin page data
        if (document.getElementById('submissionsList')) {
            if (userIsAdmin) {
                loadAdminSubmissions();
                loadAdminEvents();
                loadAdminPhotos();
            } else {
                // Non-admin trying to access admin page
                window.location.href = 'portal.html';
            }
        }

    } else {
        // User is signed out
        if (navLogoutBtn) navLogoutBtn.style.display = 'none';
        if (sidebarLoginBtn) {
            sidebarLoginBtn.textContent = 'Log In';
            sidebarLoginBtn.href = 'login.html';
            sidebarLoginBtn.style.display = 'block';
        }
        if (adminNavLink) adminNavLink.style.display = 'none';

        // Protected Routes
        const isPortal = document.getElementById('portalWelcome');
        const isAdminPage = document.getElementById('submissionsList');
        
        if (isPortal || isAdminPage) {
            window.location.href = 'login.html';
        }
    }
});

// Handle Login Form
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!loginForm.checkValidity()) {
            loginForm.classList.add('was-validated');
            return;
        }

        const btn = loginForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Signing in...';
        errorAlert.classList.add('d-none');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the redirect
        } catch (error) {
            console.error("Login Error:", error);
            errorAlert.textContent = "Invalid email or password.";
            errorAlert.classList.remove('d-none');
            btn.disabled = false;
            btn.textContent = 'Sign In';
        }
    });

    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const provider = new GoogleAuthProvider();
            googleLoginBtn.disabled = true;
            googleLoginBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Signing in...';
            try {
                const result = await signInWithPopup(auth, provider);
                const userDocRef = doc(db, "users", result.user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) {
                    const userIsAdmin = isAdmin(result.user.email);
                    await setDoc(userDocRef, {
                        email: result.user.email,
                        role: userIsAdmin ? 'admin' : 'member'
                    });
                }
                // onAuthStateChanged will handle the redirect
            } catch (error) {
                console.error("Google Login Error:", error);
                errorAlert.textContent = "Google Sign-In failed: " + error.message;
                errorAlert.classList.remove('d-none');
                googleLoginBtn.disabled = false;
                googleLoginBtn.innerHTML = '<i class="bi bi-google"></i> Continue with Google';
            }
        });
    }
}

// Handle Logout
const handleLogout = async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

const portalLogoutBtn = document.getElementById('portalLogoutBtn');
if (portalLogoutBtn) portalLogoutBtn.addEventListener('click', handleLogout);

const navLogoutBtns = document.querySelectorAll('#navLogoutBtn');
navLogoutBtns.forEach(btn => btn.addEventListener('click', handleLogout));


// =============================================
//  PUBLIC: EVENTS MANAGEMENT
// =============================================
window.loadedPublicEvents = {};

async function loadPublicEvents() {
    const upcomingEventsContainer = document.getElementById('upcomingEvents');
    if (!upcomingEventsContainer) return;

    try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            upcomingEventsContainer.innerHTML = '<div class="empty-state"><p>No upcoming events at the moment. Stay tuned!</p></div>';
            return;
        }

        let html = '';
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        
        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const dateObj = new Date(data.date + 'T00:00:00');
            const month = months[dateObj.getMonth()] || '???';
            const day = String(dateObj.getDate()).padStart(2, '0') || '??';
            
            const timeString = data.endTime ? `${data.time} – ${data.endTime}` : data.time;
            const fullDate = `${day} ${month} ${dateObj.getFullYear()}`;

            window.loadedPublicEvents[docSnapshot.id] = {
                title: data.title,
                description: data.description,
                location: data.location,
                date: fullDate,
                time: timeString
            };

            html += `
                <div class="event-card">
                    <div class="event-date-badge">
                        <span class="month">${month}</span>
                        <span class="day">${day}</span>
                    </div>
                    <div class="event-details">
                        <h3>${data.title}</h3>
                        <p>${data.description}</p>
                        <div class="event-meta">
                            <span><i class="bi bi-clock"></i> ${timeString}</span>
                            <span><i class="bi bi-geo-alt"></i> ${data.location}</span>
                        </div>
                    </div>
                    <div class="event-action">
                        <button class="btn-outline" onclick="window.openEventModal('${docSnapshot.id}')">View Details</button>
                    </div>
                </div>
            `;
        });

        upcomingEventsContainer.innerHTML = html;

    } catch (error) {
        console.error("Error loading public events:", error);
        upcomingEventsContainer.innerHTML = '<div class="empty-state"><p>Failed to load events.</p></div>';
    }
}

window.openEventModal = function(id) {
    const event = window.loadedPublicEvents[id];
    if (!event) return;

    document.getElementById('modalEventTitle').textContent = event.title;
    document.querySelector('#modalEventDate span').textContent = event.date;
    document.querySelector('#modalEventTime span').textContent = event.time;
    document.querySelector('#modalEventLocation span').textContent = event.location;
    document.getElementById('modalEventDesc').textContent = event.description;

    document.getElementById('eventModalOverlay').style.display = 'flex';
};

// Modal Close Handlers
const eventModalOverlay = document.getElementById('eventModalOverlay');
const eventModalClose = document.getElementById('eventModalClose');
if (eventModalClose && eventModalOverlay) {
    eventModalClose.addEventListener('click', () => {
        eventModalOverlay.style.display = 'none';
    });
    eventModalOverlay.addEventListener('click', (e) => {
        if (e.target === eventModalOverlay) {
            eventModalOverlay.style.display = 'none';
        }
    });
    document.getElementById('modalEventJoinBtn').addEventListener('click', () => {
        window.location.href = 'join.html';
    });
}

// Automatically load on activities page
if (document.getElementById('upcomingEvents')) {
    loadPublicEvents();
}