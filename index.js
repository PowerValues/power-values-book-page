const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function fetchValueDefinitions() {
    try {
        const response = await fetch('https://backend-production-db30.up.railway.app/quiz/settings');
        const data = await response.json();
        return data.values;
    } catch (e) {
        console.log(e);
    }
}

function getDefinition(definitions, value) {
    return definitions.find(d => d.word === value).definition;
}

async function downloadImage(imageUrl, filename = 'certificate.png') {
    try {
        const proxyUrl = `https://share.powervalues.xyz/download?url=${encodeURIComponent(imageUrl)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;  // 👈 Forces "Save As" dialog
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.log(e);
    }
}


document.addEventListener('DOMContentLoaded', async function () {

    const response = await fetch(`https://backend-production-db30.up.railway.app/quiz/${id}`);
    const data = await response.json();
    const topValues = data.user.topValues.slice(0, 3);

    const definitions = await fetchValueDefinitions();



    /**
     * ------------------------------------------------------------------------
     * MASTER SCRIPT FOR DYNAMIC CONTENT & PAGE INTERACTIONS
     * ------------------------------------------------------------------------
     */

    // --- 1. DEFINE ALL VALUE DEFINITIONS ---
    // const valueDefinitions = {
    //     Loyalty: "Loyalty is the steadfast commitment to support, trust, and remain dedicated to the people, principles, or causes you value most. It is the expression of unwavering allegiance and reliability, even in the face of challenges.",
    //     Courage: "Courage is the strength to face fear, uncertainty, or difficulty with determination and confidence. It is the inner resolve to take bold action in alignment with your values, even when the path ahead is challenging or unknown.",
    //     Resilience: "Resilience is the ability to recover, adapt, and thrive in the face of adversity, challenges, or setbacks. It is the value of enduring with strength and determination, transforming obstacles into opportunities for growth.",
    //     Security: "Security is the value of creating a sense of stability, safety, and assurance in your life. It is the foundation that allows you to face challenges with confidence and focus on growth, knowing that your essential needs are protected.",
    //     Love: "Love is the profound connection and affection that fosters care, understanding, and compassion between individuals. It is the essence of human relationships, rooted in empathy, trust, and the desire to nurture and support others.",
    //     Freedom: "Freedom is the ability to live authentically and make choices aligned with your values and desires. It is the liberation from external constraints and internal limitations, empowering you to shape your life and embrace your fullest potential."
    // };

    // --- 2. READ URL PARAMETERS & UPDATE PAGE CONTENT ---
    // const params = new URLSearchParams(window.location.search);
    const value1 = topValues[0];
    // const value2 = params.get('value2');
    // const value3 = params.get('value3');

    const certificateImage = document.getElementById('certificate-image');
    if (value1 && certificateImage) {
        const sanitizedValue = value1.toLowerCase().replace(/[^a-z0-9]/gi, '');
        // certificateImage.src = `images/certificates/${sanitizedValue}.png`;
        certificateImage.src = 'https://www.jmkeim.com/' + value1.replace(/ /g, '-');
        certificateImage.alt = `Your #1 Power Value is ${value1}`;

        const valueNameSpan = document.getElementById('value-name');
        if (valueNameSpan) {
            valueNameSpan.textContent = value1;
        }
    }

    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            // const imageUrlToDownload = certificateImage.src; // Replace with your image URL
            const imageUrlToDownload = certificateImage.src; // Replace with your image URL
            downloadImage(imageUrlToDownload, `${value1}.png`); // Optional: provide a custom filename
        });
    }

    // --- 3. UPDATE SOCIAL SHARE LINKS ---
    const shareTwitterBtn = document.getElementById('share-twitter');
    const shareFacebookBtn = document.getElementById('share-facebook');
    const shareLinkedinBtn = document.getElementById('share-linkedin');

    const pageUrl = encodeURIComponent(`https://share.powervalues.xyz/?id=${id}`);
    const dynamicValue = value1 || 'my Power Value';
    const shareText = encodeURIComponent(`I discovered my #1 Power Value is ${dynamicValue}! Find out yours and unlock your potential. #PowerValues`);
    const shareTitle = encodeURIComponent(`My #1 Power Value is ${dynamicValue}`);
    const twitterText = encodeURIComponent(`I discovered my #1 Power Value is ${dynamicValue}! Find out yours with the free quiz from @PowerValues. #PowerValues`);

    if (shareTwitterBtn) {
        shareTwitterBtn.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${twitterText}`;
    }
    if (shareFacebookBtn) {
        shareFacebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    }
    if (shareLinkedinBtn) {
        shareLinkedinBtn.href = `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}&title=${shareTitle}&summary=${shareText}`;
    }

    // --- 4. INITIALIZE INTERACTIVE & DYNAMIC FUNCTIONALITY ---

    const toolOptions = document.getElementById('tool-options');
    const toolResult = document.getElementById('tool-result');
    // const topValues = [value1, value2, value3].filter(Boolean);

    if (toolOptions && topValues.length > 0) {
        toolOptions.innerHTML = '';
        topValues.forEach(value => {
            const button = document.createElement('button');
            button.className = 'button button-secondary';
            button.dataset.value = value;
            button.textContent = value;
            toolOptions.appendChild(button);
        });
    } else if (toolOptions) {
        toolOptions.innerHTML = `
                <button class="button button-secondary" data-value="Loyalty">Loyalty</button>
                <button class="button button-secondary" data-value="Courage">Courage</button>
                <button class="button button-secondary" data-value="Resilience">Resilience</button>
            `;
    }

    // Interactive Tool (Top 3 Values)
    if (toolOptions) {
        const setDefaultValueDisplay = () => {
            const firstButton = toolOptions.querySelector('button');
            if (firstButton) {
                const value = firstButton.dataset.value;
                // const definition = valueDefinitions[value];
                const definition = getDefinition(definitions, value);
                if (definition) {
                    toolResult.innerHTML = `<p><strong>${value}:</strong> ${definition}</p>`;
                    toolResult.classList.add('visible');
                    firstButton.classList.add('active');
                }
            }
        };
        setDefaultValueDisplay();

        toolOptions.addEventListener('click', function (e) {
            if (e.target.matches('button')) {
                const value = e.target.dataset.value;
                const definition = getDefinition(definitions, value);

                if (e.target.classList.contains('active')) {
                    toolResult.classList.remove('visible');
                    e.target.classList.remove('active');
                } else if (definition) {
                    toolResult.innerHTML = `<p><strong>${value}:</strong> ${definition}</p>`;
                    toolResult.classList.add('visible');
                    toolOptions.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');
                } else {
                    toolResult.innerHTML = `<p>Definition for <strong>${value}</strong> is not available.</p>`;
                    toolResult.classList.add('visible');
                }
            }
        });
    }

    // Flipbook Modal
    const openFlipbookButton = document.getElementById('open-flipbook');
    const closeFlipbookButton = document.getElementById('close-flipbook');
    const flipbookModal = document.getElementById('flipbook-modal');
    const flipbookIframe = document.getElementById('flipbook-iframe');

    const flipbookUrl = "https://powervalues.github.io/power-values-flipbook/";

    if (openFlipbookButton && flipbookModal && flipbookIframe) {
        openFlipbookButton.addEventListener('click', () => {
            flipbookIframe.src = flipbookUrl;
            flipbookModal.style.display = 'flex';
            document.body.classList.add('no-scroll');
        });

        const closeModal = () => {
            flipbookModal.style.display = 'none';
            flipbookIframe.src = '';
            document.body.classList.remove('no-scroll');
        };

        closeFlipbookButton.addEventListener('click', closeModal);
        flipbookModal.addEventListener('click', (e) => {
            if (e.target === flipbookModal) {
                closeModal();
            }
        });
    }

    // --- 5. INITIALIZE GENERAL PAGE INTERACTIONS ---

    // Interactive 3D Tilt Effect for Book Preview
    const tiltElement = document.getElementById('open-flipbook');
    if (tiltElement) {
        const height = tiltElement.clientHeight;
        const width = tiltElement.clientWidth;

        tiltElement.addEventListener('mousemove', (e) => {
            const { layerX, layerY } = e;
            const yRotation = ((layerX - width / 2) / width) * 20;
            const xRotation = ((layerY - height / 2) / height) * -20;

            const transformString = `
                    perspective(500px)
                    scale(1.05)
                    rotateX(${xRotation}deg)
                    rotateY(${yRotation}deg)`;

            tiltElement.style.transform = transformString;
        });

        tiltElement.addEventListener('mouseleave', () => {
            tiltElement.style.transform = `
                    perspective(500px)
                    scale(1)
                    rotateX(0)
                    rotateY(0)`;
        });
    }

    // Mobile Navigation
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function () {
            if (flipbookModal && flipbookModal.style.display !== 'flex') {
                menuToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                body.classList.toggle('no-scroll');
            }
        });

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    body.classList.remove('no-scroll');
                }
            });
        });
    }

    // On-scroll Reveal Animations
    const scrollElements = document.querySelectorAll(".animate-on-scroll");
    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
    };
    const displayScrollElement = (element) => element.classList.add("visible");
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            }
        });
    };
    handleScrollAnimation();
    window.addEventListener("scroll", handleScrollAnimation);

    // Header Scroll Effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Mobile Sticky CTA
    const mobileCta = document.getElementById('mobile-sticky-cta');
    const footer = document.querySelector('footer');
    if (mobileCta && footer) {
        const toggleCtaOnScroll = () => {
            const footerRect = footer.getBoundingClientRect();

            if (window.scrollY > 1 && footerRect.top > window.innerHeight) {
                mobileCta.classList.add('visible');
            } else {
                mobileCta.classList.remove('visible');
            }
        };
        window.addEventListener('scroll', toggleCtaOnScroll);
        toggleCtaOnScroll();
    }
});