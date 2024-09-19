/**
 * Author: Ajay Singh
 * Version: 0.1
 * Date: 19-09-2024
 * Description: JavaScript for handling date display, date picker, data fetching, filtering, search functionality, and date navigation buttons.
 */

document.addEventListener("DOMContentLoaded", function() {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRT_ixy3nU4dbCgnMMyR05vP4dQePsnwZ4_UgCuP-x0XdcHVv9X87v6kYP-q2ouBk8UIaK8khj80FJ3/pub?gid=1138944004&single=true&output=csv';
    
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').filter(row => row.trim() !== '');
            const container = document.getElementById('card-container');
            
            if (rows.length > 0) {
                // Skip header row
                rows.slice(1).forEach((row, index) => {
                    const [company, place, customer, phone, project] = row.split(',');

                    const card = document.createElement('div');
                    card.className = 'card';

                    const cardInner = document.createElement('div');
                    cardInner.className = 'card-inner';

                    const cardFront = document.createElement('div');
                    cardFront.className = 'card-face front';

                    const cardBack = document.createElement('div');
                    cardBack.className = 'card-face back';

                    const cardNumber = document.createElement('div');
                    cardNumber.className = 'card-number';
                    cardNumber.textContent = index + 1; // Display only the integer value

                    const companyNameFront = document.createElement('div');
                    companyNameFront.className = 'company-name';
                    companyNameFront.textContent = company;

                    const companyNameBack = document.createElement('div');
                    companyNameBack.className = 'company-name';
                    companyNameBack.textContent = company;

                    const placeNameFront = document.createElement('div');
                    placeNameFront.className = 'place-name';
                    placeNameFront.textContent = place;

                    const placeNameBack = document.createElement('div');
                    placeNameBack.className = 'place-name';
                    placeNameBack.textContent = place;

                    const customerNames = customer.split(':');
                    const customerNameBack = document.createElement('div');
                    customerNameBack.className = 'customer-name';
                    customerNameBack.innerHTML = customerNames.join('<br>'); // Display names one below the other

                    const projectDescriptionBack = document.createElement('div');
                    projectDescriptionBack.className = 'project-description';
                    projectDescriptionBack.textContent = project;

                    const phoneNumbersDiv = document.createElement('div');
                    phoneNumbersDiv.className = 'phone-numbers';

                    const phoneNumbersGroup = document.createElement('div');
                    phoneNumbersGroup.className = 'phone-number-group';

                    // Handle phone numbers
                    if (phone.length === 20 && phone[10] === ' ') {
                        // Phone number is 20 digits with a space
                        const firstGroup = phone.slice(0, 10).trim();
                        const secondGroup = phone.slice(11).trim(); // Skip space

                        const phoneNumberTop = document.createElement('div');
                        phoneNumberTop.className = 'phone-number phone-number-top';
                        phoneNumberTop.textContent = firstGroup;
                        phoneNumberTop.addEventListener('click', () => {
                            window.location.href = `tel:${firstGroup.trim()}`; // Call the phone number
                        });

                        const phoneNumberBottom = document.createElement('div');
                        phoneNumberBottom.className = 'phone-number phone-number-bottom';
                        phoneNumberBottom.textContent = secondGroup;
                        phoneNumberBottom.addEventListener('click', () => {
                            window.location.href = `tel:${secondGroup.trim()}`; // Call the phone number
                        });

                        phoneNumbersGroup.appendChild(phoneNumberTop);
                        phoneNumbersGroup.appendChild(phoneNumberBottom);
                    } else {
                        // Regular case with multiple numbers separated by spaces or semicolons
                        const phoneNumbers = phone.split(/[;\s]+/); // Split by semicolon or space
                        phoneNumbers.forEach(num => {
                            const phoneNumber = document.createElement('div');
                            phoneNumber.className = 'phone-number';
                            phoneNumber.textContent = num.trim(); // Display each phone number
                            phoneNumber.addEventListener('click', () => {
                                window.location.href = `tel:${num.trim()}`; // Call the phone number
                            });
                            phoneNumbersGroup.appendChild(phoneNumber);
                        });
                    }

                    phoneNumbersDiv.appendChild(phoneNumbersGroup);

                    const phoneIcon = document.createElement('i');
                    phoneIcon.className = 'fas fa-phone phone-icon';
                    phoneIcon.addEventListener('click', () => {
                        const phoneNumber = phoneNumbersDiv.querySelector('.phone-number');
                        if (phoneNumber) {
                            window.location.href = `tel:${phoneNumber.textContent.trim()}`; // Call the first number
                        }
                    });

                    cardFront.appendChild(cardNumber);
                    cardFront.appendChild(companyNameFront);
                    cardFront.appendChild(placeNameFront);

                    cardBack.appendChild(companyNameBack);
                    cardBack.appendChild(customerNameBack);
                    cardBack.appendChild(projectDescriptionBack);
                    cardBack.appendChild(placeNameBack);
                    cardBack.appendChild(phoneNumbersDiv);
                    cardBack.appendChild(phoneIcon);

                    cardInner.appendChild(cardFront);
                    cardInner.appendChild(cardBack);
                    card.appendChild(cardInner);

                    card.addEventListener('click', () => {
                        card.classList.toggle('flipped');
                    });

                    container.appendChild(card);
                });
            }
        })
        .catch(error => console.error('Error fetching the CSV data:', error));
});
