document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE MANAGEMENT ---
    let appState = {
        age: null,
        branch: null,
        screentime: null,
        purpose: null,
        sleep: null,
        headache: null
    };

    // --- DOM ELEMENTS ---
    const views = document.querySelectorAll('.view');
    const navLinks = document.querySelectorAll('.nav-links a[data-target]');
    const brandLogo = document.getElementById('nav-brand');
    
    // Buttons
    const btnStart = document.getElementById('btn-start-assessment');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const btnRerun = document.getElementById('btn-rerun');
    
    // Form Elements
    const formSteps = document.querySelectorAll('.form-step');
    const stepDisplay = document.getElementById('current-step-display');
    const assessmentForm = document.getElementById('assessment-form');

    let currentStep = 1;

    // --- ROUTING / VIEW LOGIC ---
    function navigateTo(viewId) {
        views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update active nav link
        navLinks.forEach(link => {
            if (link.dataset.target === viewId) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        });
    }

    // Nav Event Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.target.dataset.target);
        });
    });

    brandLogo.addEventListener('click', () => {
        navigateTo('view-home');
    });

    btnStart.addEventListener('click', () => {
        navigateTo('view-assessment');
        resetForm();
    });

    btnRerun.addEventListener('click', () => {
        navigateTo('view-assessment');
        resetForm();
    });

    const linkCohortHome = document.getElementById('link-cohort-home');
    if (linkCohortHome) {
        linkCohortHome.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('view-insights');
        });
    }

    const linkCohortResults = document.getElementById('link-cohort-results');
    if (linkCohortResults) {
        linkCohortResults.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('view-insights');
        });
    }

    // --- SLIDER LOGIC ---
    const ageInput = document.getElementById('age');
    const ageDisplay = document.getElementById('age-display');
    if (ageInput && ageDisplay) {
        ageInput.addEventListener('input', (e) => {
            ageDisplay.textContent = e.target.value;
        });
    }

    // --- FORM LOGIC ---
    function updateFormSteps() {
        formSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });
        
        stepDisplay.textContent = currentStep;

        // Button visibility
        if (currentStep === 1) {
            btnPrev.classList.add('hidden');
        } else {
            btnPrev.classList.remove('hidden');
        }

        if (currentStep === formSteps.length) {
            btnNext.classList.add('hidden');
            btnSubmit.classList.remove('hidden');
        } else {
            btnNext.classList.remove('hidden');
            btnSubmit.classList.add('hidden');
        }
    }

    function validateCurrentStep() {
        const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        
        // Custom simple validation since HTML5 validation doesn't trigger on custom 'next' buttons
        inputs.forEach(input => {
            if (input.type === 'radio') {
                const name = input.name;
                const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
                if (!checked) isValid = false;
            } else {
                if (!input.value) isValid = false;
            }
        });

        if (!isValid) {
            alert('Please fill out all required fields before proceeding.');
        }
        return isValid;
    }

    btnNext.addEventListener('click', () => {
        if (validateCurrentStep()) {
            currentStep++;
            updateFormSteps();
        }
    });

    btnPrev.addEventListener('click', () => {
        currentStep--;
        updateFormSteps();
    });

    function resetForm() {
        assessmentForm.reset();
        currentStep = 1;
        updateFormSteps();
        if (ageDisplay && ageInput) {
            ageDisplay.textContent = ageInput.value;
        }
    }

    // --- SUBMIT & ANALYZE ---
    assessmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather Data
        const formData = new FormData(assessmentForm);
        appState.age = parseInt(formData.get('age'));
        appState.branch = formData.get('branch');
        appState.screentime = parseFloat(formData.get('screentime'));
        appState.purpose = formData.get('purpose');
        appState.sleep = parseFloat(formData.get('sleep'));
        appState.headache = formData.get('headache');

        // Go to analyzing screen
        navigateTo('view-analyzing');
        startAnalyzing();
    });

    function startAnalyzing() {
        const progressBar = document.getElementById('analyzing-progress');
        const textEl = document.getElementById('analyzing-text');

        const steps = [
            "Analyzing sleep patterns...",
            "Evaluating screen exposure...",
            "Mapping cognitive load...",
            "Generating AI insights..."
        ];

        let progress = 0;
        let stepIndex = 0;

        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = progress + "%";

            if (stepIndex < steps.length && progress % 25 === 0) {
                if (textEl) textEl.textContent = steps[stepIndex];
                stepIndex++;
            }

            if (progress >= 100) {
                clearInterval(interval);
                generateResults();

                setTimeout(() => {
                    navigateTo('view-results');
                    animateGauge(finalScore);
                }, 300);
            }
        }, 100);
    }

    // --- ALGORITHM & RESULTS GENERATION ---
    let finalScore = 0;

    function generateResults() {
        // --- 1. WEIGHTED SCORING LOGIC ---
        let sleepScore = 40;
        if (appState.sleep < 5) sleepScore = 10;
        else if (appState.sleep < 7) sleepScore = 25;
        else if (appState.sleep > 9) sleepScore = 30;

        let screenScore = 40;
        if (appState.screentime > 12) screenScore = 5;
        else if (appState.screentime > 8) screenScore = 15;
        else if (appState.screentime > 5) screenScore = 30;

        let headacheScore = 20;
        if (appState.headache === 'often') headacheScore = 5;
        else if (appState.headache === 'sometimes') headacheScore = 12;

        let score = sleepScore + screenScore + headacheScore;

        if (appState.purpose === 'gaming' && appState.screentime > 6) score -= 5;
        
        finalScore = Math.max(0, Math.min(100, score));

        // --- AI INSIGHT ---
        const insightEl = document.getElementById('ai-insight-text');

        let insight = "";

        if (appState.sleep < 6 && appState.screentime > 7) {
            insight = `Your high screen time (${appState.screentime}h) combined with low sleep (${appState.sleep}h) is creating cognitive fatigue, which is likely reducing your productivity and increasing strain.`;
        } else if (appState.sleep >= 7 && appState.screentime < 5) {
            insight = `Your balanced sleep and controlled screen time indicate a stable cognitive state with good recovery and focus levels.`;
        } else {
            insight = `Your current habits show moderate strain. Small improvements in sleep and screen usage can significantly improve your performance.`;
        }

        if (insightEl) insightEl.textContent = insight;


        // --- RECOMMENDATIONS ---
        const recEl = document.getElementById('recommendations-list');

        let tips = [];

        if (appState.sleep < 7) {
            tips.push("Increase sleep to at least 7–8 hours for optimal recovery.");
        }
        if (appState.screentime > 6) {
            tips.push("Reduce screen exposure using the 20-20-20 rule.");
        }
        if (appState.headache === "often") {
            tips.push("Frequent headaches detected — improve posture and hydration.");
        }
        if (appState.screentime > 8) {
            tips.push("Consider taking scheduled digital detox breaks.");
        }

        if (recEl) {
            recEl.innerHTML = tips.map(t => `<li>${t}</li>`).join('');
        }


        // --- RISK PREDICTION ---
        const riskEl = document.getElementById('risk-prediction');

        let riskMsg = "";

        if (finalScore < 60) {
            riskMsg = "High risk: Continued habits may lead to burnout within weeks.";
        } else if (finalScore < 80) {
            riskMsg = "Moderate risk: Some strain detected — improvement recommended.";
        } else {
            riskMsg = "Low risk: Your habits are sustainable.";
        }

        if (riskEl) riskEl.textContent = riskMsg;


        // --- SAVE HISTORY ---
        localStorage.setItem("lastScore", finalScore);

        const prev = localStorage.getItem("lastScore");
        const compareEl = document.getElementById("previous-score");

        if (prev && compareEl) {
            compareEl.textContent = `Previous Score: ${prev}`;
        }

        const ctx = document.getElementById('healthChart');

        if (ctx) {
            // Check if chart exists and destroy it before recreating
            if (window.myHealthChart) {
                window.myHealthChart.destroy();
            }
            window.myHealthChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Sleep', 'Screen Time'],
                    datasets: [{
                        label: 'Your Habits',
                        data: [appState.sleep, appState.screentime],
                        backgroundColor: ['#6b9e9e', '#d96c75']
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
        
        // update score text just in case html still has it
        const statusText = document.getElementById('score-status-text');
        if (statusText) {
            if (finalScore >= 80) statusText.textContent = "Resilient";
            else if (finalScore >= 60) statusText.textContent = "Moderate";
            else statusText.textContent = "At Risk";
        }
    }

    // --- GAUGE ANIMATION ---
    function animateGauge(targetScore) {
        const duration = 2000; // ms
        const scoreElement = document.getElementById('score-value');
        const gaugeValue = document.querySelector('.gauge-value');
        
        gaugeValue.classList.remove('gauge-good', 'gauge-warn', 'gauge-risk');
        if (targetScore >= 80) gaugeValue.classList.add('gauge-good');
        else if (targetScore >= 60) gaugeValue.classList.add('gauge-warn');
        else gaugeValue.classList.add('gauge-risk');

        // Reset before animating
        gaugeValue.style.transition = 'none';
        gaugeValue.style.strokeDashoffset = 283;
        scoreElement.textContent = '0';

        // Trigger CSS transition
        setTimeout(() => {
            gaugeValue.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.1, 0.7, 0.1, 1)';
            const maxOffset = 283;
            const targetOffset = maxOffset - (maxOffset * (targetScore / 100));
            gaugeValue.style.strokeDashoffset = targetOffset;
        }, 50);
        
        let startTime = null;
        function animateCounter(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            const easeProgress = progress === duration ? 1 : 1 - Math.pow(2, -10 * progress / duration);
            const currentScore = Math.min(Math.floor(easeProgress * targetScore), targetScore);
            scoreElement.textContent = currentScore;
            
            if (progress < duration) {
                requestAnimationFrame(animateCounter);
            } else {
                scoreElement.textContent = targetScore;
            }
        }
        requestAnimationFrame(animateCounter);
    }
});
