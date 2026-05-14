import { auth, onAuthStateChanged, signOut, db, ref, get } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const studentNameLabel = document.getElementById('student-name-label');
    const studentChipAv = document.getElementById('student-chip-av');
    const welcomeTitle = document.getElementById('welcome-title');
    const btnEnterExam = document.getElementById('btn-enter-exam');
    const examCodeInput = document.getElementById('exam-code-input');

    let studentName = localStorage.getItem('studentName');
    
    if (studentName) {
        setStudentUI(studentName);
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const userSnap = await get(ref(db, 'users/' + user.uid));
                if (userSnap.exists()) {
                    const userData = userSnap.val();
                    if (userData.role !== 'student') {
                        window.location.replace('index.html');
                        return;
                    }
                    studentName = userData.name || 'طالب';
                    localStorage.setItem('studentId', user.uid);
                    localStorage.setItem('studentName', studentName);
                    setStudentUI(studentName);
                } else {
                    window.location.replace('index.html');
                }
            } catch (err) {
                console.error('Error verifying student:', err);
            }
        } else {
            window.location.replace('index.html');
        }
    });

    document.getElementById('student-chip').addEventListener('click', () => {
        if (confirm('هل تريد تسجيل الخروج؟')) {
            signOut(auth);
        }
    });

    btnEnterExam.addEventListener('click', () => {
        const code = examCodeInput.value.trim().toUpperCase();
        if (!code) {
            alert('يرجى إدخال كود الامتحان');
            return;
        }
        window.location.href = `exam.html?id=${code}#${code}`;
    });

    function setStudentUI(name) {
        studentNameLabel.textContent = name;
        studentChipAv.textContent = name.charAt(0).toUpperCase();
        welcomeTitle.textContent = `مرحباً بك يا ${name}!`;
    }
});
