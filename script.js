// ========== DOM Elements ==========
const themeButton = document.querySelector('.toggle-theme');
const body = document.body;
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const videoForm = document.getElementById('videoForm');
const videoList = document.getElementById('videoList');
const loginPage = document.getElementById('authPage');
const uploadPage = document.getElementById('uploadPage');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const backToTopBtn = document.querySelector('.back-to-top');
const playlistsSection = document.getElementById('playlistsSection');
const commentsSection = document.getElementById('commentsSection');
const playlistsContainer = document.getElementById('playlistsContainer');
const commentsList = document.getElementById('commentsList');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const playlistForm = document.getElementById('playlistForm');
const commentInput = document.getElementById('commentInput');

// ========== Application Data ==========
let users = JSON.parse(localStorage.getItem('tubeLinkUsers')) || [];
let videos = JSON.parse(localStorage.getItem('tubeLinkVideos')) || [];
let playlists = JSON.parse(localStorage.getItem('tubeLinkPlaylists')) || [];
let comments = JSON.parse(localStorage.getItem('tubeLinkComments')) || [];
let currentUser = null;
let currentView = 'grid';
let selectedVideoId = null;
let videoToDelete = null;

// ========== Initialize App ==========
function initApp() {
  // Load saved theme
  const savedTheme = localStorage.getItem('tubeLinkTheme') || 'dark';
  body.setAttribute('data-theme', savedTheme);
  
  if (savedTheme === 'light') {
    themeButton.innerHTML = '<i class="fas fa-sun"></i> تغيير المظهر';
  }
  
  // Load sample data if empty
  if (users.length === 0) {
    users = [
      {
        id: generateId(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashPassword('admin123'),
        createdAt: new Date().toISOString()
      }
    ];
    saveUsers();
  }
  
  if (videos.length === 0) {
    videos = [
      {
        id: generateId(),
        userId: users[0].id,
        title: 'فيديو تجريبي',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        desc: 'هذا فيديو تجريبي لعرض كيفية عمل التطبيق',
        category: 'ترفيهي',
        tags: ['تجريبي', 'عرض', 'يوتيوب'],
        downloadUrl: generateDownloadUrl('https://www.youtube.com/embed/dQw4w9WgXcQ'),
        createdAt: new Date().toISOString(),
        views: 0,
        rating: 4
      }
    ];
    saveVideos();
  }

  if (playlists.length === 0) {
    playlists = [
      {
        id: generateId(),
        userId: users[0].id,
        name: 'قائمة التشغيل الافتراضية',
        videos: [videos[0].id],
        createdAt: new Date().toISOString()
      }
    ];
    savePlaylists();
  }
  
  // Check for auto-login
  const rememberedUser = localStorage.getItem('tubeLinkRememberedUser');
  if (rememberedUser) {
    const user = users.find(u => u.username === rememberedUser);
    if (user) {
      currentUser = user;
      loginPage.style.display = 'none';
      uploadPage.style.display = 'block';
      renderVideos();
      renderPlaylists();
      document.getElementById('username').value = rememberedUser;
      document.getElementById('rememberMe').checked = true;
    }
  }
  
  // Scroll event for back-to-top button
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  // Enter key for comments
  commentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addComment();
    }
  });
}

// ========== UI Functions ==========
function toggleTheme() {
  if (body.getAttribute('data-theme') === 'dark') {
    body.setAttribute('data-theme', 'light');
    themeButton.innerHTML = '<i class="fas fa-sun"></i> تغيير المظهر';
  } else {
    body.setAttribute('data-theme', 'dark');
    themeButton.innerHTML = '<i class="fas fa-moon"></i> تغيير المظهر';
  }
  localStorage.setItem('tubeLinkTheme', body.getAttribute('data-theme'));
}

function showToast(message, type = 'success') {
  const toastIcon = toast.querySelector('i');
  
  toast.className = `toast ${type}`;
  toastMessage.textContent = message;
  
  if (type === 'success') {
    toastIcon.className = 'fas fa-check-circle';
  } else if (type === 'error') {
    toastIcon.className = 'fas fa-exclamation-circle';
  } else if (type === 'info') {
    toastIcon.className = 'fas fa-info-circle';
  } else if (type === 'warning') {
    toastIcon.className = 'fas fa-exclamation-triangle';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showRegisterForm() {
  document.getElementById('loginFormContainer').style.display = 'none';
  document.getElementById('registerFormContainer').style.display = 'block';
}

function showLoginForm() {
  document.getElementById('loginFormContainer').style.display = 'block';
  document.getElementById('registerFormContainer').style.display = 'none';
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function changeView(view) {
  currentView = view;
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  renderVideos();
}

function showConfirm(message, callback) {
  confirmMessage.textContent = message;
  confirmModal.classList.add('show');
  
  confirmYes.onclick = function() {
    confirmModal.classList.remove('show');
    callback(true);
  };
  
  confirmNo.onclick = function() {
    confirmModal.classList.remove('show');
    callback(false);
  };
}

// ========== Authentication ==========
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  // Show loading state
  document.getElementById('loginText').style.display = 'none';
  document.getElementById('loginSpinner').style.display = 'inline-block';
  document.getElementById('loginBtn').disabled = true;

  // Simulate server request
  await new Promise(resolve => setTimeout(resolve, 1000));

  const hashedPassword = await hashPassword(password);
  const user = users.find(u => u.username === username && u.password === hashedPassword);

  if (user) {
    currentUser = user;
    
    if (rememberMe) {
      localStorage.setItem('tubeLinkRememberedUser', username);
    } else {
      localStorage.removeItem('tubeLinkRememberedUser');
    }
    
    loginPage.style.display = 'none';
    uploadPage.style.display = 'block';
    renderVideos();
    renderPlaylists();
    showToast(`مرحباً ${username}!`, 'success');
  } else {
    showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
  }

  // Hide loading state
  document.getElementById('loginText').style.display = 'inline-block';
  document.getElementById('loginSpinner').style.display = 'none';
  document.getElementById('loginBtn').disabled = false;
});

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords
  if (password !== confirmPassword) {
    showToast('كلمتا المرور غير متطابقتين', 'error');
    return;
  }

  // Check if username exists
  if (users.some(u => u.username === username)) {
    showToast('اسم المستخدم موجود مسبقاً', 'error');
    return;
  }

  // Validate email
  if (!isValidEmail(email)) {
    showToast('البريد الإلكتروني غير صالح', 'error');
    return;
  }

  // Show loading state
  document.getElementById('registerText').style.display = 'none';
  document.getElementById('registerSpinner').style.display = 'inline-block';
  document.getElementById('registerBtn').disabled = true;

  // Simulate server request
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create new user
  const newUser = {
    id: generateId(),
    username,
    email,
    password: await hashPassword(password),
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers();
  
  showToast('تم إنشاء الحساب بنجاح!', 'success');
  showLoginForm();
  
  // Hide loading state
  document.getElementById('registerText').style.display = 'inline-block';
  document.getElementById('registerSpinner').style.display = 'none';
  document.getElementById('registerBtn').disabled = false;
  
  // Reset form
  registerForm.reset();
});

function logout() {
  showConfirm('هل أنت متأكد من تسجيل الخروج؟', (confirmed) => {
    if (confirmed) {
      currentUser = null;
      uploadPage.style.display = 'none';
      loginPage.style.display = 'block';
      showToast('تم تسجيل الخروج بنجاح', 'success');
    }
  });
}

// ========== Video Functions ==========
videoForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  const title = document.getElementById('videoTitle').value.trim();
  let url = document.getElementById('videoUrl').value.trim();
  const category = document.getElementById('videoCategory').value;
  const desc = document.getElementById('videoDesc').value.trim();
  const tags = document.getElementById('videoTags').value.split(',').map(t => t.trim()).filter(t => t);

  // Validate YouTube URL
  if (!isValidYouTubeUrl(url)) {
    showToast('الرجاء إدخال رابط YouTube صالح', 'error');
    return;
  }

  // Convert to embed URL
  url = convertToEmbedUrl(url);

  // Show loading state
  document.getElementById('uploadText').style.display = 'none';
  document.getElementById('uploadSpinner').style.display = 'inline-block';
  document.getElementById('uploadBtn').disabled = true;

  // Simulate server request
  await new Promise(resolve => setTimeout(resolve, 800));

  const video = { 
    id: generateId(),
    userId: currentUser.id,
    title, 
    url, 
    desc,
    category,
    tags,
    downloadUrl: generateDownloadUrl(url),
    createdAt: new Date().toISOString(),
    views: 0,
    rating: 0
  };
  
  videos.unshift(video);
  saveVideos();
  renderVideos();
  videoForm.reset();
  
  showToast('تم رفع الفيديو بنجاح!', 'success');
  
  // Hide loading state
  document.getElementById('uploadText').style.display = 'inline-block';
  document.getElementById('uploadSpinner').style.display = 'none';
  document.getElementById('uploadBtn').disabled = false;
});

function renderVideos(searchTerm = '', category = '', sortBy = 'newest') {
  let filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm) || 
                        video.desc.toLowerCase().includes(searchTerm) ||
                        (video.tags && video.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
    const matchesCategory = !category || video.category === category;
    return matchesSearch && matchesCategory;
  });

  // Sort videos
  switch (sortBy) {
    case 'newest':
      filteredVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      filteredVideos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'title-asc':
      filteredVideos.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      filteredVideos.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'views':
      filteredVideos.sort((a, b) => b.views - a.views);
      break;
  }

  videoList.innerHTML = '';
  
  // Apply view style
  if (currentView === 'list') {
    videoList.classList.add('list-view');
  } else {
    videoList.classList.remove('list-view');
  }

  if (filteredVideos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  filteredVideos.forEach((video) => {
    const videoCard = document.createElement('div');
    videoCard.classList.add('video-card');

    // Add category badge
    if (video.category) {
      const categoryBadge = document.createElement('div');
      categoryBadge.classList.add('video-category');
      categoryBadge.textContent = video.category;
      videoCard.appendChild(categoryBadge);
    }

    const iframe = document.createElement('iframe');
    iframe.src = video.url;
    iframe.title = video.title;
    iframe.allowFullscreen = true;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

    const title = document.createElement('div');
    title.classList.add('video-title');
    title.textContent = video.title;

    const desc = document.createElement('div');
    desc.classList.add('video-desc');
    desc.textContent = video.desc || 'لا يوجد وصف';

    const meta = document.createElement('div');
    meta.classList.add('video-meta');

    const date = document.createElement('span');
    date.textContent = formatDate(video.createdAt);

    const views = document.createElement('span');
    views.textContent = `${video.views} مشاهدات`;

    meta.appendChild(date);
    meta.appendChild(views);

    // Add tags
    if (video.tags && video.tags.length > 0) {
      const tagsContainer = document.createElement('div');
      tagsContainer.classList.add('video-tags');
      
      video.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.classList.add('video-tag');
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
      
      if (currentView === 'list') {
        desc.after(tagsContainer);
      } else {
        meta.after(tagsContainer);
      }
    }

    // Add rating
    const ratingContainer = document.createElement('div');
    ratingContainer.classList.add('rating');
    
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('i');
      star.classList.add('rating-star', 'fas', 'fa-star');
      if (i <= Math.round(video.rating)) {
        star.classList.add('active');
      }
      star.dataset.value = i;
      star.addEventListener('click', () => rateVideo(video.id, i));
      ratingContainer.appendChild(star);
    }
    
    meta.before(ratingContainer);

    const progressContainer = document.createElement('div');
    progressContainer.classList.add('progress-container');
    progressContainer.id = `progress-${video.id}`;
    
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    progressBar.id = `progress-bar-${video.id}`;
    
    progressContainer.appendChild(progressBar);

    const videoActions = document.createElement('div');
    videoActions.classList.add('video-actions');

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> حذف';
    deleteBtn.addEventListener('click', () => {
      videoToDelete = video.id;
      showConfirm(`هل أنت متأكد من حذف الفيديو "${video.title}"؟`, (confirmed) => {
        if (confirmed) {
          videos = videos.filter(v => v.id !== videoToDelete);
          saveVideos();
          renderVideos();
          showToast('تم حذف الفيديو', 'success');
        }
      });
    });

    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('download-btn');
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> تحميل';
    downloadBtn.addEventListener('click', () => {
      downloadVideo(video);
    });

    const shareBtn = document.createElement('button');
    shareBtn.classList.add('share-btn');
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> مشاركة';
    shareBtn.addEventListener('click', () => {
      shareVideo(video.id);
    });

    // Show delete button only for video owner
    if (currentUser && video.userId === currentUser.id) {
      videoActions.appendChild(deleteBtn);
    }
    videoActions.appendChild(downloadBtn);
    videoActions.appendChild(shareBtn);

    if (currentView === 'list') {
      const videoContent = document.createElement('div');
      videoContent.classList.add('video-content');
      
      videoContent.appendChild(title);
      videoContent.appendChild(desc);
      videoContent.appendChild(meta);
      videoContent.appendChild(progressContainer);
      videoContent.appendChild(videoActions);
      
      videoCard.appendChild(iframe);
      videoCard.appendChild(videoContent);
    } else {
      videoCard.appendChild(iframe);
      videoCard.appendChild(title);
      videoCard.appendChild(desc);
      videoCard.appendChild(meta);
      videoCard.appendChild(progressContainer);
      videoCard.appendChild(videoActions);
    }

    videoList.appendChild(videoCard);
  });
}

function rateVideo(videoId, rating) {
  const video = videos.find(v => v.id === videoId);
  if (video) {
    video.rating = rating;
    saveVideos();
    renderVideos();
    showToast('شكراً لتقييمك الفيديو!', 'success');
  }
}

async function downloadVideo(video) {
  try {
    const progressContainer = document.getElementById(`progress-${video.id}`);
    const progressBar = document.getElementById(`progress-bar-${video.id}`);
    
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    // Increase views
    video.views++;
    saveVideos();

    // Simulate download
    await simulateDownload(progressBar);
    
    progressContainer.style.display = 'none';
    showToast(`تم تحميل الفيديو "${video.title}"`, 'success');
    
    // Open download link
    window.open(video.downloadUrl, '_blank');
  } catch (error) {
    showToast('حدث خطأ أثناء التحميل', 'error');
    console.error('Download error:', error);
  }
}

function shareVideo(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (navigator.share) {
    navigator.share({
      title: video.title,
      text: video.desc,
      url: window.location.href + '?video=' + videoId
    }).catch(err => {
      showToast('تم إلغاء المشاركة', 'error');
    });
  } else {
    prompt('انسخ الرابط لمشاركة الفيديو:', window.location.href + '?video=' + videoId);
  }
}

function searchVideos() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  renderVideos(searchTerm);
}

function filterVideos() {
  const category = document.getElementById('categoryFilter').value;
  renderVideos('', category);
}

function sortVideos() {
  const sortBy = document.getElementById('sortFilter').value;
  renderVideos('', '', sortBy);
}

// ========== Playlist Functions ==========
function renderPlaylists() {
  playlistsContainer.innerHTML = '';
  
  if (playlists.length === 0) {
    playlistsContainer.innerHTML = '<p>لا توجد قوائم تشغيل</p>';
    return;
  }

  playlists.forEach(playlist => {
    const playlistCard = document.createElement('div');
    playlistCard.classList.add('playlist-card');
    playlistCard.innerHTML = `
      <h3>${playlist.name}</h3>
      <p>${playlist.videos.length} فيديو</p>
    `;
    playlistCard.addEventListener('click', () => viewPlaylist(playlist.id));
    playlistsContainer.appendChild(playlistCard);
  });
}

function viewPlaylist(playlistId) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return;

  // Filter videos in the playlist
  const playlistVideos = videos.filter(video => 
    playlist.videos.includes(video.id)
  );

  // Show videos
  renderVideos('', '', 'newest', playlistVideos);
  showToast(`عرض قائمة التشغيل: ${playlist.name}`, 'info');
}

function showCreatePlaylistForm() {
  playlistForm.classList.add('show');
  document.querySelector('#playlistsSection button:last-child').style.display = 'none';
}

function hideCreatePlaylistForm() {
  playlistForm.classList.remove('show');
  document.querySelector('#playlistsSection button:last-child').style.display = 'block';
  playlistForm.reset();
}

playlistForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('playlistName').value.trim();
  
  if (!name) {
    showToast('الرجاء إدخال اسم قائمة التشغيل', 'error');
    return;
  }

  const newPlaylist = {
    id: generateId(),
    userId: currentUser.id,
    name,
    videos: [],
    createdAt: new Date().toISOString()
  };
  
  playlists.push(newPlaylist);
  savePlaylists();
  renderPlaylists();
  hideCreatePlaylistForm();
  showToast('تم إنشاء قائمة التشغيل بنجاح', 'success');
});

// ========== Comment Functions ==========
function addComment() {
  const commentText = commentInput.value.trim();
  if (!commentText || !selectedVideoId) {
    showToast('الرجاء إدخال نص التعليق', 'error');
    return;
  }

  const newComment = {
    id: generateId(),
    videoId: selectedVideoId,
    userId: currentUser.id,
    username: currentUser.username,
    text: commentText,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  saveComments();
  renderComments();
  commentInput.value = '';
  showToast('تم إضافة التعليق', 'success');
}

function renderComments() {
  commentsList.innerHTML = '';
  
  const videoComments = comments
    .filter(c => c.videoId === selectedVideoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (videoComments.length === 0) {
    commentsList.innerHTML = '<p>لا توجد تعليقات</p>';
    return;
  }

  videoComments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `
      <div class="comment-author">${comment.username}</div>
      <div class="comment-text">${comment.text}</div>
      <small>${formatDate(comment.createdAt)}</small>
    `;
    commentsList.appendChild(commentElement);
  });
}

// ========== Helper Functions ==========
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'tubeLinkSalt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function saveUsers() {
  localStorage.setItem('tubeLinkUsers', JSON.stringify(users));
}

function saveVideos() {
  localStorage.setItem('tubeLinkVideos', JSON.stringify(videos));
}

function savePlaylists() {
  localStorage.setItem('tubeLinkPlaylists', JSON.stringify(playlists));
}

function saveComments() {
  localStorage.setItem('tubeLinkComments', JSON.stringify(comments));
}

function simulateDownload(progressBar) {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        progressBar.style.width = `${progress}%`;
        setTimeout(resolve, 300);
      } else {
        progressBar.style.width = `${progress}%`;
      }
    }, 200);
  });
}

function convertToEmbedUrl(url) {
    let videoId = '';
    
    // استخراج ID الفيديو من جميع أنواع الروابط
    const patterns = [
      { regex: /youtube\.com\/watch\?v=([^&]+)/, index: 1 },
      { regex: /youtu\.be\/([^?]+)/, index: 1 },
      { regex: /youtube\.com\/embed\/([^?]+)/, index: 1 },
      { regex: /youtube\.com\/shorts\/([^?]+)/, index: 1 }
    ];
  
    for (const pattern of patterns) {
      const match = url.match(pattern.regex);
      if (match) {
        videoId = match[pattern.index];
        break;
      }
    }
  
    if (!videoId) {
      showToast('رابط اليوتيوب غير صالح', 'error');
      return '';
    }
  
    // تنظيف ID الفيديو
    videoId = videoId.split(/[?&/#]/)[0];
  
    // قائمة سيرفرات Invidious الاحتياطية (تحديث 2023)
    const invidiousServers = [
      'https://invidious.snopyta.org',
      'https://invidious.private.co',
      'https://yt.artemislena.eu',
      'https://invidious.lunar.icu'
    ];
  
    // اختيار سيرفر عشوائي
    const server = invidiousServers[Math.floor(Math.random() * invidiousServers.length)];
    
    // معلمات التشغيل
    const params = new URLSearchParams({
      autoplay: 1,
      rel: 0,               // إخفاء الفيديوهات المقترحة
      modestbranding: 1,    // تقليل شعار يوتيوب
      fs: 0,                // إخفاء زر الملء الشاشة
      iv_load_policy: 3,    // إخفاء الشروحات
      disablekb: 1          // تعطيل مفاتيح التحكم
    });
  
    return `${server}/embed/${videoId}?${params.toString()}`;
  }

function isValidYouTubeUrl(url) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return pattern.test(url);
}

function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function generateDownloadUrl(youtubeUrl) {
  const videoId = youtubeUrl.split('/embed/')[1] || youtubeUrl.split('v=')[1].split('&')[0];
  return `https://example.com/download?videoId=${videoId}&user=${currentUser?.id || 'guest'}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initApp);

async function updateInvidiousServers() {
    try {
      const response = await fetch('https://api.invidious.io/instances.json');
      const servers = await response.json();
      // تصفية السيرفرات العاملة
      return servers
        .filter(server => server[1].type === 'https')
        .map(server => `https://${server[1].uri}`);
    } catch (error) {
      console.error('Failed to update servers:', error);
      return []; // العودة للقائمة الافتراضية
    }
  }