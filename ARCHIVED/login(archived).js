//File không thể sử dụng, vui lòng không sử dụng file này hoặc web sẽ không thể hoạt động. Thay đổi JavaScript thì thay đổi ở ngay trang HTML.
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của biểu mẫu

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Gửi dữ liệu đến máy chủ
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message); // Hiển thị thông báo

        // Chuyển hướng đến trang chủ nếu đăng nhập thành công
        if (data.message === 'Đăng nhập thành công') {
            window.location.href = 'home.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});