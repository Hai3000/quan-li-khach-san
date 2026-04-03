//File không thể sử dụng, vui lòng không sử dụng file này hoặc web sẽ không thể hoạt động. Thay đổi JavaScript thì thay đổi ở ngay trang HTML.
document.addEventListener("DOMContentLoaded", function () {
    // Tìm nút Search và input tìm kiếm
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');

    // Gắn sự kiện click vào nút Search
    searchButton.addEventListener('click', function () {
        const location = searchInput.value;
        if (location) {
            alert(`Đang tìm kiếm nơi ở tại ${location}`);
        } else {
            alert('Vui lòng nhập địa điểm.');
        }
    });

    // Lấy phần tử nút Đăng nhập bằng ID
    const loginButton = document.getElementById("loginButton");
    
    // Gắn sự kiện click vào nút Đăng nhập
    loginButton.addEventListener("click", function () {
        // Chuyển hướng đến trang đăng nhập
        window.location.href = "login.html"; 
    });
});
