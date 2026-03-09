//File server này cực kì quan trọng, không được xóa
var mysql = require('mysql');
var express = require('express');
var path = require('path'); // Thêm để xử lý đường dẫn
var app = express();
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
var port = 5000;
const bodyParser = require('body-parser');
const session = require('express-session');
app.use(session({
    secret: 'MaVuongTulen55555', // Thay đổi khóa bí mật
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Đặt true nếu bạn sử dụng HTTPS
}));
app.use(bodyParser.json({ limit: '100mb' })); // Thay đổi 10mb thành kích thước bạn mong muốn
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('test'));
app.use('/images', express.static('anh')); // Thư mục test
app.use(express.static(__dirname, { // host the whole directory
    extensions: ["html", "htm", "gif", "png", "jpg"],
}))
// Route cho trang đăng ký
app.get('/register', function(req, res) {
    res.sendFile(path.join(__dirname, 'register.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
// Route cho trang đăng nhập
app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, 'login.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/admlogin', function(req, res) {
    res.sendFile(path.join(__dirname, 'adminlogin.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/quanly', function(req, res) {
    res.sendFile(path.join(__dirname, 'QuanLy.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
// Route cho trang Gd
app.get('/trangchu', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html')); // Gửi file HTML
});
app.get('/thongtinphong1', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'thongtinphong1.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/chitietphong', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'thongtinphong2.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/ttkh', function(req, res) {
    res.sendFile(path.join(__dirname, 'TTKH.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/404', function(req, res) {
    res.sendFile(path.join(__dirname, '404.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/chinhsuatt', function(req, res) {
    res.sendFile(path.join(__dirname, 'editTT.html')); // Đảm bảo đường dẫn đến file HTML đúng
});
app.get('/themphong', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'themphong.html')); 
});
app.get('/themkhachsan', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'themkhachsan.html')); 
});
app.get('/kqtk', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'kqtk.html')); 
});
app.get('/editKS', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'editKS.html')); 
});
app.get('/dsks123', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'dsks123.html')); 
});
app.get('/dsphong', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'dsphong.html')); 
});
app.get('/adminreg', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'adminreg.html')); 
});
app.get('/datphong', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'datphong.html')); 
});
app.get('/payment', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'datphong.html')); 
});
app.get('/mode', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'mode.html')); 
});
app.get('/nvlogin', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'nvlogin.html')); 
});
app.get('/lichsudatphong', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'HP.html')); 
});
app.get('/lichsudatphongkhachhang', checkAuth, function(req, res) {
    res.sendFile(path.join(__dirname, 'lsdp.html')); 
});
// Khởi tạo kết nối đến cơ sở dữ liệu
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "123456789",
    database: "dapm"
});
// Kết nối đến cơ sở dữ liệu
con.connect(function(error) {
    if (error) {
        console.error('error connecting to the database: ' + error.stack);
        return;
    }
    console.log('Connected to the database as id ' + con.threadId); // Thông báo kết nối thành công
});
// Route đăng ký
app.post('/register', async function(req, res) {
    console.log('Received data:', req.body);
    let { regname, regdate, regsex, reglocate, regphone, regid, regemail, regpassword } = req.body;
    try {
        // Kiểm tra xem email đã tồn tại chưa
        const checkEmailQuery = 'SELECT * FROM KHACHHANG WHERE Email = ?'; // Sửa UserID thành Email
        con.query(checkEmailQuery, [regemail], function(error, results) {
            if (error) {
                console.error('error checking email:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu email đã tồn tại
            if (results.length > 0) {
                return res.status(400).json({ error: 'Người dùng đã tồn tại.'});
            }
            // Nếu email chưa tồn tại, tiếp tục đăng ký
            const insertQuery = `
                INSERT INTO KHACHHANG (HoVaTen, NgaySinh, GioiTinh, Diachi, SoDienThoai, MaCCCD, Email, MatKhau)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            // Thực hiện truy vấn chèn dữ liệu
            con.query(insertQuery, [regname, regdate, regsex, reglocate, regphone, regid, regemail, regpassword], function(error) {
                if (error) {
                    console.error('error inserting data:', error.stack);
                    return res.status(500).json({ error: 'Failed to register user', error: error.message });
                }
                return res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
//Route đăng ký nhân viên
app.post('/adminregister', async function(req, res) {
    console.log('Received data:', req.body);
    let { HoVaTen, Email, MatKhau } = req.body;
    try {
        // Kiểm tra xem email đã tồn tại chưa
        const checkEmailQuery = 'SELECT * FROM NHANVIEN WHERE Email = ?';
        con.query(checkEmailQuery, [Email], function(error, results) {
            if (error) {
                console.error('error checking email:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu email đã tồn tại
            if (results.length > 0) {
                return res.status(400).json({ error: 'Người dùng đã tồn tại.'});
            }
            // Nếu email chưa tồn tại, tiếp tục đăng ký
            const insertQuery = `
                INSERT INTO NHANVIEN (HoVaTen, Email, MatKhau)
                VALUES (?, ?, ?)
            `;
            // Thực hiện truy vấn chèn dữ liệu
            con.query(insertQuery, [HoVaTen, Email, MatKhau], function(error) {
                if (error) {
                    console.error('error inserting data:', error.stack);
                    return res.status(500).json({ error: 'Failed to register user', error: error.message });
                }
                return res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
// Route để thêm phòng
app.post('/themphong', async function(req, res) {
    console.log('Received data:', req.body);
    let { roomtype, roomprice, roomtt, roomacs, hotelid, roomimg } = req.body;
    // Kiểm tra xem tất cả các trường cần thiết đã được cung cấp
    if (!roomtype || !roomprice || !roomtt || !roomacs || !hotelid) {
        return res.status(400).json({ error: 'Vui lòng cung cấp tất cả các trường cần thiết.' });
    }
    // Chuyển đổi Base64 về Buffer nếu cần
    let imgBuffer = null;
    if (roomimg) {
        imgBuffer = Buffer.from(roomimg.split(",")[1], 'base64'); // Tách chuỗi Base64 và chuyển đổi sang Buffer
    }
    try {
        const checkRoomQuery = 'SELECT * FROM PHONG WHERE MaKS = ? AND LoaiPhong = ?';
        con.query(checkRoomQuery, [hotelid, roomtype], function(error, results) {
            if (error) {
                console.error('error checking room:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu phòng đã tồn tại
            if (results.length > 0) {
                return res.status(400).json({ error: 'Phòng đã tồn tại.'});
            }
            console.log('LoaiPhong:', roomtype);
            console.log('GiaPhong:', roomprice);
            console.log('TrangThai:', roomtt);
            console.log('TienNghi:', roomacs);
            console.log('MaKS:', hotelid);
            console.log('Hinhanh:', roomimg);
            // Chèn phòng mới
            const insertQuery = `
                INSERT INTO PHONG (LoaiPhong, GiaPhong, TrangThai, TienNghi, MaKS, Hinhanh)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            con.query(insertQuery, [roomtype, roomprice, roomtt, roomacs, hotelid, imgBuffer], function(error) {
                if (error) {
                    console.error('error inserting data:', error.stack);
                    return res.status(500).json({ error: 'Thêm thất bại', error: error.message });
                }
                return res.status(201).json({ message: 'Thêm phòng thành công' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
// Route để thêm khách sạn
app.post('/themkhachsan', async function(req, res) {
    console.log('Received data:', req.body);
    let { TenKS, DiaChi, TinhThanh, SoTongDai } = req.body;
    try {
        const checkHotelQuery = 'SELECT * FROM KHACHSAN WHERE TenKS = ?';
        con.query(checkHotelQuery, [TenKS, DiaChi, TinhThanh], function(error, results) {
            if (error) {
                console.error('error checking:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }

            // Nếu khách sạn đã tồn tại
            if (results.length > 0) {
                return res.status(400).json({ error: 'Khách sạn đã tồn tại.' });
            }
            console.log('Tên khách sạn:', TenKS);
            console.log('Địa chỉ:', DiaChi);
            console.log('Tỉnh thành:', TinhThanh);
            console.log('Số tổng đài:', SoTongDai);
            // Chèn khách sạn mới
            const insertQuery = `
                INSERT INTO KHACHSAN (TenKS, DiaChi, TinhThanh, SoTongDai)
                VALUES (?, ?, ?, ?)
            `;
            con.query(insertQuery, [TenKS, DiaChi, TinhThanh, SoTongDai], function(error) {
                if (error) {
                    console.error('error inserting data:', error.stack);
                    return res.status(500).json({ error: 'Thêm khách sạn thất bại', error: error.message });
                }
                return res.status(201).json({ message: 'Thêm khách sạn thành công' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
//Route tạo menu dropdown khách sạn khi thêm phòng
app.get('/dsks', async function(req, res) {
    const sql = 'SELECT MaKS, TenKS FROM KHACHSAN'; // Query để lấy danh sách khách sạn
    con.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error); // Ghi lại lỗi vào console
            return res.status(500).json({ message: 'Internal server error: ' + error.message });
        }
        // Kiểm tra xem có kết quả không
        if (results.length === 0) {
            return res.status(404).json({ message: 'No hotels found.' });
        }
        
        res.json(results); // Trả về danh sách khách sạn
    });
});
//Route tạo menu dropdown tỉnh khi tìm kiếm
app.get('/dstinh', async function(req, res) {
    const sql = 'SELECT distinct TinhThanh FROM KHACHSAN'; // Query để lấy danh sách khách sạn
    con.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error); // Ghi lại lỗi vào console
            return res.status(500).json({ message: 'Internal server error: ' + error.message });
        }
        // Kiểm tra xem có kết quả không
        if (results.length === 0) {
            return res.status(404).json({ message: 'No hotels found.' });
        }
        
        res.json(results); // Trả về danh sách khách sạn
    });
});
//Route thông tin chi tiết khách sạn
app.get('/ks/:maKS', async function(req, res) {
    const maKS = req.params.maKS; // Lấy MaKS từ URL
    const sql = 'SELECT * FROM KHACHSAN WHERE MaKS = ?'; // Lấy thông tin chi tiết theo MaKS
    con.query(sql, [maKS], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Khách sạn không tìm thấy' });
        }
        res.json(results[0]); // Trả về thông tin khách sạn
    });
});
//Route thông tin chi tiết phòng
app.get('/rooms/:maPhong', async function(req, res) {
    const maKS = req.params.maPhong; // Lấy MaKS từ URL
    const sql = 'SELECT * FROM PHONG WHERE MaPhong = ?'; // Lấy thông tin chi tiết theo MaKS
    con.query(sql, [maKS], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Phòng không tìm thấy' });
        }
        res.json(results[0]); // Trả về thông tin khách sạn
    });
});
//Route hiển thị khách sạn khi edit
app.get('/editks/:maKS', async function(req, res) {
    const maKS = req.params.maKS;
    const sql = 'SELECT * FROM KHACHSAN WHERE MaKS = ?';
    con.query(sql, [maKS], (error, results) => {
        if (error) {
            console.error('error executing query:', error);
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Khách sạn không tìm thấy' });
        }
        // Đảm bảo kết quả trả về là JSON
        res.json(results[0]);
    });
});
//Route tìm khách sạn
app.get('/api/search', async function(req, res) {
    const tinhThanh = req.query.tinhThanh; // Lấy TinhThanh từ query parameters
    // Kiểm tra nếu tinhThanh không được cung cấp
    if (!tinhThanh) {
        return res.status(400).json({ message: 'Thiếu thông tin tỉnh thành' });
    }
    const sql = 'SELECT * FROM KHACHSAN WHERE TinhThanh = ?'; // Lấy thông tin chi tiết theo TinhThanh
    con.query(sql, [tinhThanh], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách sạn nào ở tỉnh thành này' });
        }
        res.json(results); // Trả về danh sách khách sạn
    });
});
//Route tìm phòng
app.get('/api/searchroom', async (req, res) => {
    const maKS = req.query.maKS; // Lấy MaKS từ query parameter

    if (!maKS) {
        return res.status(400).json({ message: 'MaKS is required.' });
    }

    // Câu lệnh SQL để tìm kiếm phòng theo MaKS
    const sql = `
        SELECT p.MaPhong, p.LoaiPhong, p.GiaPhong, p.TrangThai, p.TienNghi, p.Hinhanh, ks.TenKS
        FROM PHONG p
        INNER JOIN KHACHSAN ks ON p.MaKS = ks.MaKS
        WHERE p.MaKS = ?`; // Sử dụng placeholder để tránh SQL injection

    con.query(sql, [maKS], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ message: 'Internal server error: ' + error.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No rooms found for this hotel.' });
        }

        res.json(results); // Trả về danh sách phòng
    });
});
//Route thông tin chi tiết phòng
app.get('/room/:maKS', (req, res) => {
    const maKS = req.params.maKS;
    const query = 'SELECT * FROM PHONG WHERE MaKS = ?';
    con.query(query, [maKS], (error, results) => {
        if (error) {
            console.error('error fetching rooms:', error);
            return res.status(500).json({ error: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Dữ liệu phòng không tìm thấy' });
        }
        res.json(results); // Trả về danh sách phòng
    });
});
//Route lấy ảnh để giải mã
const fs = require('fs');
const path1 = require('path');
const { error } = require('console');
app.get('/room-image/:maPhong', (req, res) => {
    const maPhong = req.params.maPhong;
    const query = 'SELECT Hinhanh FROM PHONG WHERE MaPhong = ?';
    con.query(query, [maPhong], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy ảnh phòng' });
        }
        const imageData = results[0].Hinhanh; // Giả định đây là BLOB
        fs.writeFile(path1.join(__dirname, 'temp_image.jpg'), imageData, (error) => {
            if (error) {
                console.error('error writing image to file:', error);
                return res.status(500).json({ message: 'error writing image', error: error.message });
            }
            console.log('Image written to temp_image.jpg'); // Kiểm tra file
        });
        res.setHeader('Content-Type', 'image/jpg'); // Hoặc 'image/png' nếu cần
        res.end(imageData); // Trả về ảnh nhị phân
    });
});
// Route để đăng nhập
app.post('/login', async function(req, res) {
    const { email, password } = req.body; // Nhận email và mật khẩu từ request body
    const query = 'SELECT * FROM KHACHHANG WHERE Email = ?';
    con.query(query, [email], (error, results) => {
        if (error) {
            console.error('error querying database:', error.stack);
            return res.status(500).json({ error: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }
        const user = results[0];
        // Kiểm tra mật khẩu
        if (user.MatKhau.trim() !== password.trim()) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }
        // Lưu thông tin người dùng vào session
        req.session.customerId = user.UserID; // Lưu ID khách hàng vào session
        req.session.useremail = user.Email; // Lưu email người dùng vào session
        req.session.username = user.HoVaTen; // Lưu tên người dùng vào session
        req.session.usercccd = user.MaCCCD; // Lưu CCCD vào session
        // Lưu customerId vào sessionStorage (ở phía client)
        return res.status(200).json({ success: true, username: user.HoVaTen, customerId: user.UserID });
    });
});
//Route đăng nhập admin
app.post('/adminlogin', async function(req, res) {
    const { email, password } = req.body; // Nhận email và mật khẩu từ request body
    const query = 'SELECT * FROM QUANTRIVIEN WHERE Email = ?';
    con.query(query, [email], (error, results) => {
        if (error) {
            console.error('error querying database:', error.stack);
            return res.status(500).json({ error: 'Internal server error', error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }
        const user = results[0];
        // Kiểm tra mật khẩu
        if (user.MatKhau.trim() !== password.trim()) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }
        // Lưu thông tin người dùng vào session
        req.session.useremail = user.Email; // Lưu email người dùng vào session
        req.session.username = user.HoVaTen;
        req.session.customerId = user.StaffID; // Lưu ID khách hàng vào session
        return res.status(200).json({ success: true, username: user.HoVaTen, customerId: user.StaffID });
    });
});
//Route đăng nhập admin
app.post('/nvlogin', async function(req, res) {
    const { email, password } = req.body; // Nhận email và mật khẩu từ request body
    const query = 'SELECT * FROM NHANVIEN WHERE Email = ?';
    con.query(query, [email], (error, results) => {
        if (error) {
            console.error('error querying database:', error.stack);
           return res.status(500).json({ message: 'Internal server error', detail: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Email không tồn tại' });
        }
        const user = results[0];
        // Kiểm tra mật khẩu
        if (user.MatKhau.trim() !== password.trim()) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }
        // Lưu thông tin người dùng vào session
        req.session.useremail = user.Email; // Lưu email người dùng vào session
        req.session.username = user.HoVaTen; // Lưu tên người dùng vào session
        req.session.customerId = user.NVID; // Lưu ID khách hàng vào session
        return res.status(200).json({ success: true, username: user.HoVaTen });
    });
});
// Route hiển thị danh sách khách sạn
app.get('/api/rooms', (req, res) => {
    const sql = 'SELECT MaKS, TenKS, DiaChi, TinhThanh FROM KHACHSAN'; // Thay 'items' bằng tên bảng của bạn
    con.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json(results);
    });
});
// Route hiển thị tên khách sạn và loại phòng
app.get('/data/hotelandroom/:maKS/:maPhong', (req, res) => {
    const maPhong = req.params.maPhong;
    const maKS = req.params.maKS;
    // SQL để lấy tên khách sạn, loại phòng và giá phòng
    const sql = `
        SELECT k.TenKS, p.LoaiPhong, p.GiaPhong 
        FROM KHACHSAN k 
        JOIN PHONG p ON k.MaKS = p.MaKS 
        WHERE k.MaKS = ? AND p.MaPhong = ?
    `;
    con.query(sql, [maKS, maPhong], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' });
        }
        // Trả về kết quả đầu tiên với thông tin khách sạn, loại phòng và giá phòng
        res.json({
            TenKS: results[0].TenKS,
            LoaiPhong: results[0].LoaiPhong,
            GiaPhong: results[0].GiaPhong // Đảm bảo giá phòng được lấy từ kết quả
        });
    });
});
// Hiển thị giá phòng khi thanh toán
app.get('/data/price/:maPhong', (req, res) => {
    const maPhong = req.params.maPhong;
    // SQL để lấy giá phòng
    const sql = `
        SELECT GiaPhong 
        FROM PHONG 
        WHERE MaPhong = ?
    `;
    con.query(sql, [maPhong], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' });
        }
        res.json(results[0]); // Trả về kết quả đầu tiên (giá phòng)
    });
});
//Route hiển thị danh sách phòng
app.get('/api/phong', (req, res) => {
    const sql = 'SELECT * FROM PHONG'; // Thay 'items' bằng tên bảng của bạn
    con.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        res.json(results);
    });
});
//Route hiển thị thông tin khách hàng
app.get('/api/user', (req, res) => {
    const cccd = req.session.usercccd; // Lấy CCCD từ tham số URL
    const sql = 'SELECT HoVaTen, SoDienThoai, NgaySinh, GioiTinh, DiaChi FROM KHACHHANG WHERE MaCCCD = ?'; // Sửa lại câu lệnh SQL
    con.query(sql, [cccd], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.redirect('/404');
        }
        res.json(results[0]); // Trả về hàng đầu tiên
    });
});
//Route hiển thị thông tin khách hàng
app.get('/api/user/view', (req, res) => {
    const cccd = req.session.usercccd; // Lấy CCCD từ tham số URL
    const sql = 'SELECT HoVaTen, SoDienThoai, Email, GioiTinh, DiaChi, MaCCCD FROM KHACHHANG WHERE MaCCCD = ?'; // Sửa lại câu lệnh SQL
    con.query(sql, [cccd], (error, results) => {
        if (error) {
            return res.status(500).json({ message: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]); // Trả về hàng đầu tiên
    });
});
//Route chỉnh sửa thông tin khách hàng
app.post('/chinhsuatt', async function(req, res) {
    console.log('Received data:', req.body);
    let { name, phone, email, gender, address, cccd } = req.body;
    try {
        // Kiểm tra xem người dùng có tồn tại không
        const checkUserQuery = 'SELECT * FROM KHACHHANG WHERE MaCCCD = ?';
        con.query(checkUserQuery, [cccd], function(error, results) {
            if (error) {
                console.error('error checking user:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu người dùng không tồn tại
            if (results.length === 0) {
                return res.status(404).json({ error: 'Người dùng không tồn tại.' });
            }
            // Nếu người dùng tồn tại, cập nhật thông tin
            const updateQuery = `
                UPDATE KHACHHANG SET HoVaTen = ?, SoDienThoai = ?, Email = ?, GioiTinh = ?, DiaChi = ?
                WHERE MaCCCD = ?
            `;
            con.query(updateQuery, [name, phone, email, gender, address, cccd], function(error) {
                if (error) {
                    console.error('error updating data:', error.stack);
                    return res.status(500).json({ error: 'Failed to update user information', error: error.message });
                }
                return res.status(200).json({ message: 'User information updated successfully' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
//Route cập nhật thông tin khách sạn
app.post('/chinhsuaks', async function(req, res) {
    console.log('Received data:', req.body);
    let { TenKS, DiaChi, TinhThanh, SoTongDai, MaKS } = req.body; // Lấy tên khách sạn mới và mã khách sạn
    try {
        // Kiểm tra xem khách sạn có tồn tại không
        const checkHotelQuery = 'SELECT * FROM KHACHSAN WHERE MaKS = ?';
        con.query(checkHotelQuery, [MaKS], function(error, results) {
            if (error) {
                console.error('error checking hotel:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu khách sạn không tồn tại
            if (results.length === 0) {
                return res.status(404).json({ error: 'Khách sạn không tồn tại.' });
            }
            // Nếu khách sạn tồn tại, cập nhật thông tin
            const updateQuery = `
                UPDATE KHACHSAN SET TenKS = ?, DiaChi = ?, TinhThanh = ?, SoTongDai = ?
                WHERE MaKS = ?
            `;
            con.query(updateQuery, [TenKS, DiaChi, TinhThanh, SoTongDai, MaKS], function(error) {
                if (error) {
                    console.error('error updating data:', error.stack);
                    return res.status(500).json({ error: 'Cập nhật thông tin khách sạn thất bại', error: error.message });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin khách sạn thành công' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
// Route lưu thông tin đặt phòng
app.post('/save-booking', (req, res) => {
    const { maPhong, numberOfNights, numberOfPeople, checkinTime, checkoutTime, customerId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!maPhong || !numberOfNights || !numberOfPeople || !checkinTime || !checkoutTime || !customerId) {
        return res.status(400).json({ message: 'Thông tin đặt phòng không đầy đủ.' });
    }
    const sqlInsert = 'INSERT INTO THUTUCDATPHONG (MaPhong, SoDem, SoNguoi, Ngaynhanphong, Ngaytraphong, UserID) VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sqlInsert, [maPhong, numberOfNights, numberOfPeople, checkinTime, checkoutTime, customerId], (error, result) => {
        if (error) {
            console.error('Có lỗi xảy ra khi lưu đặt phòng:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra khi lưu đặt phòng', error: error.message });
        }
        // Thực hiện truy vấn để lấy mã đặt phòng
        const sqlSelect = 'SELECT MaDatPhong FROM THUTUCDATPHONG WHERE MaPhong = ? ORDER BY MaDatPhong DESC LIMIT 1';
        con.query(sqlSelect, [maPhong], (error, rows) => {
            if (error) {
                console.error('Lỗi khi truy vấn mã đặt phòng:', error);
                return res.status(500).json({ message: 'Có lỗi xảy ra khi truy vấn mã đặt phòng', error: error.message });
            }
            if (rows.length > 0) {
                const maDatPhong = rows[0].MaDatPhong; // Lấy mã đặt phòng
                res.status(201).json({ bookingId: maDatPhong });
            } else {
                res.status(404).json({ message: 'Không tìm thấy mã đặt phòng'});
            }
        });
    });
});
//Route lấy số đêm và người để tính giá tiền
app.get('/data/booking-details/:maDatPhong', (req, res) => {
    const maDatPhong = req.params.maDatPhong;
    const sql = 'SELECT SoDem, SoNguoi FROM THUTUCDATPHONG WHERE MaDatPhong = ?';
    con.query(sql, [maDatPhong], (error, results) => {
        if (error) {
            console.error('Lỗi khi lấy thông tin đặt phòng:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra khi lấy thông tin', error: error.message });
        }
        if (results.length > 0) {
            res.status(200).json(results[0]);
        } else {
            res.status(404).json({ message: 'Không tìm thấy thông tin đặt phòng'});
        }
    });
});
//Route chỉnh sửa phòng
app.post('/updateroom', async function(req, res) {
    console.log('Received data:', req.body);
    let { LoaiPhong, GiaPhong, TrangThai, TienNghi, MaPhong, Hinhanh } = req.body; // Lấy thông tin phòng
    try {
        // Kiểm tra xem phòng có tồn tại không
        const checkRoomQuery = 'SELECT * FROM PHONG WHERE MaPhong = ?';
        con.query(checkRoomQuery, [MaPhong], function(error, results) {
            if (error) {
                console.error('error checking room:', error.stack);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
            // Nếu phòng không tồn tại
            if (results.length === 0) {
                return res.status(404).json({ message: 'Phòng không tồn tại.'});
            }
            // Nếu Hinhanh có giá trị, xử lý dữ liệu base64
            let imageBuffer = null;
            if (Hinhanh) {
                // Tách chuỗi base64 và lấy phần dữ liệu hình ảnh
                const base64Data = Hinhanh.split(",")[1]; // Lấy phần sau dấu phẩy
                // Chuyển đổi chuỗi base64 thành buffer
                imageBuffer = Buffer.from(base64Data, 'base64');
            }
            // Cập nhật thông tin phòng
            const updateQuery = `
                UPDATE PHONG SET LoaiPhong = ?, GiaPhong = ?, TrangThai = ?, TienNghi = ? ${Hinhanh ? ', Hinhanh = ?' : ''}
                WHERE MaPhong = ?
            `;
            const params = [LoaiPhong, GiaPhong, TrangThai, TienNghi];
            if (Hinhanh) {
                params.push(imageBuffer); // Chỉ thêm imageBuffer nếu nó có giá trị
            }
            params.push(MaPhong);
            con.query(updateQuery, params, function(error) {
                if (error) {
                    console.error('error updating room data:', error.stack);
                    return res.status(500).json({ message: 'Cập nhật thông tin phòng thất bại', error: error.message });
                }
                return res.status(200).json({ message: 'Cập nhật thông tin phòng thành công' });
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
//Route hiển thị thông tin phòng trước edit
app.get('/viewroom/:maPhong', async function(req, res) {
    const maPhong = req.params.maPhong; // Lấy mã phòng từ URL
    try {
        // Kiểm tra xem phòng có tồn tại không
        const checkRoomQuery = 'SELECT * FROM PHONG WHERE MaPhong = ?';
        con.query(checkRoomQuery, [maPhong], function(error, results) {
            if (error) {
                console.error('error checking room:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu phòng không tồn tại
            if (results.length === 0) {
                return res.status(404).json({ error: 'Phòng không tồn tại.'});
            }
            // Nếu phòng tồn tại, trả về thông tin phòng
            return res.status(200).json({
                message: 'Lấy thông tin phòng thành công',
                room: results[0] // Trả về phòng đầu tiên trong kết quả
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
//Route xóa khách sạn
app.delete('/xoaks/:maKS', async function(req, res) {
    const maKS = req.params.maKS; // Lấy mã khách sạn từ URL
    try {
        // Kiểm tra xem khách sạn có tồn tại không
        const checkHotelQuery = 'SELECT * FROM KHACHSAN WHERE MaKS = ?';
        con.query(checkHotelQuery, [maKS], function(error, results) {
            if (error) {
                console.error('error checking hotel:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu khách sạn không tồn tại
            if (results.length === 0) {
                return res.status(404).json({ error: 'Khách sạn không tồn tại.'});
            }
            // Nếu khách sạn tồn tại, xóa
            const deleteQuery = 'DELETE FROM KHACHSAN WHERE MaKS = ?';
            con.query(deleteQuery, [maKS], function(error) {
                if (error) {
                    console.error('error deleting hotel:', error.stack);
                    return res.status(500).json({ error: 'Xóa khách sạn thất bại', error: error.message });
                }
                return res.status(200).json({ message: 'Khách sạn đã được xóa thành công'});
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
//Route xóa phòng
app.delete('/deleteroom/:maPhong', async function(req, res) {
    const maPhong = req.params.maPhong; // Lấy mã phòng từ URL
    try {
        // Kiểm tra xem phòng có tồn tại không
        const checkRoomQuery = 'SELECT * FROM PHONG WHERE MaPhong = ?';
        con.query(checkRoomQuery, [maPhong], function(error, results) {
            if (error) {
                console.error('error checking room:', error.stack);
                return res.status(500).json({ error: 'Internal server error', error: error.message });
            }
            // Nếu phòng không tồn tại
            if (results.length === 0) {
                return res.status(404).json({ error: 'Phòng không tồn tại.'});
            }
            // Nếu phòng tồn tại, xóa
            const deleteQuery = 'DELETE FROM PHONG WHERE MaPhong = ?';
            con.query(deleteQuery, [maPhong], function(error) {
                if (error) {
                    console.error('error deleting room:', error.stack);
                    return res.status(500).json({ error: 'Xóa phòng thất bại', error: error.message });
                }
                return res.status(200).json({ message: 'Phòng đã được xóa thành công'});
            });
        });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json({ error: 'Internal server error', error: error.message });
    }
});
// Route để lưu thông tin thanh toán
app.post('/save-payment', (req, res) => {
    const { customerId, maDatPhong, phuongThucThanhToan, ngayThanhToan } = req.body;
    // Kiểm tra nếu tất cả thông tin cần thiết có sẵn
    if (!customerId || !maDatPhong || !phuongThucThanhToan || !ngayThanhToan) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết' });
    }
    // Truy vấn để lưu thông tin thanh toán
    const query = 'INSERT INTO THANHTOAN (UserID, MaDatPhong, PhuongThucThanhToan, NgayThanhToan) VALUES (?, ?, ?, ?)';
    con.query(query, [customerId, maDatPhong, phuongThucThanhToan, ngayThanhToan], (error, results) => {
        if (error) {
            console.error('Lỗi khi lưu thông tin thanh toán:', error.stack);
            return res.status(500).json({ error: 'Internal server error', error: error.message });
        }
        // Trả về phản hồi thành công
        return res.status(201).json({ message: 'Thanh toán đã được lưu thành công', paymentId: results.insertId });
    });
});
//Route lưu thông tin đánh giá
app.post('/save-review', (req, res) => {
    const { customerId, maKS, rating, reviewText } = req.body;
    if (!customerId || !maKS || rating === undefined || !reviewText) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đánh giá.' });
    }
    const ngayDanhGia = new Date().toISOString().slice(0, 10); // Lấy ngày hiện tại
    const sql = 'INSERT INTO DANHGIA (UserID, MaKS, Ngaydanhgia, Mucdohailong, Phanhoivadexuat) VALUES (?, ?, ?, ?, ?)';
    const values = [customerId, maKS, ngayDanhGia, rating, reviewText];
    con.query(sql, values, (error, results) => {
        if (error) {
            console.error('Lỗi khi lưu đánh giá:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra khi lưu đánh giá.', error: error.message });
        }
        res.status(201).json({ message: 'Đánh giá đã được lưu thành công!' });
    });
});
//Route hiển thị đánh giá
app.get('/api/reviews/:maKS', (req, res) => {
    const { maKS } = req.params; // Lấy mã khách sạn từ params
    // Kiểm tra xem maKS có tồn tại không
    if (!maKS) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mã khách sạn (maKS).' });
    }
    // Câu lệnh SQL để lấy đánh giá
    const sql = `
        SELECT d.UserID, d.MaKS, k.HoVaTen, d.Mucdohailong, d.Phanhoivadexuat
        FROM DANHGIA d
        JOIN KHACHHANG k ON d.UserID = k.UserID
        WHERE d.MaKS = ?
    `;
    // Thực hiện truy vấn
    con.query(sql, [maKS], (error, results) => {
        if (error) {
            console.error('Lỗi khi tải đánh giá:', error); // In ra lỗi cho việc gỡ lỗi
            return res.status(500).json({ message: 'Có lỗi xảy ra khi tải đánh giá.', error: error.message });
        }
        // Kiểm tra xem có kết quả nào không
        if (results.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá cho mã khách sạn này.'});
        }
        // Trả về kết quả
        res.status(200).json(results);
    });
});
// Route để lấy thông tin phòng
app.get('/room-details', (req, res) => {
    const { maPhong } = req.query;
    const query = 'SELECT LoaiPhong, GiaPhong, TienNghi, Hinhanh FROM PHONG WHERE maPhong = ?';
    con.query(query, [maPhong], (error, results) => {
        if (error) {
            console.error(error, error.message);
            return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Phòng không tìm thấy'});
        }
        const room = results[0];
        res.json(room);
    });
});
// Endpoint để lấy thông tin đặt phòng
app.get('/api/bookings', async (req, res) => {
    const query = `
        SELECT t.*, k.HoVaTen, p.LoaiPhong 
        FROM THUTUCDATPHONG t
        JOIN KHACHHANG k ON t.UserID = k.UserID
        JOIN PHONG p ON t.MaPhong = p.MaPhong
    `;

    try {
        // Sử dụng con.query với Promise
        con.query(query, (error, results) => {
            if (error) {
                console.error('Lỗi khi thực hiện truy vấn:', error.message);
                return res.status(500).json({ message: 'Server error', error: error.message });
            }

            // Kiểm tra nếu results là một mảng
            if (!Array.isArray(results)) {
                throw new error('Kết quả truy vấn không phải là mảng');
            }

            res.json(results);
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin đặt phòng:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Endpoint để xóa một đặt phòng
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    // Bước 1: Xóa các bản ghi liên quan trong bảng thanh toán
    con.query('DELETE FROM THANHTOAN WHERE MaDatPhong = ?', [bookingId], (error) => {
        if (error) {
            console.error('Lỗi khi xóa bản ghi thanh toán:', error.message);
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
        // Bước 2: Xóa bản ghi trong bảng đặt phòng
        con.query('DELETE FROM THUTUCDATPHONG WHERE MaDatPhong = ?', [bookingId], (error, results) => {
            if (error) {
                console.error('Lỗi khi xóa đặt phòng:', error.message);
                return res.status(500).json({ message: 'Server error', error: error.message });
            }
            // Kiểm tra xem có bất kỳ hàng nào bị ảnh hưởng hay không
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Đặt phòng không tồn tại' });
            }
            res.status(204).send(); // Không có nội dung
        });
    });
});
// Endpoint để lấy thông tin đặt phòng theo customerId
app.get('/api/bookingscustomer', async (req, res) => {
    const customerId = req.session.customerId; // Lấy customerId từ session

    const query = `
        SELECT t.*, k.HoVaTen, p.LoaiPhong 
        FROM THUTUCDATPHONG t
        JOIN KHACHHANG k ON t.UserID = k.UserID
        JOIN PHONG p ON t.MaPhong = p.MaPhong
        WHERE t.UserID = ?
    `;
    try {
        // Sử dụng con.query với Promise
        con.query(query, [customerId], (error, results) => {
            if (error) {
                console.error('Lỗi khi thực hiện truy vấn:', error.message);
                return res.status(500).json({ message: 'Server error', error: error.message });
            }
            // Kiểm tra nếu results là một mảng
            if (!Array.isArray(results)) {
                throw new Error('Kết quả truy vấn không phải là mảng');
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin đặt phòng:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Middleware kiểm tra xác thực
function checkAuth(req, res, next) {
    if (req.session.useremail) {
        req.username = req.session.username; // Lưu tên người dùng vào request
        return next(); // Người dùng đã đăng nhập
    }
    return res.redirect('/login'); // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
}
//Route đăng xuất
app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.status(500).json({ message: 'Could not log out.', error: error.message });
        }
        return res.redirect('/login'); // Chuyển hướng về trang đăng nhập
    });
});
// Khởi động server
app.listen(port, function() {
    console.log(`Node server running @ http://localhost:${port}`);
});
