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
        let progress = 0;
        progressBar.style.width = '0%';

        const interval = setInterval(() => {
            progress += 5; // increment progress
            progressBar.style.width = progress + '%';
            
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
        // Simple mock algorithm
        let score = 100;
        
        // Sleep factor
        if (appState.sleep < 6) score -= 15;
        else if (appState.sleep < 7) score -= 5;
        else if (appState.sleep >= 8) score += 5;

        // Screentime factor
        if (appState.screentime > 8) score -= 15;
        else if (appState.screentime > 5) score -= 5;

        // Headache factor
        if (appState.headache === 'often') score -= 20;
        else if (appState.headache === 'sometimes') score -= 10;

        score = Math.max(0, Math.min(100, score)); // Clamp between 0-100
        finalScore = score;

        // Update DOM elements based on score
        
        // Status text
        const statusText = document.getElementById('score-status-text');
        const regulationStatus = document.getElementById('regulation-status');
        if (score >= 80) {
            statusText.textContent = "Resilient";
            regulationStatus.textContent = "well-regulated.";
            regulationStatus.style.color = "var(--accent-teal)";
        } else if (score >= 60) {
            statusText.textContent = "Moderate";
            regulationStatus.textContent = "experiencing minor strain.";
            regulationStatus.style.color = "var(--accent-teal)";
        } else {
            statusText.textContent = "At Risk";
            regulationStatus.textContent = "overloaded.";
            regulationStatus.style.color = "var(--accent-red)";
        }

        // Signals text
        document.getElementById('signal-issue').textContent = appState.headache === 'often' ? 'chronic headache' : (appState.headache === 'sometimes' ? 'mild headache' : 'eye strain');
        
        let prodReading = 'medium';
        if (score >= 85) prodReading = 'high';
        if (score < 60) prodReading = 'low';
        document.getElementById('signal-productivity').textContent = prodReading;

        // Card 1: Issue
        document.getElementById('card-issue-title').textContent = document.getElementById('signal-issue').textContent.replace(/\b\w/g, l => l.toUpperCase());
        
        // Card 2: Productivity
        document.getElementById('card-prod-title').textContent = prodReading.charAt(0).toUpperCase() + prodReading.slice(1);
        const prodDesc = prodReading === 'high' ? 'Excellent baseline. You are optimizing your output.' : (prodReading === 'low' ? 'Your output is being restricted by habits.' : 'Solid baseline — small recoveries will lift you to high.');
        document.getElementById('card-prod-desc').textContent = prodDesc;

        // Card 3: Risk Level
        let riskLvl = 'Low';
        if (score < 60) riskLvl = 'High';
        else if (score < 80) riskLvl = 'Medium';
        document.getElementById('card-risk-title').textContent = riskLvl;
        document.getElementById('card-risk-desc').textContent = riskLvl === 'Low' ? 'Risk markers are quiet. Maintain consistency.' : 'Your habits indicate potential long-term fatigue.';
    }

    // --- GAUGE ANIMATION ---
    function animateGauge(targetScore) {
        const duration = 2000; // ms
        const scoreElement = document.getElementById('score-value');
        const gaugeValue = document.querySelector('.gauge-value');
        
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
