document.addEventListener('DOMContentLoaded', () => {
    // -------------------
    // DATA & CONSTANTS
    // -------------------
    const BEADS_PER_ROUND = 108;
    const TOTAL_DAYS = 81;

    const GOUN_TAW = [
        { pali: "အရဟံ", myanmar: "အရဟံ" },
        { pali: "သမ္မာသမ္ဗုဒ္ဓေါ", myanmar: "သမ္မာသမ္ဗုဒ္ဓေါ" },
        { pali: "ဝိဇ္ဇာစရဏသမ္ပန္နော", myanmar: "ဝိဇ္ဇာစရဏသမ္ပန္နော" },
        { pali: "သုဂတော", myanmar: "သုဂတော" },
        { pali: "လောကဝိဒူ", myanmar: "လောကဝိဒူ" },
        { pali: "အနုတ္တရော ပုရိသဒမ္မသာရထိ", myanmar: "အနုတ္တရော ပုရိသဒမ္မသာရထိ" },
        { pali: "သတ္ထာ ဒေဝမနုဿာနံ", myanmar: "သတ္ထာ ဒေဝမနုဿာနံ" },
        { pali: "ဗုဒ္ဓေါ", myanmar: "ဗုဒ္ဓေါ" },
        { pali: "ဘဂဝါ", myanmar: "ဘဂဝါ" }
    ];

    // -------------------
    // DOM ELEMENTS
    // -------------------
    const dayDisplay = document.getElementById('day-display');
    const virtueDisplay = document.getElementById('virtue-display');
    const roundsCompletedDisplay = document.getElementById('rounds-completed-display');
    const roundsTargetDisplay = document.getElementById('rounds-target-display');
    const beadCountDisplay = document.getElementById('bead-count-display');
    const beadButton = document.getElementById('bead-button');
    const resetButton = document.getElementById('reset-button');
    const instructionText = document.querySelector('.instruction-text');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmResetBtn = document.getElementById('confirm-reset');
    const cancelResetBtn = document.getElementById('cancel-reset');
    const todayFinishModal = document.getElementById('today-finish-modal');
    const closeTodayFinishBtn = document.getElementById('close-today-finish');


    // -------------------
    // STATE MANAGEMENT
    // -------------------
    let state = {
        currentDayIndex: 0, // 0 to 80 for 81 days
        currentBeadCount: 0,
        completedRounds: 0,
    };

    function loadState() {
        const savedState = localStorage.getItem('koeNawinState');
        if (savedState) {
            state = JSON.parse(savedState);
        }
    }

    function saveState() {
        localStorage.setItem('koeNawinState', JSON.stringify(state));
    }

    // -------------------
    // CORE LOGIC
    // -------------------
    function getScheduleForDay(dayIndex) {
        const virtueIndex = dayIndex % 9;
        const targetRounds = virtueIndex + 1;
        return {
            dayNumber: dayIndex + 1,
            virtue: GOUN_TAW[virtueIndex],
            targetRounds: targetRounds
        };
    }

    function updateUI() {
        const schedule = getScheduleForDay(state.currentDayIndex);

        dayDisplay.textContent = `နေ့: ${schedule.dayNumber}`;
        virtueDisplay.textContent = schedule.virtue.myanmar;
        roundsTargetDisplay.textContent = schedule.targetRounds;

        roundsCompletedDisplay.textContent = state.completedRounds;
        beadCountDisplay.textContent = state.currentBeadCount;

        if (state.completedRounds >= schedule.targetRounds) {
            instructionText.textContent = `ယနေ့အတွက် ပြီးမြောက်ပါပြီ။ နောက်နေ့ဆက်ရန် အစမှပြန်စရန်ကိုနှိပ်ပါ။`;
            instructionText.classList.add('bg-green-100', 'text-green-700', 'rounded-lg', 'p-3', 'font-bold', 'border', 'border-green-300');
            beadButton.disabled = true;
        } else {
            instructionText.textContent = 'ပုတီးတစ်လုံးချရန် နှိပ်ပါ';
            instructionText.classList.remove('bg-green-100', 'text-green-700', 'rounded-lg', 'p-3', 'font-bold', 'border', 'border-green-300');
            beadButton.disabled = false;
        }
    }

    function handleBeadClick() {
        const schedule = getScheduleForDay(state.currentDayIndex);
        if (state.completedRounds >= schedule.targetRounds) return;

        state.currentBeadCount++;

        if (state.currentBeadCount >= BEADS_PER_ROUND) {
            state.currentBeadCount = 0;
            state.completedRounds++;
            if (state.completedRounds >= schedule.targetRounds) {
                todayFinishModal.classList.remove('hidden');
            }
        }

        saveState();
        updateUI();
    }

    closeTodayFinishBtn.addEventListener('click', () => {
        todayFinishModal.classList.add('hidden');
    });

    function resetProgress(isNextDay = false) {
        if (isNextDay) {
            if (state.currentDayIndex < TOTAL_DAYS - 1) {
                state.currentDayIndex++;
            } else {
                alert("ကိုးနဝင်းအဓိဋ္ဌာန် ၈၁ ရက်လုံး အောင်မြင်စွာ ပြီးဆုံးသွားပါပြီ။");
                state.currentDayIndex = 0; // Cycle back to day 1
            }
        } else {
            state.currentDayIndex = 0;
        }

        state.currentBeadCount = 0;
        state.completedRounds = 0;
        saveState();
        updateUI();
    }

    // -------------------
    // DAILY REMINDER NOTIFICATION
    // -------------------
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    function showDailyReminderNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            const schedule = getScheduleForDay(state.currentDayIndex);
            new Notification('နေ့စဉ် သတိပေးချက်', {
                body: `ယနေ့အတွက် ပုတီးစိပ်ခြင်း မပြီးသေးပါ။ နေ့ ${schedule.dayNumber} အတွက် ပြုလုပ်ပါ။`,
                icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png' // Example icon
            });
        }
    }

    // Schedule notification at a specific time (e.g., 8:00 AM)
    function scheduleDailyReminder() {
        const now = new Date();
        const nextReminder = new Date();
        nextReminder.setHours(8, 0, 0, 0); // 8:00 AM
        if (now > nextReminder) {
            nextReminder.setDate(nextReminder.getDate() + 1);
        }
        const timeout = nextReminder.getTime() - now.getTime();
        setTimeout(() => {
            showDailyReminderNotification();
            // Reschedule for next day
            scheduleDailyReminder();
        }, timeout);
    }

    // Request permission and schedule on load
    requestNotificationPermission();
    scheduleDailyReminder();

    // -------------------
    // EVENT LISTENERS
    // -------------------
    beadButton.addEventListener('click', handleBeadClick);

    let nextDayMode = false;

    resetButton.addEventListener('click', () => {
        const schedule = getScheduleForDay(state.currentDayIndex);
        if (state.completedRounds >= schedule.targetRounds) {
            nextDayMode = true;
        } else {
            nextDayMode = false;
        }
        confirmModal.classList.remove('hidden');
    });

    confirmResetBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        resetProgress(nextDayMode);
    });

    cancelResetBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
    });

    // -------------------
    // INITIALIZATION
    // -------------------
    loadState();
    updateUI();
});