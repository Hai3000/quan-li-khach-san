// Giả lập dữ liệu đặt phòng
const bookings = [
    {
        CCCD: '123456789',
        customerName: 'Nguyễn Văn A',
        PhoneNumber: '0777777777',
        Email: 'nva@email.com',
        Time: '01/01/2020',
        Days: '1',
        roomType: 'Deluxe Triple City View'
    },
    {
        CCCD: '123456788',
        customerName: 'Trần Thị B',
        PhoneNumber: '07733377',
        Email: 'ttba@email.com',
        Time: '31/01/2020',
        Days: '2',
        roomType: 'Family Junior Suite'
    },
];

// Hiển thị dữ liệu lên bảng sau khi DOM đã tải
document.addEventListener("DOMContentLoaded", function() {
    const bookingTableBody = document.getElementById('bookingTableBody');

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${booking.CCCD.trim()}</td>
            <td>${booking.customerName.trim()}</td>
            <td>${booking.PhoneNumber.trim()}</td>
            <td>${booking.Email.trim()}</td>
            <td>${booking.Time.trim()}</td>
            <td>${booking.Days.trim()}</td>
            <td>${booking.roomType.trim()}</td>
        `;
        
        bookingTableBody.appendChild(row);
    });
});
