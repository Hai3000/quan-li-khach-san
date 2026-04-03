//File không thể sử dụng, vui lòng không sử dụng file này hoặc web sẽ không thể hoạt động. Thay đổi JavaScript thì thay đổi ở ngay trang HTML.
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của biểu mẫu

    const email = document.getElementById('regemail').value;
    const password = document.getElementById('regpassword').value;
    // Gửi dữ liệu đến máy chủ
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message); // Hiển thị thông báo

        // Chuyển hướng nếu đăng ký thành công
        if (data.message == "User registered successfully") {
            window.location.href = 'login.html'; // Hoặc trang bạn muốn chuyển đến
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Đã xảy ra lỗi: ' + error.message); // Hiển thị lỗi
    });
});