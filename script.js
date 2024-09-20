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
                    const columns = row.split(',');
                    if (columns.length !== 5) {
                        console.warn(`Skipping malformed row ${index + 1}: ${row}`);
                        return; // Skip malformed rows
                    }
                    const [company, place, customer, phone, project] = columns;

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
                    cardNumber.textContent = index + 1; // Display the card number

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

                    // Handle phone numbers and add icons
                    const phoneNumbers = phone.match(/\d{10}/g); // Find all groups of 10 digits
                    if (phoneNumbers) {
                        phoneNumbers.forEach(num => {
                            const phoneIcon = document.createElement('i');
                            phoneIcon.className = 'fas fa-phone phone-icon'; // Use Font Awesome class
                            phoneIcon.addEventListener('click', (event) => {
                                event.stopPropagation(); // Prevent card flip on icon click
                                if (confirm(`Do you want to call this number: ${num.trim()}?`)) {
                                    window.location.href = `tel:${num.trim()}`; // Call the phone number
                                } else {
                                    card.classList.toggle('flipped'); // Flip back to original state
                                }
                            });

                            // Add the icon to the group
                            phoneNumbersDiv.appendChild(phoneIcon);
                        });
                    } else {
                        console.warn(`No valid phone numbers found for row ${index + 1}: ${phone}`);
                    }

                    cardFront.appendChild(cardNumber);
                    cardFront.appendChild(companyNameFront);
                    cardFront.appendChild(placeNameFront);

                    cardBack.appendChild(companyNameBack);
                    cardBack.appendChild(customerNameBack);
                    cardBack.appendChild(projectDescriptionBack);
                    cardBack.appendChild(placeNameBack);
                    cardBack.appendChild(phoneNumbersDiv);

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
        .catch(error => {
            console.error('Error fetching the CSV data:', error);
            document.getElementById('card-container').innerHTML = "<p>Error loading data. Please try again later.</p>";
        });
});
