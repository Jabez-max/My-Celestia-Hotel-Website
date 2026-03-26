let adultsCount = 2; let childrenCount = 0; let roomsCount = 1;
let currentDate = new Date(); 
let checkInDate = new Date(); checkInDate.setHours(0,0,0,0);
let checkOutDate = new Date(); checkOutDate.setDate(checkInDate.getDate() + 1); checkOutDate.setHours(0,0,0,0);
let isBookingProcessing = false; 

window.addEventListener('DOMContentLoaded', () => {
    // DYNAMIC CHECKOUT PAGE
    const isBookingPage = document.querySelector('.booking-page') || document.body.innerHTML.includes('Checkout');
    const currentUser = JSON.parse(localStorage.getItem('celestia_currentUser'));

    if (isBookingPage) {
        try {
            let settings = JSON.parse(localStorage.getItem('celestia_settings')) || { discount: 12 };
            let adminDiscount = parseInt(settings.discount) || 12;

            if (currentUser) {
                // Palitan ang header ng Guest Details
                document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span').forEach(el => {
                    if (el.innerText && el.innerText.trim() === 'Or continue as a non-member and pay the full rate') el.innerText = 'Guest Reservation Details';
                });

                // Palitan ang Promo Box at gawing Green
                let allDivs = document.querySelectorAll('div');
                for (let div of allDivs) {
                    if (div.innerText && div.innerText.includes('MEMBERS SAVE') && div.innerText.length < 500) {
                        div.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><div><h3 style="margin:0; color:#1a2332; font-family:'Times New Roman', serif; font-size:1.4rem;">Member Discount Applied!</h3><p style="margin:5px 0 0 0; color:#666; font-size:0.95rem;">Logged in as <strong>${currentUser.name}</strong>. Enjoy your exclusive <strong>${adminDiscount}%</strong> rate.</p></div><span style="background:#28a745; color:white; padding:8px 15px; border-radius:4px; font-weight:bold; font-size:0.85rem; letter-spacing:1px; display:inline-block;">✓ ${adminDiscount}% OFF</span></div>`;
                        div.style.cssText = 'background-color:#e8f5e9; border:1px solid #28a745; border-left:5px solid #28a745; padding:20px;';
                        break; 
                    }
                }

                // Itago ang lumang Sign In Buttons
                document.querySelectorAll('button, .btn').forEach(btn => {
                    let txt = btn.innerText || '';
                    if ((txt.includes('SIGN IN') || txt.includes('JOIN NOW')) && !btn.closest('header')) btn.style.display = 'none';
                });

                // Autofill Name and Email
                setTimeout(() => {
                    document.querySelectorAll('input').forEach(input => {
                        let ph = (input.placeholder || '').toLowerCase(); let nameTitle = (input.previousElementSibling ? (input.previousElementSibling.innerText || '') : '').toLowerCase();
                        if (ph.includes('first') || nameTitle.includes('first')) { input.value = currentUser.name.split(' ')[0] || ''; input.style.backgroundColor = '#f4f6f9'; } 
                        else if (ph.includes('last') || nameTitle.includes('last')) { input.value = currentUser.name.split(' ').slice(1).join(' ') || ''; input.style.backgroundColor = '#f4f6f9'; } 
                        else if (ph.includes('email') || input.type === 'email' || nameTitle.includes('email')) { input.value = currentUser.email || ''; input.style.backgroundColor = '#f4f6f9'; }
                    });
                }, 300);
            }
        } catch(e) { console.error("Checkout UI safe-catch:", e); }
        
        // MAHALAGA: Ito ang mag-t-trigger ng presyo at info sa kanan!
        updateDisplayInput(); 
        updateCount('init', 0); 
        recalculateTotal();
    }

    // CONFIRMATION PAGE LOGIC (Kasama na yung E-receipt Math natin!)
    const isConfirmationPage = document.querySelector('.confirmation-page') || document.body.innerHTML.includes('Booking Confirmed');
    if(isConfirmationPage) {
        let bookings = JSON.parse(localStorage.getItem('celestia_bookings')) || [];
        let settings = JSON.parse(localStorage.getItem('celestia_settings')) || { discount: 12 };
        if(bookings.length > 0) {
            let b = bookings[bookings.length - 1];
            ['conf-id', 'conf-room', 'conf-dates', 'conf-guests', 'conf-total'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerText = b[id.split('-')[1]]; });
            
            if(currentUser) {
                if(document.getElementById('conf-name')) document.getElementById('conf-name').innerText = currentUser.name;
                if(document.getElementById('conf-email')) document.getElementById('conf-email').innerText = currentUser.email;
                let num = parseFloat(b.total.replace(/[^\d.-]/g, ''));
                if(document.getElementById('conf-points')) document.getElementById('conf-points').innerText = "+" + (isNaN(num) ? 0 : Math.floor(num * 0.10)).toLocaleString() + " pts";
                if(document.getElementById('conf-savings')) document.getElementById('conf-savings').innerText = '- PHP ' + ((num / (1 - ((parseInt(settings.discount)||12)/100))) - num).toLocaleString('en-US', {minimumFractionDigits:2});
            } else {
                if(document.getElementById('conf-name')) document.getElementById('conf-name').innerText = "Walk-in Guest";
                if(document.getElementById('conf-email')) document.getElementById('conf-email').innerText = "N/A";
                ['points-container', 'savings-row'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = 'none'; });
            }
        }
    }
});

// MAG-CO-COMPUTE NG LAHAT NG PRESYO SA KANAN (SUPER SMART FALLBACK)
function recalculateTotal() {
    try {
        const roomData = JSON.parse(localStorage.getItem('celestia_selectedRoom')) || { name: 'Classic Deluxe Room', price: 8500 };
        let nights = (checkInDate && checkOutDate) ? Math.max(1, Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))) : 1;
        let adminDiscount = parseInt((JSON.parse(localStorage.getItem('celestia_settings')) || {}).discount) || 12;
        let currentUser = JSON.parse(localStorage.getItem('celestia_currentUser'));

        let baseTotal = (roomData.price || 0) * roomsCount * nights;
        let finalTotal = currentUser ? (baseTotal - (baseTotal * (adminDiscount / 100))) : baseTotal;

        const formatPHP = (num) => 'PHP ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        // 1. I-update kung may IDs
        const safeUpdate = (id, val) => { if(document.getElementById(id)) document.getElementById(id).innerText = val; };
        safeUpdate('summary-subtotal', formatPHP(baseTotal));
        safeUpdate('summary-grand-total', formatPHP(finalTotal));
        safeUpdate('summary-paid-later', formatPHP(finalTotal));
        safeUpdate('summary-room-name', roomData.name);

        let occ = `${adultsCount} Adults, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}`;
        safeUpdate('summary-occupancy', occ);

        let dur = (checkInDate && checkOutDate) ? `${String(checkInDate.getDate()).padStart(2, '0')}/${checkInDate.toLocaleString('en-US', { month: 'short' })}/${checkInDate.getFullYear()} - ${String(checkOutDate.getDate()).padStart(2, '0')}/${checkOutDate.toLocaleString('en-US', { month: 'short' })}/${checkOutDate.getFullYear()} (${nights} ${nights === 1 ? "Night" : "Nights"})` : "Select Check-out";
        safeUpdate('summary-duration', dur);

        // 2. SUPER FALLBACK: Kahit walang ID yung HTML mo, hahanapin pa rin niya yung pwesto at ilalagay ang tamang text!
        document.querySelectorAll('*').forEach(el => {
            if (el.children.length === 0 && el.innerText) {
                let txt = el.innerText.trim();
                let target = el.nextElementSibling || (el.parentElement ? el.parentElement.nextElementSibling : null);
                if (target) {
                    if (txt === 'YOUR TOTAL' || txt.includes('Amount to be paid later')) target.innerText = formatPHP(finalTotal);
                    if (txt === 'SUBTOTAL') target.innerText = formatPHP(baseTotal);
                    if (txt === 'Duration of stay:') target.innerText = dur;
                    if (txt === 'Occupancy:') target.innerText = occ;
                    if (txt === 'Your selection:') target.innerHTML = `<strong>${roomData.name}</strong><br><span style="font-size:0.85rem; color:#666;">The Flexible Rate with Breakfast</span>`;
                }
            }
        });

    } catch (err) { console.error('Calculation Error:', err); }
}

function confirmBooking(event) {
    event.preventDefault(); 
    if (isBookingProcessing) return; isBookingProcessing = true; 

    // KUNIN ANG USER DETAILS (PARA SA FILTERING NATIN SA HISTORY LATER)
    let currentUser = JSON.parse(localStorage.getItem('celestia_currentUser'));
    let ownerEmail = currentUser ? currentUser.email : "guest@walkin.com";
    let ownerName = currentUser ? currentUser.name : "Walk-in Guest";

    let elTotal = document.getElementById('summary-grand-total');
    let fallbackTotal = null;
    document.querySelectorAll('*').forEach(el => { if(el.innerText && el.innerText.trim() === 'YOUR TOTAL') fallbackTotal = el.nextElementSibling ? el.nextElementSibling.innerText : null; });
    
    let totalAmount = (elTotal && elTotal.innerText.includes('PHP')) ? elTotal.innerText : (fallbackTotal || 'PHP 8,500.00');
    let bookingID = "CEL-" + Math.floor(100000 + Math.random() * 900000);
    
    let bookings = JSON.parse(localStorage.getItem('celestia_bookings')) || [];
    bookings.push({ 
        id: bookingID, 
        room: (JSON.parse(localStorage.getItem('celestia_selectedRoom')) || { name: 'Classic Deluxe Room' }).name, 
        dates: document.getElementById('date-display') ? document.getElementById('date-display').value : '11/Mar/2026 - 12/Mar/2026', 
        guests: document.getElementById('guest-display') ? document.getElementById('guest-display').value : '2 Adults, 0 Children', 
        total: totalAmount, 
        status: 'Confirmed',
        ownerEmail: ownerEmail, // <--- ADDED: Email Tag
        ownerName: ownerName    // <--- ADDED: Name Tag
    });
    localStorage.setItem('celestia_bookings', JSON.stringify(bookings));

    if (currentUser) {
        let earned = Math.floor(parseFloat(totalAmount.replace(/[^\d.-]/g, '')) * 0.10);
        currentUser.points = (currentUser.points || 0) + earned;
        localStorage.setItem('celestia_currentUser', JSON.stringify(currentUser));

        let ptsHistory = JSON.parse(localStorage.getItem('celestia_points_history')) || [];
        ptsHistory.push({ date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), desc: `Reward from Room Booking (${bookingID})`, points: `+${earned.toLocaleString()} pts` });
        localStorage.setItem('celestia_points_history', JSON.stringify(ptsHistory));

        // Paki-update din sa Main Admin Database para accurate ang guest points
        let allUsers = JSON.parse(localStorage.getItem('celestia_allUsers')) || [];
        let uIndex = allUsers.findIndex(u => u.email === currentUser.email);
        if(uIndex !== -1) {
            allUsers[uIndex].points = currentUser.points;
            localStorage.setItem('celestia_allUsers', JSON.stringify(allUsers));
        }
    }
    showGlobalLoaderAndNavigate('confirmation.html', 'Processing your secure payment...');
}

// CALENDAR AND GUEST POPUP LOGIC
function toggleDatePopup() { const d = document.getElementById('date-popup'); const g = document.getElementById('guest-popup'); if (d) { d.classList.toggle('active'); if (g) g.classList.remove('active'); if (d.classList.contains('active')) renderCalendar(); } }
function toggleGuestPopup() { const g = document.getElementById('guest-popup'); const d = document.getElementById('date-popup'); if (g) { g.classList.toggle('active'); if (d) d.classList.remove('active'); } }
document.addEventListener('click', e => { const d = document.getElementById('date-group'); const p = document.getElementById('date-popup'); if (d && p && !d.contains(e.target) && !e.target.classList.contains('cal-arrow')) p.classList.remove('active'); const g = document.getElementById('guest-group'); const gp = document.getElementById('guest-popup'); if (g && gp && !g.contains(e.target)) gp.classList.remove('active'); });

function updateCount(type, change) {
    if (type === 'adults') { adultsCount = Math.max(1, adultsCount + change); document.getElementById('adults-count').innerText = adultsCount; document.getElementById('adults-minus').classList.toggle('disabled', adultsCount <= 1); } 
    else if (type === 'children') { childrenCount = Math.max(0, childrenCount + change); document.getElementById('children-count').innerText = childrenCount; document.getElementById('children-minus').classList.toggle('disabled', childrenCount <= 0); } 
    else if (type === 'rooms') { roomsCount = Math.max(1, Math.min(4, roomsCount + change)); document.getElementById('rooms-count').innerText = roomsCount; document.getElementById('rooms-minus').classList.toggle('disabled', roomsCount <= 1); }
    if (document.getElementById('guest-display')) document.getElementById('guest-display').value = `${adultsCount} Adults, ${childrenCount} ${childrenCount === 1 ? "Child" : "Children"}, ${roomsCount} ${roomsCount === 1 ? "Room" : "Rooms"}`;
    recalculateTotal();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-days'); if (!grid) return; grid.innerHTML = '';
    let y = currentDate.getFullYear(); let m = currentDate.getMonth(); document.getElementById('cal-month-year').innerText = `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m]} ${y}`;
    for (let i = 0; i < new Date(y, m, 1).getDay(); i++) { let div = document.createElement('div'); div.className = 'date-cell empty'; grid.appendChild(div); }
    for (let i = 1; i <= new Date(y, m + 1, 0).getDate(); i++) {
        let div = document.createElement('div'); div.className = 'date-cell'; div.innerText = i; let cD = new Date(y, m, i); cD.setHours(0,0,0,0);
        if (checkInDate && cD.getTime() === checkInDate.getTime()) div.classList.add('selected', 'start');
        if (checkOutDate && cD.getTime() === checkOutDate.getTime()) div.classList.add('selected', 'end');
        if (checkInDate && checkOutDate && cD > checkInDate && cD < checkOutDate) div.classList.add('in-range');
        div.onclick = () => { if (!checkInDate || (checkInDate && checkOutDate)) { checkInDate = cD; checkOutDate = null; } else if (cD > checkInDate) checkOutDate = cD; else { checkInDate = cD; checkOutDate = null; } renderCalendar(); updateDisplayInput(); recalculateTotal(); };
        grid.appendChild(div);
    }
}

function changeMonth(s) { currentDate.setMonth(currentDate.getMonth() + s); renderCalendar(); }

function updateDisplayInput() {
    const dBox = document.getElementById('date-display'); if (!dBox) return;
    const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}/${d.toLocaleString('en-US', { month: 'short' })}/${d.getFullYear()}`;
    if (checkInDate && checkOutDate) { dBox.value = `${fmt(checkInDate)} - ${fmt(checkOutDate)}`; setTimeout(toggleDatePopup, 400); } 
    else if (checkInDate) dBox.value = `${fmt(checkInDate)} - Select Check-out`;
}