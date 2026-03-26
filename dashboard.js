// =========================================
// DASHBOARD, PROFILE & POINTS LOGIC
// =========================================

window.addEventListener('DOMContentLoaded', () => {
    // Kukunin agad natin kung sino ang naka-login
    const currentUser = JSON.parse(localStorage.getItem('celestia_currentUser'));

    // ==========================================
    // FIX: UPDATE MAIN DASHBOARD PROFILE CARD
    // ==========================================
    if (currentUser) {
        // Hahanapin ng system yung mga hardcoded text at papalitan ng totoong info mo
        document.querySelectorAll('*').forEach(el => {
            if (el.children.length === 0 && el.innerText) {
                let txt = el.innerText.trim();
                
                // Palitan ang "Guest User" ng totoong pangalan
                if (txt === 'Guest User' || txt === 'Welcome Guest User') {
                    el.innerText = currentUser.name;
                }
                // Palitan ang dummy Member ID ng totoong ID mo
                if (txt === '2026030704463' || txt === '2026030704463020') {
                    el.innerText = currentUser.id || '2026030704463020';
                }
            }
        });

        // Hahanapin yung label na "POINTS AVAILABLE" tapos u-update yung number sa ilalim niya
        document.querySelectorAll('*').forEach(el => {
            if (el.children.length === 0 && el.innerText && el.innerText.trim() === 'POINTS AVAILABLE') {
                let target = el.nextElementSibling;
                if (target && target.innerText.trim() === '0') {
                    target.innerText = (currentUser.points || 0).toLocaleString();
                }
            }
        });
    }

    // ==========================================
    // Populate Bookings (FILTERED PARA SA USER)
    // ==========================================
    const allBookingsContainer = document.getElementById('all-bookings-container');
    if (allBookingsContainer && currentUser) {
        let allSavedBookings = JSON.parse(localStorage.getItem('celestia_bookings')) || [];
        
        // SALAIN (Filter) - Kunin lang ang mga bookings na kapareho ng email ng user!
        let myBookings = allSavedBookings.filter(booking => booking.ownerEmail === currentUser.email);

        if (myBookings.length > 0) {
            let bookingsHTML = '';
            myBookings.slice().reverse().forEach(booking => {
                let statusColor = booking.status === 'Cancelled' ? '#a10022' : '#28a745';
                bookingsHTML += `
                    <div style="border: 1px solid #eaeaea; padding: 25px; margin-bottom: 20px; text-align: left; background: #fff; border-left: 5px solid #b88b4a; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h3 style="margin: 0; margin-bottom: 15px; color: #1a2332; font-family: 'Times New Roman', serif; font-size: 1.5rem;">${booking.room}</h3>
                                <p style="margin: 5px 0; color: #555; font-family: Arial, sans-serif;"><strong>Booking ID:</strong> ${booking.id}</p>
                                <p style="margin: 5px 0; color: #555; font-family: Arial, sans-serif;"><strong>Dates:</strong> ${booking.dates}</p>
                                <p style="margin: 5px 0; color: #555; font-family: Arial, sans-serif;"><strong>Guests:</strong> ${booking.guests}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-size: 0.9rem; color: #888;">Total Amount</p>
                                <p style="margin: 5px 0 15px 0; color: #b88b4a; font-size: 1.3rem; font-weight: bold;">${booking.total}</p>
                                <span style="display: inline-block; padding: 6px 15px; background: ${statusColor}; color: white; font-size: 0.85rem; font-weight: bold; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase;">${booking.status.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>`;
            });
            allBookingsContainer.innerHTML = bookingsHTML;
        } else {
            allBookingsContainer.innerHTML = `<h2 style="color: #1a2332; font-weight: normal;">No Bookings Made</h2>`;
        }
    }

    // ==========================================
    // Populate Points History
    // ==========================================
    const pointsHistoryTab = document.getElementById('tab-points-history');
    if (pointsHistoryTab) {
        let ptsHistory = JSON.parse(localStorage.getItem('celestia_points_history')) || [];
        if (ptsHistory.length > 0) {
            let ptsHTML = `<div style="padding:30px; text-align:left; background:#fff; border:1px solid #eaeaea; margin-top:20px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);"><h2 style="font-family:'Times New Roman', serif; color:#1a2332; margin-top:0; border-bottom:2px solid #b88b4a; padding-bottom:15px;">Recent Points Transactions</h2>`;
            ptsHistory.slice().reverse().forEach(record => {
                ptsHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding:20px 0; border-bottom:1px dashed #eaeaea;"><div><p style="margin:0 0 5px 0; font-weight:bold; color:#1a2332; font-size:1.1rem;">${record.desc}</p><p style="margin:0; font-size:0.9rem; color:#888;">Date: ${record.date}</p></div><div style="color:#28a745; font-weight:bold; font-size:1.4rem;">${record.points}</div></div>`;
            });
            ptsHTML += `</div>`; pointsHistoryTab.innerHTML = ptsHTML;
        }
    }

    // ==========================================
    // Fill Account Profile Forms
    // ==========================================
    if (currentUser && document.getElementById('acc-fname')) {
        let parts = currentUser.name.split(' ');
        document.getElementById('acc-fname').value = parts[0] || '';
        document.getElementById('acc-lname').value = parts.slice(1).join(' ') || '';
        document.getElementById('acc-email').value = currentUser.email || '';
    }
});

// Tab Switches
function switchAccountTab(e, id) { document.querySelectorAll('.acct-tab-content, .acct-tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(id).classList.add('active'); if(e) e.currentTarget.classList.add('active'); }
function switchPointsTab(e, id) { document.querySelectorAll('.pts-tab-content, .pts-tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(id).classList.add('active'); if(e) e.currentTarget.classList.add('active'); }
function switchHistoryTab(e, id) { document.querySelectorAll('.hist-tab-content, .hist-tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(id).classList.add('active'); if(e) e.currentTarget.classList.add('active'); }
function switchLifestyleTab(e, id) { document.querySelectorAll('.ls-tab-content, .ls-tab-btn').forEach(el => el.classList.remove('active')); document.getElementById(id).classList.add('active'); if(e) e.currentTarget.classList.add('active'); }

// Profile Update
function updateProfile(event) {
    event.preventDefault();
    let user = JSON.parse(localStorage.getItem('celestia_currentUser')) || { points: 0 };
    user.name = document.getElementById('acc-fname').value + ' ' + document.getElementById('acc-lname').value;
    user.email = document.getElementById('acc-email').value;
    localStorage.setItem('celestia_currentUser', JSON.stringify(user));
    showPublicModal("Success!", "Your profile has been updated.", () => showGlobalLoaderAndNavigate('reload', 'Refreshing profile...'));
}

function deleteAccount() {
    if (confirm("WARNING: Are you sure you want to delete your Celestia account? This action cannot be undone.")) {
        localStorage.removeItem('celestia_currentUser');
        showGlobalLoaderAndNavigate('index.html', 'Deleting your account...');
    }
}

function toggleNomineeForm() {
    const btn = document.getElementById('add-nominee-btn'); const form = document.getElementById('nominee-form');
    if (form.style.display === 'none') { form.style.display = 'block'; btn.style.display = 'none'; } 
    else { form.style.display = 'none'; btn.style.display = 'flex'; ['nom-loyalty','nom-email','nom-fname','nom-lname'].forEach(id => document.getElementById(id).value = ''); checkNomineeFields(); }
}
function checkNomineeFields() {
    const btn = document.getElementById('nominate-btn');
    if (['nom-loyalty','nom-email','nom-fname','nom-lname'].every(id => document.getElementById(id).value !== '')) { btn.style.backgroundColor = '#1a2332'; btn.style.color = '#fff'; } 
    else { btn.style.backgroundColor = '#e0e0e0'; btn.style.color = '#888'; }
}
function submitNominee() {
    if (!['nom-loyalty','nom-email','nom-fname','nom-lname'].every(id => document.getElementById(id).value !== '')) return showPublicModal('Error', 'Please complete all fields to add a nominee.');
    showPublicModal("Success!", "Nominee added successfully. You can now transfer points to them.", () => toggleNomineeForm());
}

function openVoucherModal() { document.getElementById('voucherModal')?.classList.add('active'); }
function closeVoucherModal() { document.getElementById('voucherModal')?.classList.remove('active'); }
function changeDisplayPicture() { showPublicModal('Opening File Explorer', 'This feature allows photo uploads.'); }
function linkFacebook() { showPublicModal('Facebook Link', 'Connecting to Facebook API...'); }
function unlinkAccount(provider) { if(confirm(`Unlink ${provider}?`)) showPublicModal('Success', `${provider} unlinked.`); }
function changePassword(e) { e.preventDefault(); e.target.reset(); showPublicModal('Password Updated', 'Your new password is saved.'); }
function savePreferences() { showPublicModal('Preferences Saved', 'Communication settings updated.'); }
function toggleExPref(cId, oId) { const c = document.getElementById(cId); const o = document.getElementById(oId); if (!c.classList.contains('active')) { c.classList.add('active'); o.classList.remove('active'); } else c.classList.remove('active'); }
function toggleInterest(el) { el.classList.toggle('active'); }