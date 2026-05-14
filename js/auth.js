import { auth, provider, signInWithPopup, onAuthStateChanged, db, ref, get, set } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const btnLogin = document.getElementById('btn-login');
    const viewLogin = document.getElementById('view-login');
    const viewSetup = document.getElementById('view-setup');
    const roleCards = document.querySelectorAll('.role-card');
    const btnSaveProfile = document.getElementById('btn-save-profile');
    const inputFullname = document.getElementById('user-fullname');
    const loader = document.getElementById('global-loader');

    let currentRole = 'student';
    let currentUser = null;

    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentRole = card.dataset.role;
        });
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            try {
                const userSnap = await get(ref(db, 'users/' + user.uid));
                if (userSnap.exists()) {
                    const userData = userSnap.val();
                    if (userData.role && userData.name) {
                        // User fully registered, redirect
                        redirectUser(userData.role, userData.name, user.uid);
                        return;
                    }
                }
                // Need to setup profile
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
                viewLogin.style.display = 'none';
                viewSetup.style.display = 'block';
                inputFullname.value = user.displayName || '';
            } catch (err) {
                console.error("Error fetching user data:", err);
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }
        } else {
            // Not logged in
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
            viewLogin.style.display = 'block';
            viewSetup.style.display = 'none';
        }
    });

    btnLogin.addEventListener('click', () => {
        btnLogin.disabled = true;
        btnLogin.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0;"></div> جاري التسجيل...';
        signInWithPopup(auth, provider).catch(err => {
            console.error(err);
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg> تسجيل الدخول بجوجل';
            alert('حدث خطأ أثناء تسجيل الدخول');
        });
    });

    btnSaveProfile.addEventListener('click', async () => {
        const name = inputFullname.value.trim();
        if (name.split(' ').length < 2) {
            alert('يرجى إدخال اسمك الثنائي أو الثلاثي على الأقل');
            return;
        }

        btnSaveProfile.disabled = true;
        btnSaveProfile.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0;"></div> جاري الحفظ...';

        try {
            await set(ref(db, 'users/' + currentUser.uid), {
                name: name,
                role: currentRole,
                email: currentUser.email,
                createdAt: Date.now()
            });
            redirectUser(currentRole, name, currentUser.uid);
        } catch (err) {
            console.error("Error saving profile:", err);
            alert('حدث خطأ أثناء حفظ البيانات');
            btnSaveProfile.disabled = false;
            btnSaveProfile.innerHTML = 'حفظ ومتابعة <i class="fa-solid fa-arrow-left" style="margin-right: 8px;"></i>';
        }
    });

    function redirectUser(role, name, uid) {
        if (role === 'teacher') {
            localStorage.setItem('teacherId', uid);
            localStorage.setItem('teacherName', name);
        } else {
            localStorage.setItem('studentId', uid);
            localStorage.setItem('studentName', name);
        }

        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('return');

        if (returnUrl) {
            window.location.replace(decodeURIComponent(returnUrl));
        } else {
            if (role === 'teacher') {
                window.location.replace('teacher.html');
            } else {
                window.location.replace('student.html');
            }
        }
    }
});
