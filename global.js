
function showGlobalLoaderAndNavigate(url, message) {
    let loader = document.getElementById('global-loader-overlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader-overlay';
        loader.className = 'join-loader-overlay'; 
        loader.innerHTML = `<div class="loader-bars"><div></div><div></div><div></div><div></div></div><p id="global-loader-text" style="font-family: Arial; font-size: 1.2rem; color: #333; text-align: center; margin-top: 20px;"></p>`;
        document.body.appendChild(loader);
    }
    document.getElementById('global-loader-text').innerText = message || 'Loading, please wait...';
    loader.classList.add('active');

    setTimeout(() => {
        if (url === 'reload') window.location.reload();
        else if (url) { window.location.href = url; setTimeout(() => loader.classList.remove('active'), 500); } 
        else loader.classList.remove('active'); 
    }, 1500); 
}

function showPublicModal(title, message, callback) {
    let overlay = document.getElementById('public-custom-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'public-custom-modal';
        overlay.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(26,35,50,0.8); z-index:99999; justify-content:center; align-items:center; opacity:0; transition:opacity 0.3s ease;';
        let box = document.createElement('div');
        box.style.cssText = 'background:#fff; padding:40px 30px; border-radius:8px; width:90%; max-width:400px; text-align:center; box-shadow:0 15px 40px rgba(0,0,0,0.3); transform:translateY(-20px); transition:transform 0.3s ease; border-top:6px solid #b88b4a;';
        let h3 = document.createElement('h3');
        h3.id = 'public-modal-title';
        h3.style.cssText = 'margin-top:0; color:#1a2332; font-size:1.6rem; font-family:"Times New Roman", serif; margin-bottom:10px;';
        let p = document.createElement('p');
        p.id = 'public-modal-msg';
        p.style.cssText = 'color:#666; margin-bottom:30px; line-height:1.6; font-size:1rem;';
        let btn = document.createElement('button');
        btn.innerText = 'OK';
        btn.style.cssText = 'background:#b88b4a; color:#fff; padding:12px 35px; border:none; border-radius:4px; font-weight:bold; cursor:pointer; font-size:1rem; transition:0.2s; letter-spacing:1px;';
        btn.onmouseover = () => btn.style.background = '#1a2332';
        btn.onmouseout = () => btn.style.background = '#b88b4a';

        box.appendChild(h3); box.appendChild(p); box.appendChild(btn); overlay.appendChild(box); document.body.appendChild(overlay);

        btn.addEventListener('click', () => {
            overlay.style.opacity = '0'; box.style.transform = 'translateY(-20px)';
            setTimeout(() => { overlay.style.display = 'none'; if (overlay.callback) overlay.callback(); }, 300);
        });
    }
    document.getElementById('public-modal-title').innerHTML = title;
    document.getElementById('public-modal-msg').innerHTML = message;
    overlay.callback = callback;
    overlay.style.display = 'flex';
    void overlay.offsetWidth;
    overlay.style.opacity = '1';
    overlay.querySelector('div').style.transform = 'translateY(0)';
}

window.addEventListener('DOMContentLoaded', () => {
   
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && !href.startsWith('javascript:') && this.target !== '_blank' && !this.getAttribute('onclick') && !href.startsWith('#')) {
                e.preventDefault();
                showGlobalLoaderAndNavigate(href, 'Loading...');
            }
        });
    });

    
    document.querySelectorAll('[onclick*="alert("]').forEach(el => {
        const match = el.getAttribute('onclick').match(/alert\(['"]([^'"]+)['"]\)/);
        if (match) el.setAttribute('onclick', `event.preventDefault(); showPublicModal('Notification', '${match[1]}')`);
    });

   
    const splash = document.getElementById('splash-screen');
    if (splash) {
        if (!sessionStorage.getItem('celestia_splashShown')) {
            setTimeout(() => { splash.classList.add('fade-out'); setTimeout(() => splash.style.display = 'none', 1000); }, 3000); 
            sessionStorage.setItem('celestia_splashShown', 'true');
        } else splash.style.display = 'none';
    }

    
    const currentUser = JSON.parse(localStorage.getItem('celestia_currentUser'));
    let userPoints = currentUser ? (currentUser.points || 0) : 0; 
    let userID = currentUser ? (currentUser.id || '2026030704463020') : '2026030704463020';
    const authContainer = document.querySelector('.auth-buttons') || document.querySelector('.nav-auth');
    
    if (currentUser) {
        document.querySelectorAll('a').forEach(a => {
            if ((a.innerText || '').trim() === 'SIGN IN / JOIN') {
                a.innerHTML = `👤 <strong>${currentUser.name}</strong> ▾`;
                a.href = 'dashboard.html';
                a.style.color = '#b88b4a';
                a.style.textDecoration = 'none';
            }
        });

        if (authContainer) {
            authContainer.classList.add('nav-profile-container');
            authContainer.style.display = 'flex';
            authContainer.style.alignItems = 'center';
            authContainer.innerHTML = `
                <a href="dashboard.html" style="color:#1a2332; font-family:'Times New Roman', serif; font-size:1rem; font-weight:bold; text-decoration:none; cursor:pointer; display:flex; align-items:center; gap:8px;">👤 <span>${currentUser.name}</span> ▾</a>
                <div class="profile-dropdown">
                    <h3 class="pd-name">${currentUser.name}</h3><div><span class="pd-tier">CLASSIC</span></div>
                    <div class="pd-label">MEMBER NUMBER</div><div class="pd-value">${userID}</div>
                    <div class="pd-label">AVAILABLE POINTS</div><div class="pd-value" style="color:#b88b4a; font-size:1.2rem;">${userPoints.toLocaleString()} pts</div>
                    <a href="dashboard.html" class="pd-btn-dark">VIEW PROFILE</a>
                    <a href="javascript:void(0);" id="logout-btn-dropdown" class="pd-btn-light">SIGN OUT</a>
                </div>
            `;
            document.getElementById('logout-btn-dropdown').addEventListener('click', (e) => {
                e.preventDefault(); 
                localStorage.removeItem('celestia_currentUser');
                showGlobalLoaderAndNavigate('index.html', 'Signing out. We hope to see you again!');
            });
        }
        document.querySelectorAll('.pts-value').forEach(el => el.innerText = userPoints.toLocaleString());
    }

    
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-question')?.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('active'); if(i.querySelector('.faq-answer')) i.querySelector('.faq-answer').style.maxHeight = null; });
            if (!isActive) { item.classList.add('active'); item.querySelector('.faq-answer').style.maxHeight = item.querySelector('.faq-answer').scrollHeight + "px"; }
        });
    });

    if (new URLSearchParams(window.location.search).get('type') === 'wedding') {
        if(document.querySelector('input[value="ceremonies"]')) document.querySelector('input[value="ceremonies"]').checked = true;
        if(document.getElementById('eventType')) document.getElementById('eventType').value = 'wedding';
    }
});


function selectRoomAndBook(roomName, price) {
    localStorage.setItem('celestia_selectedRoom', JSON.stringify({ name: roomName, price: price }));
    showGlobalLoaderAndNavigate('booking.html', 'Loading Booking Page...');
}

let activeRoomIndex = 0; 
let activeImageIndex = 0;

function openRoomModal(index) { 
    activeRoomIndex = index; 
    activeImageIndex = 0; 
    populateModalData(); 
    document.getElementById('roomDetailsModal').classList.add('active'); 
}

function closeRoomModal() { 
    document.getElementById('roomDetailsModal').classList.remove('active'); 
}

function populateModalData() { 
    if(typeof roomsData === 'undefined') return; 
    const room = roomsData[activeRoomIndex]; 
    
    document.getElementById('rm-modal-tag').innerText = room.tag; 
    document.getElementById('rm-modal-img').src = room.images[activeImageIndex]; 
    document.getElementById('rm-modal-counter').innerText = `${activeImageIndex + 1} / ${room.images.length} - ${room.name}`; 
    document.getElementById('rm-modal-desc').innerText = room.desc; 
    document.getElementById('rm-modal-size').innerText = `🏠 ${room.size}`; 
    document.getElementById('rm-modal-occ').innerText = `👤 Max Occupancy: ${room.occupancy}`; 
    
    const formatPHP = (num) => 'PHP ' + num.toLocaleString('en-US', { minimumFractionDigits: 2 });
    document.getElementById('rm-modal-price').innerText = formatPHP(room.price); 
    document.getElementById('rm-modal-save').innerText = `MEMBERS SAVE ${formatPHP(room.discount)}`; 

    const bookBtn = document.getElementById('rm-modal-book-btn');
    if (bookBtn) {
        bookBtn.setAttribute('onclick', `closeRoomModal(); selectRoomAndBook('${room.name}', ${room.price});`); 
    }

    const amContainer = document.getElementById('rm-modal-amenities'); 
    amContainer.innerHTML = ''; 
    room.amenities.forEach(am => { 
        let div = document.createElement('div'); 
        div.className = 'rm-amen'; 
        div.innerText = am; 
        amContainer.appendChild(div); 
    }); 
}

function changeModalImage(direction) { 
    if(typeof roomsData === 'undefined') return; 
    const room = roomsData[activeRoomIndex]; 
    activeImageIndex += direction; 
    
    if (activeImageIndex < 0) activeImageIndex = room.images.length - 1; 
    if (activeImageIndex >= room.images.length) activeImageIndex = 0; 
    
    document.getElementById('rm-modal-img').src = room.images[activeImageIndex]; 
    document.getElementById('rm-modal-counter').innerText = `${activeImageIndex + 1} / ${room.images.length} - ${room.name}`; 
}

function navigateRoom(direction) { 
    if(typeof roomsData === 'undefined') return; 
    activeRoomIndex += direction; 
    
    if (activeRoomIndex < 0) activeRoomIndex = roomsData.length - 1; 
    if (activeRoomIndex >= roomsData.length) activeRoomIndex = 0; 
    
    activeImageIndex = 0; 
    populateModalData(); 
}


function initializeDatabase() {
    let allUsers = JSON.parse(localStorage.getItem('celestia_allUsers'));
    if (!allUsers || allUsers.length === 0) {
        allUsers = [
            { id: '2026030704463020', name: 'Jabez Dulay', email: 'jabezdulay695@gmail.com', points: 672, tier: 'CLASSIC' }
        ];
        localStorage.setItem('celestia_allUsers', JSON.stringify(allUsers));
    }
}

initializeDatabase();

function handleRegister(event) {
    event.preventDefault(); 
    let fName = document.getElementById('reg-fname') ? document.getElementById('reg-fname').value : 'Guest';
    let lName = document.getElementById('reg-lname') ? document.getElementById('reg-lname').value : '';
    let emailInput = document.getElementById('reg-email') ? document.getElementById('reg-email').value : 'guest@email.com';
    
   
    let newId = new Date().getTime().toString().substring(3);
    const newUser = { id: newId, name: (fName + ' ' + lName).trim(), email: emailInput, points: 0, tier: 'CLASSIC' };
    
    
    localStorage.setItem('celestia_currentUser', JSON.stringify(newUser));
    
    
    let allUsers = JSON.parse(localStorage.getItem('celestia_allUsers')) || [];
    if(!allUsers.some(u => u.email === emailInput)) {
        allUsers.push(newUser);
        localStorage.setItem('celestia_allUsers', JSON.stringify(allUsers));
    }
    
    showGlobalLoaderAndNavigate('index.html', 'Creating your account...');
}

function handleLogin(event, method = 'Email') {
    event.preventDefault(); 
    let emailInput = document.getElementById('email');
    let userEmail = (method === 'Email' && emailInput) ? emailInput.value : `user@${method.toLowerCase()}.com`;
    
    let allUsers = JSON.parse(localStorage.getItem('celestia_allUsers')) || [];
    let existingUser = allUsers.find(u => u.email === userEmail);
    
    let userToLogin;
    if (existingUser) {
        userToLogin = existingUser;
    } else {
        let newId = new Date().getTime().toString().substring(3);
        userToLogin = { id: newId, name: userEmail.split('@')[0], email: userEmail, points: 0, tier: 'CLASSIC' };
        allUsers.push(userToLogin);
        localStorage.setItem('celestia_allUsers', JSON.stringify(allUsers));
    }

    localStorage.setItem('celestia_currentUser', JSON.stringify(userToLogin));
    showGlobalLoaderAndNavigate('index.html', `Authenticating your account...`);
}

function handleSocialRegister(platform) {
    let email = `guest@${platform.toLowerCase()}.com`;
    let allUsers = JSON.parse(localStorage.getItem('celestia_allUsers')) || [];
    let existingUser = allUsers.find(u => u.email === email);
    
    let userToLogin = existingUser || { id: new Date().getTime().toString().substring(3), name: 'Guest', email: email, points: 0, tier: 'CLASSIC' };
    
    if (!existingUser) {
        allUsers.push(userToLogin);
        localStorage.setItem('celestia_allUsers', JSON.stringify(allUsers));
    }
    
    localStorage.setItem('celestia_currentUser', JSON.stringify(userToLogin));
    showGlobalLoaderAndNavigate('index.html', `Connecting with ${platform}...`);
}

function togglePassword() {
    const p = document.getElementById('reg-password') || document.getElementById('password');
    const b = document.querySelector('.toggle-pass-btn') || document.getElementById('toggle-pass-btn');
    if(p && b) { p.type = p.type === 'password' ? 'text' : 'password'; b.innerHTML = p.type === 'password' ? '👁️<br>SHOW' : '👁️<br>HIDE'; }
}


function openMenuModal(key, event) {
    event.preventDefault();
    const modal = document.getElementById('restaurant-menu-modal');
    if(!modal || !menuVariations) return;
    const activeSet = (new Date().getDate() % 2 === 0) ? menuVariations.even : menuVariations.odd;
    if(activeSet[key]) {
        document.getElementById('dynamic-menu-title').innerText = activeSet[key].title;
        document.getElementById('dynamic-menu-subtitle').innerText = activeSet[key].subtitle;
        let html = '';
        activeSet[key].categories.forEach(cat => {
            html += `<h3 style="border-bottom:2px solid #b88b4a; padding-bottom:5px; margin-top:30px; font-size:1.4rem;">${cat.name}</h3>`;
            cat.items.forEach(item => {
                html += `<div style="border-bottom:1px dashed #ddd; padding-bottom:15px; margin-bottom:15px; display:flex; justify-content:space-between;">
                            <div style="text-align:left;"><h4 style="margin-bottom:5px; font-size:1.1rem; color:#1a2332;">${item.name}</h4><p style="color:#666; font-size:0.85rem; font-style:italic;">${item.desc}</p></div>
                            <div style="font-weight:bold; color:#b88b4a; font-size:1.1rem;">${item.price}</div></div>`;
            });
        });
        document.getElementById('dynamic-menu-content').innerHTML = html;
        modal.classList.add('active');
    }
}
function closeMenuModal() { document.getElementById('restaurant-menu-modal')?.classList.remove('active'); }
function toggleDiningMenu(el) { el.nextElementSibling.classList.toggle('active'); el.innerHTML = el.nextElementSibling.classList.contains('active') ? 'HIDE MENU ▴' : 'VIEW MENU ▾'; }
function selectSetup(el) { document.querySelectorAll('.setup-card').forEach(c => c.classList.remove('active')); el.classList.add('active'); }


function submitRFP(e) {
    e.preventDefault();
    let newRFP = {
        dateSubmitted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        clientName: (document.getElementById('rfp-name')?.value || document.querySelectorAll('input[type="text"]')[0]?.value || 'Guest').trim(),
        email: (document.getElementById('rfp-email')?.value || document.querySelector('input[type="email"]')?.value || 'client@email.com'),
        eventType: document.getElementById('eventType') ? document.getElementById('eventType').options[document.getElementById('eventType').selectedIndex].text : 'Corporate / Wedding Event',
        targetDate: document.querySelector('input[type="date"]')?.value || 'TBD',
        pax: document.querySelector('input[placeholder*="Guest"]')?.value || '50+'
    };
    let rfps = JSON.parse(localStorage.getItem('celestia_rfps')) || [];
    rfps.push(newRFP);
    localStorage.setItem('celestia_rfps', JSON.stringify(rfps));
    showPublicModal("Request Submitted Successfully! ✨", "Thank you for choosing Celestia Hotel. Our events team will contact you shortly.", () => showGlobalLoaderAndNavigate('meetings-events.html', 'Redirecting...'));
}
function submitBrochure(e) { e.preventDefault(); showGlobalLoaderAndNavigate('meetings-events.html', 'Sending your brochure request...'); }


function switchTab(e, id) { document.querySelectorAll('.tab-content, .tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(id)?.classList.add('active'); if(e) e.currentTarget.classList.add('active'); }
function switchHotelTab(e, id) { document.querySelectorAll('.hotel-tab-content, .hotel-tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(id)?.classList.add('active'); if(e) e.currentTarget.classList.add('active'); }

function toggleDestForm() { const f = document.getElementById('dest-form'); if(f) f.style.display = f.style.display === 'block' ? 'none' : 'block'; }
function populateCountries() {
    const r = document.getElementById('dest-region').value; const c = document.getElementById('dest-country'); const t = document.getElementById('dest-city');
    c.innerHTML = '<option value="" disabled selected>Select Country</option>'; c.disabled = false; t.innerHTML = '<option value="" disabled selected>Select City first</option>'; t.disabled = true;
    if (r && typeof destinationData !== 'undefined' && destinationData[r]) for (let ctry in destinationData[r]) c.appendChild(new Option(ctry, ctry));
}
function populateCities() {
    const r = document.getElementById('dest-region').value; const c = document.getElementById('dest-country').value; const t = document.getElementById('dest-city');
    t.innerHTML = '<option value="" disabled selected>Select City</option>'; t.disabled = false;
    if (c && typeof destinationData !== 'undefined' && destinationData[r][c]) destinationData[r][c].forEach(city => t.appendChild(new Option(city, city)));
}
function addDestination() {
    const r = document.getElementById('dest-region').value; const c = document.getElementById('dest-country').value; const t = document.getElementById('dest-city').value;
    if (!r || !c || !t) return alert("Please select a Region, Country, and City.");
    const container = document.getElementById('saved-destinations');
    const item = document.createElement('div'); item.className = 'saved-dest-item'; item.innerHTML = `<span><strong>${t}</strong>, ${c} (${r})</span><button onclick="this.parentElement.remove()" style="background:none; border:none; color:red; cursor:pointer; font-weight:bold;">✕ Remove</button>`;
    container.appendChild(item); document.getElementById('dest-region').selectedIndex = 0; populateCountries(); toggleDestForm(); showPublicModal("Destination Added", "Added to your favorites!");
}