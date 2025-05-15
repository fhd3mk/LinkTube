// العناصر الأساسية
const themeButton = document.getElementById('themeButton');
const body = document.body;
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const videoForm = document.getElementById('videoForm');
const videoList = document.getElementById('videoList');
const loginPage = document.getElementById('authPage');
const mainPage = document.getElementById('mainPage');
const emptyState = document.getElementById('emptyState');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const logoutBtn = document.getElementById('logoutBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// البيانات
let users = JSON.parse(localStorage.getItem('tubeLinkUsers')) || [];
let videos = JSON.parse(localStorage.getItem('tubeLinkVideos')) || [];
let currentUser = null;
let bookmarks = JSON.parse(localStorage.getItem('tubeLinkBookmarks')) || [];
let playlists = JSON.parse(localStorage.getItem('tubeLinkPlaylists')) || [];
let watchLater = JSON.parse(localStorage.getItem('tubeLinkWatchLater')) || [];
let ratings = JSON.parse(localStorage.getItem('tubeLinkRatings')) || {};

// تهيئة التطبيق
function initApp() {
  // تحميل الثيم
  const savedTheme = localStorage.getItem('tubeLinkTheme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);
  // في الجزء العلوي مع العناصر الأخرى
const showAllBtn = document.getElementById('showAllBtn');
const showBookmarksBtn = document.getElementById('showBookmarksBtn');

// في setupEventListeners()
showAllBtn.addEventListener('click', showAllVideos);
showBookmarksBtn.addEventListener('click', showBookmarkedVideos);

// الدوال الجديدة
function showAllVideos() {
  showAllBtn.classList.add('active');
  showBookmarksBtn.classList.remove('active');
  renderVideos();
}

function showBookmarkedVideos() {
  showAllBtn.classList.remove('active');
  showBookmarksBtn.classList.add('active');
  const bookmarkedVideos = videos.filter(video => bookmarks.includes(video.id));
  renderVideos(bookmarkedVideos);
}

// تعديل دالة البحث لدعم البحث في المفضلة
function searchVideos() {
  const searchTerm = searchInput.value.toLowerCase();
  const currentVideos = showBookmarksBtn.classList.contains('active') ? 
    videos.filter(v => bookmarks.includes(v.id)) : 
    videos;
  
  const filtered = currentVideos.filter(video => 
    video.title.toLowerCase().includes(searchTerm) ||
    video.category.toLowerCase().includes(searchTerm)
  );
  
  renderVideos(filtered);
}
  // بيانات تجريبية
  if (users.length === 0) {
    users = [{
      id: 'admin1',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      createdAt: new Date().toISOString()
    }];
    saveUsers();
  }
  // دالة لعرض التعليقات
function renderComments(videoId) {
  const commentsContainer = document.getElementById(`comments-${videoId}`);
  if (!commentsContainer) return;

  commentsContainer.innerHTML = '';
  
  if (!comments[videoId] || comments[videoId].length === 0) {
    commentsContainer.innerHTML = '<p>لا توجد تعليقات بعد</p>';
    return;
  }

  comments[videoId].forEach(comment => {
    const user = users.find(u => u.id === comment.userId);
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
      <div class="comment-header">
        <strong>${user ? user.username : 'مستخدم مجهول'}</strong>
        <span>${formatDate(comment.createdAt)}</span>
      </div>
      <p>${comment.text}</p>
      ${comment.userId === currentUser.id ? 
        `<button class="delete-comment" data-comment-id="${comment.id}" data-video-id="${videoId}">
          <i class="fas fa-trash"></i>
        </button>` : ''}
    `;
    commentsContainer.appendChild(commentElement);
  });

  document.querySelectorAll('.delete-comment').forEach(btn => {
    btn.addEventListener('click', function() {
      deleteComment(
        this.getAttribute('data-video-id'),
        this.getAttribute('data-comment-id')
      );
    });
  });
}

// دالة لإضافة تعليق
function addComment(videoId, text) {
  if (!text.trim()) return;

  if (!comments[videoId]) {
    comments[videoId] = [];
  }

  const newComment = {
    id: generateId(),
    userId: currentUser.id,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  comments[videoId].unshift(newComment);
  localStorage.setItem('tubeLinkComments', JSON.stringify(comments));
  renderComments(videoId);
}

// دالة لحذف تعليق
function deleteComment(videoId, commentId) {
  if (!comments[videoId]) return;

  comments[videoId] = comments[videoId].filter(c => c.id !== commentId);
  localStorage.setItem('tubeLinkComments', JSON.stringify(comments));
  renderComments(videoId);
}
  if (videos.length === 0) {
    videos = [{
      id: 'vid1',
      userId: 'admin1',
      title: 'فيديو تجريبي',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0',
      category: 'ترفيهي',
      createdAt: new Date().toISOString(),
      views: 0
    }];
    saveVideos();
  }
  
  // التحقق من تسجيل الدخول التلقائي
  const rememberedUser = localStorage.getItem('tubeLinkRememberedUser');
  if (rememberedUser) {
    const user = users.find(u => u.username === rememberedUser);
    if (user) {
      currentUser = user;
      showMainPage();
    }
  }
  
  setupEventListeners();
  checkAutoDarkMode();
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
  // تبديل الثيم
  themeButton.addEventListener('click', toggleTheme);
  
  // تسجيل الدخول
  loginForm.addEventListener('submit', handleLogin);
  
  // التسجيل
  registerForm.addEventListener('submit', handleRegister);
  
  // إضافة فيديو
  videoForm.addEventListener('submit', handleAddVideo);
  
  // تبديل النماذج
  showRegister.addEventListener('click', showRegisterForm);
  showLogin.addEventListener('click', showLoginForm);
  
  // تسجيل الخروج
  logoutBtn.addEventListener('click', logout);
  
  // البحث
  searchBtn.addEventListener('click', searchVideos);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchVideos();
  });
}

// معالجة تسجيل الدخول
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    if (rememberMe) {
      localStorage.setItem('tubeLinkRememberedUser', username);
    }
    showMainPage();
    showToast('تم تسجيل الدخول بنجاح', 'success');
  } else {
    showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
  }
}

// معالجة التسجيل
function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showToast('كلمتا المرور غير متطابقتين', 'error');
    return;
  }
  
  if (users.some(u => u.username === username)) {
    showToast('اسم المستخدم موجود مسبقاً', 'error');
    return;
  }
  
  const newUser = {
    id: generateId(),
    username,
    email,
    password,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers();
  showLoginForm();
  showToast('تم إنشاء الحساب بنجاح', 'success');
}

// معالجة إضافة فيديو
function handleAddVideo(e) {
  e.preventDefault();
  const title = document.getElementById('videoTitle').value.trim();
  const url = document.getElementById('videoUrl').value.trim();
  const category = document.getElementById('videoCategory').value;
  
  if (!title || !url || !category) {
    showToast('الرجاء ملء جميع الحقول', 'error');
    return;
  }

  const embedUrl = convertToEmbedUrl(url);
  if (!embedUrl) {
    showToast('رابط اليوتيوب غير صالح', 'error');
    return;
  }

  const newVideo = {
    id: generateId(),
    userId: currentUser.id,
    title,
    url: embedUrl,
    category,
    createdAt: new Date().toISOString(),
    views: 0
  };

  videos.unshift(newVideo);
  saveVideos();
  renderVideos();
  videoForm.reset();
  showToast('تم رفع الفيديو بنجاح', 'success');
}

// البحث عن الفيديوهات
function searchVideos() {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = videos.filter(video => 
    video.title.toLowerCase().includes(searchTerm) ||
    video.category.toLowerCase().includes(searchTerm)
  );
  
  renderVideos(filtered);
}

// عرض الفيديوهات
function renderVideos(filteredVideos = videos) {
  videoList.innerHTML = '';
  
  if (filteredVideos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  
  filteredVideos.forEach(video => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    videoCard.innerHTML = `
      <div class="video-container">
        <iframe src="${video.url}" frameborder="0" allowfullscreen></iframe>
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.category} • ${formatDate(video.createdAt)}</p>
        <div class="video-actions">
          ${video.userId === currentUser.id ? 
            `<button class="delete-btn" data-id="${video.id}"><i class="fas fa-trash"></i> حذف</button>` : ''}
          <button class="share-btn" data-url="${video.url}"><i class="fas fa-share-alt"></i> مشاركة</button>
          <button class="bookmark-btn" data-id="${video.id}">
            <i class="${bookmarks.includes(video.id) ? 'fas' : 'far'} fa-bookmark"></i>
          </button>
        </div>
      </div>
    `;
    
    videoList.appendChild(videoCard);
  });

  // إضافة مستمعي الأحداث
  addEventListenersToButtons();
  // التعليقات
document.querySelectorAll('.toggle-comments').forEach(btn => {
  btn.addEventListener('click', function() {
    const videoId = this.getAttribute('data-video-id');
    const commentsSection = this.closest('.video-card').querySelector('.comments-section');
    
    if (commentsSection.style.display === 'none') {
      commentsSection.style.display = 'block';
      renderComments(videoId);
    } else {
      commentsSection.style.display = 'none';
    }
  });
});

// معالجة إرسال التعليقات
document.addEventListener('submit', function(e) {
  if (e.target.classList.contains('add-comment-form')) {
    e.preventDefault();
    const videoId = e.target.closest('.comments-section').getAttribute('data-video-id');
    const input = e.target.querySelector('input');
    addComment(videoId, input.value);
    input.value = '';
  }
});
}

// إضافة مستمعي الأحداث للأزرار
function addEventListenersToButtons() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const videoId = this.getAttribute('data-id');
      showConfirmModal('هل أنت متأكد من حذف هذا الفيديو؟', (confirmed) => {
        if (confirmed) {
          deleteVideo(videoId);
        }
      });
    });
  });
  
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const url = this.getAttribute('data-url');
      shareVideo(url);
    });
  });
  
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const videoId = this.getAttribute('data-id');
      toggleBookmark(videoId);
    });
  });
}
let comments = JSON.parse(localStorage.getItem('tubeLinkComments')) || {};

function addComment(videoId, text) {
  if (!comments[videoId]) {
    comments[videoId] = [];
  }
  
  comments[videoId].push({
    id: generateId(),
    userId: currentUser.id,
    text: text,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('tubeLinkComments', JSON.stringify(comments));
}
let notifications = JSON.parse(localStorage.getItem('tubeLinkNotifications')) || [];

function addNotification(userId, message) {
  notifications.push({
    userId: userId,
    message: message,
    read: false,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('tubeLinkNotifications', JSON.stringify(notifications));
}
function hashPassword(password) {
  // هذه دالة مبسطة - في التطبيق الحقيقي استخدم مكتبة مثل bcrypt
  return btoa(encodeURIComponent(password));
}
function checkPermission(userId, resourceUserId) {
  return userId === resourceUserId;
}
// تعديل دالة التسجيل
const hashedPassword = hashPassword(password);
const newUser = {
  // ...
  password: hashedPassword
};
// حذف الفيديو
function deleteVideo(videoId) {
  videos = videos.filter(v => v.id !== videoId);
  saveVideos();
  renderVideos();
  showToast('تم حذف الفيديو', 'success');
}
function rateVideo(videoId, rating) {
  if (!ratings[videoId]) {
    ratings[videoId] = [];
  }
  
  const userRating = ratings[videoId].find(r => r.userId === currentUser.id);
  if (userRating) {
    userRating.rating = rating;
  } else {
    ratings[videoId].push({
      userId: currentUser.id,
      rating: rating
    });
  }
  
  localStorage.setItem('tubeLinkRatings', JSON.stringify(ratings));
  showToast('تم تسجيل تقييمك', 'success');
}
// مشاركة الفيديو
function shareVideo(url) {
  if (navigator.share) {
    navigator.share({
      title: 'شاهد هذا الفيديو',
      url: url
    }).catch(() => {
      showToast('تم إلغاء المشاركة', 'error');
    });
  } else {
    prompt('انسخ الرابط لمشاركة الفيديو:', url);
  }
}

// إضافة/إزالة من المفضلة
function toggleBookmark(videoId) {
  if (bookmarks.includes(videoId)) {
    bookmarks = bookmarks.filter(id => id !== videoId);
    showToast('تم إزالة الفيديو من المفضلة', 'info');
  } else {
    bookmarks.push(videoId);
    showToast('تم إضافة الفيديو إلى المفضلة', 'success');
  }
  localStorage.setItem('tubeLinkBookmarks', JSON.stringify(bookmarks));
  renderVideos();
}

// نافذة التأكيد
function showConfirmModal(message, callback) {
  const confirmMessage = document.getElementById('confirmMessage');
  confirmMessage.textContent = message;
  
  confirmModal.classList.add('show');
  
  confirmYes.onclick = function() {
    callback(true);
    confirmModal.classList.remove('show');
  };
  
  confirmNo.onclick = function() {
    callback(false);
    confirmModal.classList.remove('show');
  };
}

// تبديل الثيم
function toggleTheme() {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('tubeLinkTheme', newTheme);
  updateThemeButton(newTheme);
  
  // إعادة تطبيق الأنماط على العناصر الديناميكية
  document.querySelectorAll('.video-card').forEach(card => {
    card.style.backgroundColor = newTheme === 'dark' ? '#1e1e1e' : '#ffffff';
  });
}
function managePlaylists(videoId = null) {
  const modal = document.getElementById('playlistModal');
  const container = document.getElementById('playlistsContainer');
  
  container.innerHTML = playlists.map(playlist => `
    <div class="playlist-item">
      <h4>${playlist.name} (${playlist.videos.length})</h4>
      ${videoId ? `
        <button onclick="addToPlaylist('${playlist.id}', '${videoId}')" 
          ${playlist.videos.includes(videoId) ? 'disabled' : ''}>
          ${playlist.videos.includes(videoId) ? 'مضاف' : 'إضافة'}
        </button>
      ` : ''}
    </div>
  `).join('');
  
  modal.style.display = 'block';
}

function updateThemeButton(theme) {
  const icon = themeButton.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

// التحقق من الوضع الليلي التلقائي
function checkAutoDarkMode() {
  const hour = new Date().getHours();
  const isNightTime = hour > 18 || hour < 6;
  if (isNightTime && body.getAttribute('data-theme') !== 'dark') {
    toggleTheme();
  }
}

// تحويل رابط اليوتيوب
function convertToEmbedUrl(url) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? 
    `https://www.youtube-nocookie.com/embed/${match[2]}?rel=0` : null;
}

// عرض الصفحة الرئيسية
function showMainPage() {
  loginPage.style.display = 'none';
  mainPage.style.display = 'block';
  renderVideos();
}
function openVideoModal(videoUrl) {
  const modal = document.getElementById('videoPlayerModal');
  const videoFrame = document.getElementById('modalVideoFrame');
  
  videoFrame.src = videoUrl;
  modal.style.display = 'block';
  
  // زيادة عدد المشاهدات
  const video = videos.find(v => v.url === videoUrl);
  if (video) {
    video.views++;
    saveVideos();
  }
}
// عرض نموذج التسجيل
function showRegisterForm(e) {
  if (e) e.preventDefault();
  document.getElementById('loginFormContainer').style.display = 'none';
  document.getElementById('registerFormContainer').style.display = 'block';
}

// عرض نموذج تسجيل الدخول
function showLoginForm(e) {
  if (e) e.preventDefault();
  document.getElementById('registerFormContainer').style.display = 'none';
  document.getElementById('loginFormContainer').style.display = 'block';
}

// تسجيل الخروج
function logout() {
  currentUser = null;
  localStorage.removeItem('tubeLinkRememberedUser');
  loginPage.style.display = 'block';
  mainPage.style.display = 'none';
  showLoginForm();
  showToast('تم تسجيل الخروج بنجاح', 'success');
}

// رسائل التنبيه
function showToast(message, type) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const icon = toast.querySelector('i');
  
  toast.className = `toast ${type}`;
  toastMessage.textContent = message;
  icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// توليد ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// تنسيق التاريخ
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// حفظ البيانات
function saveUsers() {
  localStorage.setItem('tubeLinkUsers', JSON.stringify(users));
}

function saveVideos() {
  localStorage.setItem('tubeLinkVideos', JSON.stringify(videos));
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initApp);