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
            beadButton.classList.add('completed');
            beadButton.disabled = true;
        } else {
            instructionText.textContent = 'ပုတီးတစ်လုံးချရန် နှိပ်ပါ';
            beadButton.classList.remove('completed');
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
        }

        saveState();
        updateUI();
    }

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
    // EVENT LISTENERS
    // -------------------
    beadButton.addEventListener('click', handleBeadClick);

    resetButton.addEventListener('click', () => {
        const schedule = getScheduleForDay(state.currentDayIndex);

        // If current day is completed, confirm to move to next day
        if (state.completedRounds >= schedule.targetRounds) {
            if (confirm("ယနေ့အတွက် ပြီးမြောက်ပါပြီ။ နောက်တစ်နေ့သို့ ကူးပြောင်းလိုပါသလား?")) {
                resetProgress(true); // true means move to next day
            }
        } else {
            // If not completed, confirm to reset all progress
            if (confirm("လက်ရှိ ပြုလုပ်ထားသမျှကို ဖျက်ပြီး ပထမဆုံးနေ့မှ အစပြန်ပြုလုပ်လိုပါသလား?")) {
                resetProgress(false); // false means reset to day 1
            }
        }
    });

    // -------------------
    // INITIALIZATION
    // -------------------
    loadState();
    updateUI();
});