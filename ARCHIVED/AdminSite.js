// Hàm load nội dung từ file HTML
function loadPage(url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.querySelector('.content').innerHTML = data;

            // Tải tệp JavaScript nếu là trang lịch sử đặt phòng
            if (url === 'BookingHistory.html') {
                const script = document.createElement('script');
                script.src = './BookingHistory.js'; // Đường dẫn đến tệp JS
                document.body.appendChild(script); // Thêm script vào body để thực thi
            }
        })
        .catch(error => {
            document.querySelector('.content').innerHTML = `<p>Không thể tải trang. Vui lòng thử lại sau.</p>`;
            console.error('Error loading page:', error);
        });
}


// Sự kiện nhấp vào "Quản lý phòng"
const manageRoomLink = document.getElementById('manageRoomLink');
if (manageRoomLink) {
    manageRoomLink.addEventListener('click', function(event) {
        event.preventDefault();
        const dropdown = document.getElementById('roomDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
}


// Sự kiện nhấp vào "Thêm phòng"
document.getElementById('addRoomLink').addEventListener('click', function(event) {
    event.preventDefault();
    loadPage('./AddRoom.html'); 
    // Load nội dung từ file AddRoom.html
});

// Sự kiện nhấp vào "Chỉnh sửa phòng"
document.getElementById('editRoomLink').addEventListener('click', function(event) {
    event.preventDefault();
    loadPage('./EditRoom.html'); // Load nội dung từ file EditRoom.html
});

// Sự kiện nhấp vào "Lịch sử đặt phòng"
document.getElementById('bookingHistoryLink').addEventListener('click', function(event) {
    event.preventDefault();
    loadPage('BookingHistory.html'); // Load nội dung từ file BookingHistory.html
});

// Sự kiện nhấp vào "Quản lý khách hàng"
document.getElementById('manageCustomerLink').addEventListener('click', function(event) {
    event.preventDefault();
    const dropdown = document.getElementById('customerDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});
