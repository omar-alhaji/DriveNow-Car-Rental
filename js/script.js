
// ==============================
// 1. Cars Data
// ==============================

let cars = [
    {
        name: "Toyota Corolla",
        category: "Economy",
        fuel: "Petrol",
        seats: 5,
        price: 35,
        available: true,
        image: "images/car1.jpg"
    },
    {
        name: "BMW 5 Series",
        category: "Luxury",
        fuel: "Petrol",
        seats: 5,
        price: 90,
        available: true,
        image: "images/car2.jpg"
    },
    {
        name: "Range Rover",
        category: "SUV",
        fuel: "Diesel",
        seats: 5,
        price: 120,
        available: false,
        image: "images/car3.jpg"
    }
];


// ==============================
// 2. Display Cars
// ==============================

function displayCars(carList) {

    let container = document.getElementById("car-container");

    container.innerHTML = "";

    if (carList.length === 0) {
        container.innerHTML = "<p>No cars found.</p>";
        return;
    }

    carList.forEach(function(car) {

        container.innerHTML += `
            <div class="car-card">

                <img src="${car.image}" alt="${car.name}">

                <div class="car-info">

                    <h3>${car.name}</h3>

                    <p>Category: ${car.category}</p>
                    <p>Fuel: ${car.fuel}</p>
                    <p>Seats: ${car.seats}</p>
                    <p>Price: $${car.price} / day</p>

                    <p>
                        Status:
                        ${car.available ? "Available" : "Unavailable"}
                    </p>

                    <button
                        data-car="${car.name}"
                        ${!car.available ? "disabled" : ""}>
                        Book Now
                    </button>

                </div>

            </div>
        `;
    });
}

displayCars(cars);


// ==============================
// 3. Search and Filter Cars
// ==============================

document.getElementById("search-form").addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("search-name").value.toLowerCase();
    let category = document.getElementById("category").value;
    let maxPrice = document.getElementById("max-price").value;

    let filteredCars = cars.filter(function(car) {

        return (
            car.name.toLowerCase().includes(name) &&
            (category === "" || car.category === category) &&
            (maxPrice === "" || car.price <= Number(maxPrice))
        );

    });

    displayCars(filteredCars);

});


// ==============================
// 4. Booking Form Elements
// ==============================

let bookingForm = document.getElementById("booking-form");

let customerName = document.getElementById("customer-name");
let customerPhone = document.getElementById("customer-phone");

let bookingCar = document.getElementById("booking-car");

let pickupInput = document.getElementById("pickup-date");
let returnInput = document.getElementById("return-date");

let rentalDays = document.getElementById("rental-days");
let totalPrice = document.getElementById("total-price");

let bookingMessage = document.getElementById("booking-message");


// ==============================
// 5. Fill Car Dropdown
// ==============================

cars.forEach(function(car) {

    if (car.available) {

        let option = document.createElement("option");

        option.value = car.name;
        option.textContent = car.name;

        bookingCar.appendChild(option);
    }

});


// ==============================
// 6. Date Setup
// ==============================

function getTodayString() {

    let today = new Date();

    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, "0");
    let day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

let todayString = getTodayString();

pickupInput.min = todayString;
returnInput.min = todayString;


// ==============================
// 7. Calculate Rental Price
// ==============================

function calculatePrice() {

    let selectedCar = cars.find(function(car) {
        return car.name === bookingCar.value;
    });

    let pickup = pickupInput.value;
    let returnDate = returnInput.value;

    rentalDays.value = "";
    totalPrice.value = "";

    if (
        selectedCar === undefined ||
        pickup === "" ||
        returnDate === ""
    ) {
        return;
    }

    let start = new Date(pickup + "T00:00:00Z");
    let end = new Date(returnDate + "T00:00:00Z");

    let difference = end - start;

    let days = difference / (1000 * 60 * 60 * 24);

    if (days <= 0) {
        return;
    }

    let total = days * selectedCar.price;

    rentalDays.value = days + " days";
    totalPrice.value = "$" + total.toFixed(2);

}


// Update the minimum return date

pickupInput.addEventListener("change", function() {

    if (pickupInput.value !== "") {

        let nextDay = new Date(pickupInput.value + "T00:00:00Z");

        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

        returnInput.min = nextDay.toISOString().split("T")[0];

        if (returnInput.value !== "" &&
            returnInput.value <= pickupInput.value) {

            returnInput.value = "";
        }
    }

    calculatePrice();

});

bookingCar.addEventListener("change", calculatePrice);
returnInput.addEventListener("change", calculatePrice);


// ==============================
// 8. Book Car Button
// ==============================

document.getElementById("car-container").addEventListener("click", function(event) {

    if (event.target.tagName === "BUTTON" && !event.target.disabled) {

        let carName = event.target.dataset.car;

        bookingCar.value = carName;

        calculatePrice();

        document.getElementById("booking").scrollIntoView({
            behavior: "smooth"
        });

    }

});


// ==============================
// 9. Check Car Availability
// ==============================

function isCarAvailable(carName, pickup, returnDate) {

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    let overlappingBooking = bookings.find(function(booking) {

        return (
            booking.car === carName &&
            pickup < booking.returnDate &&
            returnDate > booking.pickupDate
        );

    });

    return overlappingBooking === undefined;

}


// ==============================
// 10. Booking Submission
// ==============================

bookingForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let name = customerName.value.trim();
    let phone = customerPhone.value.trim();

    let selectedCar = cars.find(function(car) {
        return car.name === bookingCar.value;
    });

    let pickup = pickupInput.value;
    let returnDate = returnInput.value;

    // Validate name

    if (name === "") {

        bookingMessage.style.color = "red";
        bookingMessage.textContent = "Please enter your name.";

        return;
    }

    // Validate phone number

    let phonePattern = /^\+?[0-9\s-]{7,20}$/;

    if (!phonePattern.test(phone)) {

        bookingMessage.style.color = "red";
        bookingMessage.textContent = "Please enter a valid phone number.";

        return;
    }

    // Validate car

    if (selectedCar === undefined || !selectedCar.available) {

        bookingMessage.style.color = "red";
        bookingMessage.textContent = "Please select a valid car.";

        return;
    }

    // Validate dates

    if (
        pickup === "" ||
        returnDate === "" ||
        pickup < todayString ||
        returnDate <= pickup
    ) {

        bookingMessage.style.color = "red";
        bookingMessage.textContent = "Please select valid pickup and return dates.";

        return;
    }

    // Check overlapping bookings

    if (!isCarAvailable(selectedCar.name, pickup, returnDate)) {

        bookingMessage.style.color = "red";
        bookingMessage.textContent =
            "Sorry! This car is already booked during these dates.";

        return;
    }

    // Calculate duration and price

    let start = new Date(pickup + "T00:00:00Z");
    let end = new Date(returnDate + "T00:00:00Z");

    let days = (end - start) / (1000 * 60 * 60 * 24);

    let total = days * selectedCar.price;

    // Create booking object

    let booking = {

        id: Date.now(),

        customerName: name,
        phone: phone,

        car: selectedCar.name,

        pickupDate: pickup,
        returnDate: returnDate,

        days: days,
        totalPrice: total

    };

    // Save booking

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    bookings.push(booking);

    localStorage.setItem("bookings", JSON.stringify(bookings));

    // Success message

    bookingMessage.style.color = "green";
    bookingMessage.textContent = "Your booking was successful!";

    // Display updated booking history

    displayBookings();

    // Reset form

    bookingForm.reset();

    returnInput.min = todayString;

    rentalDays.value = "";
    totalPrice.value = "";

});


// ==============================
// 11. Display Booking History
// ==============================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        let entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


function displayBookings() {

    let container = document.getElementById("booking-list");

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    container.innerHTML = "";

    if (bookings.length === 0) {

        container.innerHTML = "<p>No bookings yet.</p>";

        return;
    }

    bookings.forEach(function(booking) {

        container.innerHTML += `

            <div class="booking-card">

                <h3>${escapeHTML(booking.customerName)}</h3>

                <p>Phone: ${escapeHTML(booking.phone)}</p>

                <p>Car: ${escapeHTML(booking.car)}</p>

                <p>Pickup: ${escapeHTML(booking.pickupDate)}</p>

                <p>Return: ${escapeHTML(booking.returnDate)}</p>

                <p>Duration: ${booking.days} days</p>

                <p>Total Price: $${Number(booking.totalPrice).toFixed(2)}</p>

                <button onclick="cancelBooking(${Number(booking.id)})">
                    Cancel Booking
                </button>

            </div>

        `;

    });

}


// ==============================
// 12. Cancel Booking
// ==============================

function cancelBooking(id) {

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    bookings = bookings.filter(function(booking) {
        return booking.id !== id;
    });

    localStorage.setItem("bookings", JSON.stringify(bookings));

    displayBookings();

}


// ==============================
// 13. Load Saved Bookings
// ==============================

displayBookings();
