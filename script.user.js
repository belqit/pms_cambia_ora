// ==UserScript==
// @name         Timesheet Auto-Select Option 39
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically select option 39 in #tempfrom select when visible and resize textarea
// @author       Griba
// @match        https://pms.betacomservices.com/timesheet*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function isVisible(element) {
        return element &&
               element.offsetParent !== null &&
               window.getComputedStyle(element).display !== 'none' &&
               window.getComputedStyle(element).visibility !== 'hidden';
    }

    function selectOption39() {
        const selectElement = document.querySelector('#tempfrom');

        if (selectElement && isVisible(selectElement)) {
            const option39 = selectElement.querySelector('option:nth-child(39)');

            if (option39) {
                selectElement.value = option39.value;
                option39.selected = true;

                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                selectElement.dispatchEvent(new Event('input', { bubbles: true }));

                console.log('Auto-selected option 39 in #tempfrom:', option39.textContent);

                // Resize textarea in the modal
                const modal = document.querySelector('ngb-modal-window');
                if (modal) {
                    const textareas = modal.querySelectorAll('textarea');
                    textareas.forEach(ta => {
                        ta.style.minHeight = '150px';
                        ta.style.height = '150px';
                        ta.style.resize = 'vertical';
                        console.log('Resized textarea:', ta);
                    });
                }

                // Set the input field to 0
                const inputElement = document.querySelector('body > ngb-modal-window > div > div > div.modal-body.px-0.pt-3 > div.px-4.pt-3.tab-content > div > add-edit-worklog > div > div:nth-child(8) > div:nth-child(2) > input-number > div > input');

                if (inputElement) {
                    inputElement.value = '0';
                    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
                    inputElement.dispatchEvent(new Event('blur', { bubbles: true }));
                    console.log('Set input field to 0');
                } else {
                    console.log('Input field not found');
                }

                return true;
            } else {
                console.log('Option 39 not found in #tempfrom select');
            }
        }
        return false;
    }

    const processedElements = new WeakSet();

    function startContinuousMonitoring() {
        setInterval(() => {
            const selectElement = document.querySelector('#tempfrom');

            if (selectElement && isVisible(selectElement) && !processedElements.has(selectElement)) {
                if (selectOption39()) {
                    processedElements.add(selectElement);
                }
            }
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startContinuousMonitoring);
    } else {
        startContinuousMonitoring();
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const selectElement = document.querySelector('#tempfrom');
                if (selectElement && isVisible(selectElement) && !processedElements.has(selectElement)) {
                    if (selectOption39()) {
                        processedElements.add(selectElement);
                    }
                }
            }
        });
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

})();
