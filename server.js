//File server này cực kì quan trọng, không được xóa
var mysql = require('mysql');
var express = require('express');
var path = require('path');
const fs = require('fs');
const multer = require('multer');
var app = express();
var port = 5000;
const bodyParser = require('body-parser');
const session = require('express-session');

// --- THÊM THƯ VIỆN CHO REAL-TIME VÀ BẢO MẬT ---
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'MaVuongTulen55555';

// --- CẤU HÌNH SESSION (ĐÃ FIX LỖI LOOP LOGIN) ---
app.use(session({
    secret: 'MaVuongTulen55555',
    resave: true, // Phải để true để đảm bảo session lưu kịp thời
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // Lưu 1 ngày
}));

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(express.static('test'));
app.use('/images', express.static('anh'));
app.use(express.static(__dirname, { extensions: ["html", "htm", "gif", "png", "jpg"] }));

// Setup uploads directory and multer
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ hỗ trợ file ảnh (JPG, PNG, WebP, GIF)'));
        }
    }
});

app.use('/uploads', express.static(uploadsDir));

// Middleware kiểm tra xác thực (Đã fix)
function checkAuth(req, res, next) {
    if (req.session.useremail || req.session.username) {
        req.username = req.session.username;
        return next();
    }
    return res.redirect('/login');
}

// --- CÁC ROUTE GIAO DIỆN ---
app.get('/register', function (req, res) { res.sendFile(path.join(__dirname, 'register.html')); });
app.get('/login', function (req, res) { res.sendFile(path.join(__dirname, 'login.html')); });
app.get('/admlogin', function (req, res) { res.sendFile(path.join(__dirname, 'adminlogin.html')); });
app.get('/quanly', function (req, res) { res.sendFile(path.join(__dirname, 'QuanLy.html')); });
app.get('/trangchu', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/thongtinphong1', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'thongtinphong1.html')); });
app.get('/chitietphong', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'thongtinphong2.html')); });
app.get('/ttkh', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'TTKH.html')); });
app.get('/404', function (req, res) { res.sendFile(path.join(__dirname, '404.html')); });
app.get('/chinhsuatt', function (req, res) { res.sendFile(path.join(__dirname, 'editTT.html')); });
app.get('/themphong', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'themphong.html')); });
app.get('/themkhachsan', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'themkhachsan.html')); });
app.get('/kqtk', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'kqtk.html')); });
app.get('/editKS', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'editKS.html')); });
app.get('/dsks123', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'dsks123.html')); });
app.get('/dsphong', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'dsphong.html')); });
app.get('/nhatkyphong', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'nhatkyphong.html')); });
app.get('/lsnhatky', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'lsnhatky.html')); });
app.get('/adminreg', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'adminreg.html')); });
app.get('/datphong', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'datphong.html')); });
app.get('/payment', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'datphong.html')); });
app.get('/mode', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'mode.html')); });
app.get('/nvlogin', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'nvlogin.html')); });
app.get('/lichsudatphong', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'HP.html')); });
app.get('/lichsudatphongkhachhang', checkAuth, function (req, res) { res.sendFile(path.join(__dirname, 'lsdp.html')); });
app.get('/chi-tiet-khach-san', function (req, res) { res.sendFile(path.join(__dirname, 'chi-tiet-khach-san.html')); });

// --- KHỞI TẠO CƠ SỞ DỮ LIỆU ---
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "123456789",
    database: "dapm"
});

con.connect(function (error) {
    if (error) { console.error('Lỗi kết nối DB: ' + error.stack); return; }
    console.log('✅ Connected to database as id ' + con.threadId);

    function ensureColumn(columnName, columnType = 'DOUBLE NULL') {
        const showColumnSql = `SHOW COLUMNS FROM KHACHSAN LIKE ?`;
        con.query(showColumnSql, [columnName], (err, result) => {
            if (err) return console.error(`Lỗi kiểm tra cột ${columnName}:`, err.message);
            if (result.length === 0) {
                const alterSql = `ALTER TABLE KHACHSAN ADD COLUMN ${columnName} ${columnType}`;
                con.query(alterSql, (alterErr) => {
                    if (alterErr) console.error(`Không thể thêm cột ${columnName}:`, alterErr.message);
                    else console.log(`Đã thêm cột ${columnName} vào KHACHSAN`);
                });
            } else {
                console.log(`Cột ${columnName} đã tồn tại`);
            }
        });
    }

    ensureColumn('Latitude', 'DOUBLE NULL');
    ensureColumn('Longitude', 'DOUBLE NULL');
    ensureColumn('GioiThieu', 'LONGTEXT NULL');
    ensureColumn('DiemNoiBat', 'LONGTEXT NULL');
    ensureColumn('HinhAnh', 'LONGTEXT NULL');
    ensureColumn('Video', 'LONGTEXT NULL');
    ensureColumn('GiaPhongMax', 'DECIMAL(10,2) NULL');

    const createLogTableSql = `
        CREATE TABLE IF NOT EXISTS NHATKYPHONG (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            MaPhong VARCHAR(50) NOT NULL,
            HanhDong VARCHAR(255) NOT NULL,
            NoiDung TEXT,
            TrangThaiSauCapNhat VARCHAR(100),
            NguoiThucHien VARCHAR(50),
            ThoiGian DATETIME
        )
    `;
    con.query(createLogTableSql, (err) => {
        if (err) console.error('Lỗi tạo bảng NHATKYPHONG:', err.message);
        else console.log('Bảng NHATKYPHONG đã sẵn sàng');
    });
});

// ==========================================
// ROUTE ĐĂNG NHẬP KHÁCH HÀNG (ĐÃ FIX CHUẨN)
// ==========================================
app.post('/login', async function (req, res) {
    const { email, password } = req.body;
    console.log('=== LOGIN ATTEMPT ===', email);

    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
    }

    const query = 'SELECT * FROM KHACHHANG WHERE Email = ?';
    con.query(query, [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Lỗi hệ thống', detail: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Email không tồn tại' });

        const user = results[0];
        const dbPass = user.MatKhau ? user.MatKhau.trim() : '';

        if (password.trim() !== dbPass) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        // TẠO JWT TOKEN
        const token = jwt.sign({ userId: user.UserID, role: 'Customer' }, JWT_SECRET, { expiresIn: '24h' });

        // LƯU SESSION (GHI RÕ TÊN CỘT THEO DB)
        req.session.customerId = user.UserID;
        req.session.useremail = user.Email;
        req.session.username = user.HoVaTen;
        req.session.usercccd = user.MaCCCD;

        // ĐẢM BẢO SESSION ĐƯỢC LƯU TRƯỚC KHI TRẢ VỀ CLIENT
        req.session.save((err) => {
            if (err) {
                console.error("Lỗi lưu session:", err);
                return res.status(500).json({ message: "Lỗi phiên đăng nhập" });
            }
            console.log('✅ Đăng nhập thành công cho:', user.HoVaTen);
            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                token: token,
                username: user.HoVaTen,
                customerId: user.UserID
            });
        });
    });
});

//Route đăng nhập admin
app.post('/adminlogin', async function (req, res) {
    const { email, password } = req.body;
    const query = 'SELECT * FROM QUANTRIVIEN WHERE Email = ?';
    con.query(query, [email], (error, results) => {
        if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Email không tồn tại' });
        const user = results[0];
        if (user.MatKhau.trim() !== password.trim()) return res.status(401).json({ message: 'Mật khẩu không đúng' });

        req.session.useremail = user.Email;
        req.session.username = user.HoVaTen;
        req.session.customerId = user.StaffID;
        req.session.save(() => {
            return res.status(200).json({ success: true, username: user.HoVaTen, customerId: user.StaffID });
        });
    });
});

//Route đăng nhập nhân viên
app.post('/nvlogin', async function (req, res) {
    const { email, password } = req.body;
    const query = 'SELECT * FROM NHANVIEN WHERE Email = ?';
    con.query(query, [email], (error, results) => {
        if (error) return res.status(500).json({ message: 'Internal server error', detail: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Email không tồn tại' });
        const user = results[0];
        if (user.MatKhau.trim() !== password.trim()) return res.status(401).json({ message: 'Mật khẩu không đúng' });

        req.session.useremail = user.Email;
        req.session.username = user.HoVaTen;
        req.session.customerId = user.NVID;
        req.session.save(() => {
            return res.status(200).json({ success: true, username: user.HoVaTen });
        });
    });
});

//Route đăng xuất
app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) return res.status(500).json({ message: 'Could not log out.', error: error.message });
        return res.redirect('/login');
    });
});

// --- CÁC ROUTE NGHIỆP VỤ KHÁC (NGUYÊN BẢN CỦA BẠN) ---

app.post('/register', async function (req, res) {
    let { regname, regdate, regsex, reglocate, regphone, regid, regemail, regpassword } = req.body;
    try {
        const checkEmailQuery = 'SELECT * FROM KHACHHANG WHERE Email = ?';
        con.query(checkEmailQuery, [regemail], function (error, results) {
            if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
            if (results.length > 0) return res.status(400).json({ error: 'Người dùng đã tồn tại.' });

            const insertQuery = `INSERT INTO KHACHHANG (HoVaTen, NgaySinh, GioiTinh, Diachi, SoDienThoai, MaCCCD, Email, MatKhau) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            con.query(insertQuery, [regname, regdate, regsex, reglocate, regphone, regid, regemail, regpassword], function (error) {
                if (error) return res.status(500).json({ error: 'Failed to register user', error: error.message });
                return res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Internal server error', error: error.message }); }
});

app.post('/adminregister', async function (req, res) {
    let { HoVaTen, Email, MatKhau } = req.body;
    try {
        const checkEmailQuery = 'SELECT * FROM QUANTRIVIEN WHERE Email = ?';
        con.query(checkEmailQuery, [Email], function (error, results) {
            if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
            if (results.length > 0) return res.status(400).json({ error: 'Người dùng đã tồn tại.' });
            const insertQuery = `INSERT INTO QUANTRIVIEN (HoVaTen, Email, MatKhau) VALUES (?, ?, ?)`;
            con.query(insertQuery, [HoVaTen, Email, MatKhau], function (error) {
                if (error) return res.status(500).json({ error: 'Failed to register user', error: error.message });
                return res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Internal server error', error: error.message }); }
});

app.post('/themphong', async function (req, res) {
    let { roomtype, roomprice, roomtt, roomacs, hotelid, roomimg } = req.body;
    if (!roomtype || !roomprice || !roomtt || !roomacs || !hotelid) return res.status(400).json({ error: 'Vui lòng cung cấp tất cả các trường cần thiết.' });
    let imgBuffer = null;
    if (roomimg) imgBuffer = Buffer.from(roomimg.split(",")[1], 'base64');

    try {
        const checkRoomQuery = 'SELECT * FROM PHONG WHERE MaKS = ? AND LoaiPhong = ?';
        con.query(checkRoomQuery, [hotelid, roomtype], function (error, results) {
            if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
            if (results.length > 0) return res.status(400).json({ error: 'Phòng đã tồn tại.' });
            const insertQuery = `INSERT INTO PHONG (LoaiPhong, GiaPhong, TrangThai, TienNghi, MaKS, Hinhanh) VALUES (?, ?, ?, ?, ?, ?)`;
            con.query(insertQuery, [roomtype, roomprice, roomtt, roomacs, hotelid, imgBuffer], function (error) {
                if (error) return res.status(500).json({ error: 'Thêm thất bại', error: error.message });
                return res.status(201).json({ message: 'Thêm phòng thành công' });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Internal server error', error: error.message }); }
});

app.post('/themkhachsan', upload.any(), async function (req, res) {
    let { TenKS, DiaChi, TinhThanh, SoTongDai, Latitude, Longitude, GioiThieu, DiemNoiBat, Videos } = req.body;
    try {
        const checkHotelQuery = 'SELECT * FROM KHACHSAN WHERE TenKS = ?';
        con.query(checkHotelQuery, [TenKS], function (error, results) {
            if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
            if (results.length > 0) return res.status(400).json({ error: 'Khách sạn đã tồn tại.' });
            const imageUrls = [];
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => { imageUrls.push(`/uploads/${file.filename}`); });
            }
            let videosArray = [];
            try { videosArray = Videos ? JSON.parse(Videos) : []; } catch (e) { }

            const insertQuery = `INSERT INTO KHACHSAN (TenKS, DiaChi, TinhThanh, SoTongDai, Latitude, Longitude, GioiThieu, DiemNoiBat, HinhAnh, Video) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            con.query(insertQuery, [TenKS, DiaChi, TinhThanh, SoTongDai || null, Latitude || null, Longitude || null, GioiThieu || null, DiemNoiBat || null, JSON.stringify(imageUrls), JSON.stringify(videosArray)], function (error, result) {
                if (error) return res.status(500).json({ error: 'Thêm khách sạn thất bại', error: error.message });
                const hotelId = result.insertId;
                const defaultRoomQuery = `INSERT INTO PHONG (LoaiPhong, GiaPhong, TrangThai, TienNghi, MaKS, Hinhanh) VALUES (?, ?, ?, ?, ?, NULL)`;
                con.query(defaultRoomQuery, ['Standard', 0, 'Trống', 'Tiêu chuẩn', hotelId], function (err) {
                    if (err) return res.status(201).json({ message: 'Thêm khách sạn thành công nhưng không tạo được phòng.', warning: err.message });
                    return res.status(201).json({ message: 'Thêm khách sạn và phòng khởi điểm thành công', hotelId: hotelId });
                });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Internal server error', error: error.message }); }
});

app.get('/dsks', async function (req, res) {
    const sql = 'SELECT MaKS, TenKS FROM KHACHSAN';
    con.query(sql, (error, results) => {
        if (error) return res.status(500).json({ message: 'Internal server error: ' + error.message });
        if (results.length === 0) return res.status(404).json({ message: 'No hotels found.' });
        res.json(results);
    });
});

app.get('/dstinh', async function (req, res) {
    const sql = 'SELECT distinct TinhThanh FROM KHACHSAN';
    con.query(sql, (error, results) => {
        if (error) return res.status(500).json({ message: 'Internal server error: ' + error.message });
        if (results.length === 0) return res.status(404).json({ message: 'No hotels found.' });
        res.json(results);
    });
});

app.get('/ks/:maKS', async function (req, res) {
    const maKS = req.params.maKS;
    const sql = 'SELECT * FROM KHACHSAN WHERE MaKS = ?';
    con.query(sql, [maKS], (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Khách sạn không tìm thấy' });
        res.json(results[0]);
    });
});

app.get('/api/khachsan/:id', async function (req, res) {
    const id = req.params.id;
    const sql = 'SELECT * FROM KHACHSAN WHERE MaKS = ?';
    con.query(sql, [id], (error, results) => {
        if (error) return res.status(500).json({ message: 'Lỗi server' });
        if (results.length === 0) return res.status(404).json({ message: 'Khách sạn không tìm thấy' });
        const hotel = results[0];
        try {
            hotel.images = hotel.HinhAnh ? JSON.parse(hotel.HinhAnh) : [];
            hotel.videos = hotel.Video ? JSON.parse(hotel.Video) : [];
            hotel.highlights = hotel.DiemNoiBat || '';
            hotel.gioithieu = hotel.GioiThieu || '';
            hotel.ten = hotel.TenKS;
            hotel.diachi = hotel.DiaChi;
            hotel.tinhthanh = hotel.TinhThanh;
            hotel.sotongdai = hotel.SoTongDai;
            hotel.giaphong = hotel.GiaPhong;
            hotel.giaphoongmax = hotel.GiaPhongMax;
        } catch (e) { hotel.images = []; hotel.videos = []; }
        res.json(hotel);
    });
});

app.get('/rooms/:maPhong', async function (req, res) {
    const maKS = req.params.maPhong;
    const sql = 'SELECT * FROM PHONG WHERE MaPhong = ?';
    con.query(sql, [maKS], (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Phòng không tìm thấy' });
        res.json(results[0]);
    });
});

app.get('/editks/:maKS', async function (req, res) {
    const maKS = req.params.maKS;
    const sql = `SELECT h.*, MIN(p.GiaPhong) AS GiaPhong FROM KHACHSAN h LEFT JOIN PHONG p ON h.MaKS = p.MaKS WHERE h.MaKS = ? GROUP BY h.MaKS`;
    con.query(sql, [maKS], (error, results) => {
        if (error) return res.status(500).json({ message: 'Internal server error', error: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Khách sạn không tìm thấy' });
        const hotel = results[0];
        try { hotel.videos = hotel.Video ? JSON.parse(hotel.Video) : []; } catch (e) { hotel.videos = []; }
        try { hotel.images = hotel.HinhAnh ? JSON.parse(hotel.HinhAnh) : []; } catch (e) { hotel.images = []; }
        res.json(hotel);
    });
});

app.post('/api/datphong-transaction', checkAuth, (req, res) => {
    const { maPhong, maKH, ngayNhan, ngayTra, tongTien } = req.body;
    con.beginTransaction(function (err) {
        if (err) { return res.status(500).json({ error: err.message }); }
        const sqlBooking = 'INSERT INTO THUTUCDATPHONG (MaPhong, Ngaynhanphong, Ngaytraphong, UserID) VALUES (?, ?, ?, ?)';
        con.query(sqlBooking, [maPhong, ngayNhan, ngayTra, maKH], function (error, result) {
            if (error) return con.rollback(function () { res.status(500).json({ error: "Lỗi lưu đặt phòng" }); });
            const sqlUpdateRoom = 'UPDATE PHONG SET TrangThai = "Đã đặt" WHERE MaPhong = ?';
            con.query(sqlUpdateRoom, [maPhong], function (error) {
                if (error) return con.rollback(function () { res.status(500).json({ error: "Lỗi cập nhật phòng" }); });
                con.commit(function (err) {
                    if (err) return con.rollback(function () { res.status(500).json({ error: err.message }); });
                    res.status(201).json({ success: true, message: "Giao dịch (Transaction) thành công!" });
                });
            });
        });
    });
});

app.get('/api/bookingscustomer', (req, res) => {
    const customerId = req.query.customerId || req.session.customerId;
    if (!customerId) return res.status(400).json({ message: 'Thiếu mã khách hàng' });
    const sql = `SELECT t.MaDatPhong, k.HoVaTen, t.Ngaynhanphong, t.SoDem, t.SoNguoi, p.LoaiPhong, t.MaPhong FROM THUTUCDATPHONG t INNER JOIN KHACHHANG k ON t.UserID = k.UserID INNER JOIN PHONG p ON t.MaPhong = p.MaPhong WHERE t.UserID = ? ORDER BY t.Ngaynhanphong DESC`;
    con.query(sql, [customerId], (error, results) => {
        if (error) return res.status(500).json({ message: 'Lỗi máy chủ' });
        res.json(results || []);
    });
});

app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    const findRoomSql = 'SELECT MaPhong FROM THUTUCDATPHONG WHERE MaDatPhong = ?';
    con.query(findRoomSql, [bookingId], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy thông tin đặt phòng' });
        const maPhong = results[0].MaPhong;
        con.beginTransaction(function (err) {
            if (err) return res.status(500).json({ error: err.message });
            con.query('DELETE FROM THANHTOAN WHERE MaDatPhong = ?', [bookingId], function (e1) {
                if (e1) return con.rollback(() => res.status(500).json({ error: 'Lỗi xóa dữ liệu thanh toán' }));
                con.query('DELETE FROM HUY WHERE MaDatPhong = ?', [bookingId], function (e2) {
                    if (e2) return con.rollback(() => res.status(500).json({ error: 'Lỗi xóa lịch sử hủy' }));
                    con.query('DELETE FROM THUTUCDATPHONG WHERE MaDatPhong = ?', [bookingId], function (error) {
                        if (error) return con.rollback(() => res.status(500).json({ error: 'Lỗi hủy đặt phòng: ' + error.message }));
                        con.query("UPDATE PHONG SET TrangThai = 'Trống' WHERE MaPhong = ?", [maPhong], function (err) {
                            if (err) return con.rollback(() => res.status(500).json({ error: 'Lỗi cập nhật trạng thái phòng' }));
                            con.commit(function (err) {
                                if (err) return con.rollback(() => res.status(500).json({ error: err.message }));
                                res.status(200).json({ success: true, message: 'Đã hủy đặt phòng thành công' });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/search', async function (req, res) {
    const tinhThanh = req.query.tinhThanh;
    if (!tinhThanh) return res.status(400).json({ message: 'Thiếu thông tin tỉnh thành' });
    const sql = 'SELECT MaKS, TenKS, DiaChi, TinhThanh, SoTongDai, HinhAnh FROM KHACHSAN WHERE TinhThanh LIKE ?';
    con.query(sql, [`%${tinhThanh}%`], (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        return res.json(results || []);
    });
});

app.get('/api/search-advanced', async function (req, res) {
    const q = req.query.q ? req.query.q.trim() : '';
    const tinhThanh = req.query.tinhThanh ? req.query.tinhThanh.trim() : '';
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const sortBy = req.query.sortBy ? req.query.sortBy.trim() : '';
    const whereClauses = [];
    const params = [];

    if (q) { whereClauses.push('(h.TenKS LIKE ? OR h.DiaChi LIKE ? OR h.TinhThanh LIKE ?)'); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    if (tinhThanh) { whereClauses.push('h.TinhThanh LIKE ?'); params.push(`%${tinhThanh}%`); }
    if (minPrice != null) { whereClauses.push('p.GiaPhong >= ?'); params.push(minPrice); }
    if (maxPrice != null) { whereClauses.push('p.GiaPhong <= ?'); params.push(maxPrice); }

    let sql = `SELECT h.MaKS, h.TenKS, h.DiaChi, h.TinhThanh, h.SoTongDai, h.Latitude, h.Longitude, h.HinhAnh, MIN(p.GiaPhong) AS GiaPhong FROM KHACHSAN h LEFT JOIN PHONG p ON h.MaKS = p.MaKS`;
    if (whereClauses.length > 0) sql += ' WHERE ' + whereClauses.join(' AND ');
    sql += ' GROUP BY h.MaKS';

    if (sortBy === 'priceDesc') sql += ' ORDER BY GiaPhong DESC, h.TinhThanh ASC';
    else if (sortBy === 'priceAsc') sql += ' ORDER BY GiaPhong ASC, h.TinhThanh ASC';
    else if (sortBy === 'city') sql += ' ORDER BY h.TinhThanh ASC, GiaPhong ASC';
    else sql += ' ORDER BY GiaPhong ASC, h.TinhThanh ASC';

    con.query(sql, params, (error, results) => {
        if (error) return res.status(500).json({ message: 'Lỗi khi tìm kiếm', error: error.message });
        return res.json(Array.isArray(results) ? results : []);
    });
});

app.get('/api/searchroom', async (req, res) => {
    const maKS = req.query.maKS;
    if (!maKS) return res.status(400).json({ message: 'MaKS is required.' });
    const sql = `SELECT p.MaPhong, p.LoaiPhong, p.GiaPhong, p.TrangThai, p.TienNghi, p.Hinhanh, ks.TenKS FROM PHONG p INNER JOIN KHACHSAN ks ON p.MaKS = ks.MaKS WHERE p.MaKS = ?`;
    con.query(sql, [maKS], (error, results) => {
        if (error) return res.status(500).json({ message: 'Internal server error: ' + error.message });
        if (results.length === 0) return res.status(404).json({ message: 'No rooms found.' });
        res.json(results);
    });
});

app.post('/api/room-log', (req, res) => {
    const { MaPhong, HanhDong, NoiDung, TrangThaiSauCapNhat, NguoiThucHien, ThoiGian } = req.body;
    if (!MaPhong || !HanhDong || !NoiDung) return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    const date = ThoiGian ? new Date(ThoiGian) : new Date();
    const mysqlDatetime = date.toISOString().slice(0, 19).replace('T', ' ');
    const insertQuery = `INSERT INTO NHATKYPHONG (MaPhong, HanhDong, NoiDung, TrangThaiSauCapNhat, NguoiThucHien, ThoiGian) VALUES (?, ?, ?, ?, ?, ?)`;
    con.query(insertQuery, [MaPhong, HanhDong, NoiDung, TrangThaiSauCapNhat, NguoiThucHien, mysqlDatetime], (error) => {
        if (error) return res.status(500).json({ success: false, message: 'Lỗi lưu nhật ký' });
        if (TrangThaiSauCapNhat) {
            con.query('UPDATE PHONG SET TrangThai = ? WHERE MaPhong = ?', [TrangThaiSauCapNhat, MaPhong], (err) => { if (err) console.error(err); });
        }
        return res.status(201).json({ success: true, message: 'Nhật ký quản lý phòng đã được lưu!' });
    });
});

app.get('/api/room-logs', (req, res) => {
    const maPhong = req.query.maPhong;
    let sql = 'SELECT * FROM NHATKYPHONG';
    let params = [];
    if (maPhong) { sql += ' WHERE MaPhong = ?'; params.push(maPhong); }
    sql += ' ORDER BY ThoiGian DESC';
    con.query(sql, params, (error, results) => {
        if (error) return res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
        res.status(200).json(results);
    });
});

app.get('/room/:maKS', (req, res) => {
    const maKS = req.params.maKS;
    const query = 'SELECT * FROM PHONG WHERE MaKS = ?';
    con.query(query, [maKS], (error, results) => {
        if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
        if (results.length === 0) return res.status(404).json({ error: 'Dữ liệu phòng không tìm thấy' });
        res.json(results);
    });
});

app.get('/api/rooms', (req, res) => {
    const sql = `SELECT h.MaKS, h.TenKS, h.DiaChi, h.TinhThanh, h.SoTongDai, h.HinhAnh, MIN(p.GiaPhong) AS GiaPhong FROM KHACHSAN h LEFT JOIN PHONG p ON h.MaKS = p.MaKS GROUP BY h.MaKS`;
    con.query(sql, (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json(results);
    });
});

app.get('/data/hotelandroom/:maKS/:maPhong', (req, res) => {
    const { maPhong, maKS } = req.params;
    const sql = `SELECT k.TenKS, p.LoaiPhong, p.GiaPhong FROM KHACHSAN k JOIN PHONG p ON k.MaKS = p.MaKS WHERE k.MaKS = ? AND p.MaPhong = ?`;
    con.query(sql, [maKS, maPhong], (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' });
        res.json({ TenKS: results[0].TenKS, LoaiPhong: results[0].LoaiPhong, GiaPhong: results[0].GiaPhong });
    });
});

app.get('/data/price/:maPhong', (req, res) => {
    const maPhong = req.params.maPhong;
    con.query('SELECT GiaPhong FROM PHONG WHERE MaPhong = ?', [maPhong], (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy dữ liệu.' });
        res.json(results[0]);
    });
});

app.get('/api/phong', (req, res) => {
    con.query('SELECT * FROM PHONG', (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json(results);
    });
});

app.get('/api/user', (req, res) => {
    const cccd = req.session.usercccd;

    // Kiểm tra ngay từ đầu xem có Session không
    if (!cccd) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc phiên làm việc hết hạn' });
    }

    con.query('SELECT HoVaTen, SoDienThoai, NgaySinh, GioiTinh, DiaChi FROM KHACHHANG WHERE MaCCCD = ?', [cccd], (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Lỗi truy vấn cơ sở dữ liệu', error: error.message });
        }
        
        if (results.length === 0) {
            // Thay vì redirect, ta trả về lỗi 404 dạng JSON
            return res.status(404).json({ message: 'Không tìm thấy thông tin khách hàng với CCCD này' });
        }

        // Trả về dữ liệu sạch sẽ
        res.json(results[0]);
    });
});

app.get('/api/user/view', (req, res) => {
    const cccd = req.session.usercccd;
    con.query('SELECT HoVaTen, SoDienThoai, Email, GioiTinh, DiaChi, MaCCCD FROM KHACHHANG WHERE MaCCCD = ?', [cccd], (error, results) => {
        if (error) return res.status(500).json({ message: error.message });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(results[0]);
    });
});

app.post('/chinhsuatt', async function (req, res) {
    let { name, phone, email, gender, address, cccd } = req.body;
    try {
        con.query('SELECT * FROM KHACHHANG WHERE MaCCCD = ?', [cccd], function (error, results) {
            if (error) return res.status(500).json({ error: 'Internal server error', error: error.message });
            if (results.length === 0) return res.status(404).json({ error: 'Người dùng không tồn tại.' });
            con.query('UPDATE KHACHHANG SET HoVaTen = ?, SoDienThoai = ?, Email = ?, GioiTinh = ?, DiaChi = ? WHERE MaCCCD = ?', [name, phone, email, gender, address, cccd], function (error) {
                if (error) return res.status(500).json({ error: 'Failed to update user', error: error.message });
                return res.status(200).json({ message: 'User information updated successfully' });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Internal server error' }); }
});

app.post('/chinhsuaks', upload.any(), async function (req, res) {
    let { TenKS, DiaChi, TinhThanh, SoTongDai, GiaPhong, Latitude, Longitude, MaKS, GioiThieu, DiemNoiBat, videos } = req.body;
    const giaPhongNumber = Number(GiaPhong);
    if (GiaPhong != null && (Number.isNaN(giaPhongNumber) || giaPhongNumber <= 0)) return res.status(400).json({ error: 'Giá phòng phải dương.' });

    try {
        con.query('SELECT * FROM KHACHSAN WHERE MaKS = ?', [MaKS], function (error, results) {
            if (error) return res.status(500).json({ error: 'Lỗi', error: error.message });
            if (results.length === 0) return res.status(404).json({ error: 'Khách sạn không tồn tại.' });

            let imageUrls = [];
            if (req.files && req.files.length > 0) { req.files.forEach(file => { imageUrls.push(`/uploads/${file.filename}`); }); }
            let hinhanh = imageUrls.length > 0 ? JSON.stringify(imageUrls) : (results[0].HinhAnh || null);

            const updateQuery = `UPDATE KHACHSAN SET TenKS=?, DiaChi=?, TinhThanh=?, SoTongDai=?, Latitude=?, Longitude=?, HinhAnh=?, GioiThieu=?, DiemNoiBat=?, Video=? WHERE MaKS=?`;
            con.query(updateQuery, [TenKS, DiaChi, TinhThanh, SoTongDai || null, Latitude || null, Longitude || null, hinhanh, GioiThieu || null, DiemNoiBat || null, videos || null, MaKS], function (error) {
                if (error) return res.status(500).json({ error: 'Cập nhật lỗi', error: error.message });
                if (GiaPhong == null) return res.status(200).json({ message: 'Cập nhật thành công' });

                con.query('SELECT MaPhong FROM PHONG WHERE MaKS = ? LIMIT 1', [MaKS], function (findError, findResults) {
                    if (findResults.length > 0) {
                        con.query('UPDATE PHONG SET GiaPhong = ? WHERE MaKS = ?', [giaPhongNumber, MaKS], function (roomError) {
                            return res.status(200).json({ message: 'Cập nhật thành công' });
                        });
                    } else {
                        con.query(`INSERT INTO PHONG (LoaiPhong, GiaPhong, TrangThai, TienNghi, MaKS, Hinhanh) VALUES (?, ?, ?, ?, ?, NULL)`, ['Standard', giaPhongNumber, 'Trống', 'Tiêu chuẩn', MaKS], function () {
                            return res.status(200).json({ message: 'Cập nhật thành công' });
                        });
                    }
                });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Lỗi' }); }
});

app.post('/save-booking', (req, res) => {
    const { maPhong, numberOfNights, numberOfPeople, checkinTime, checkoutTime, customerId } = req.body;
    if (!maPhong || !numberOfNights || !numberOfPeople || !checkinTime || !checkoutTime || !customerId) return res.status(400).json({ message: 'Thiếu thông tin' });
    con.query('INSERT INTO THUTUCDATPHONG (MaPhong, SoDem, SoNguoi, Ngaynhanphong, Ngaytraphong, UserID) VALUES (?, ?, ?, ?, ?, ?)', [maPhong, numberOfNights, numberOfPeople, checkinTime, checkoutTime, customerId], (error) => {
        if (error) return res.status(500).json({ message: 'Lỗi lưu', error: error.message });
        con.query('SELECT MaDatPhong FROM THUTUCDATPHONG WHERE MaPhong = ? ORDER BY MaDatPhong DESC LIMIT 1', [maPhong], (err, rows) => {
            if (rows.length > 0) res.status(201).json({ bookingId: rows[0].MaDatPhong });
            else res.status(404).json({ message: 'Lỗi lấy mã' });
        });
    });
});

app.post('/updateroom', async function (req, res) {
    let { LoaiPhong, GiaPhong, TrangThai, TienNghi, MaPhong, Hinhanh } = req.body;
    try {
        con.query('SELECT * FROM PHONG WHERE MaPhong = ?', [MaPhong], function (error, results) {
            if (results.length === 0) return res.status(404).json({ message: 'Phòng không tồn tại.' });
            let imageBuffer = Hinhanh ? Buffer.from(Hinhanh.split(",")[1], 'base64') : null;
            const updateQuery = `UPDATE PHONG SET LoaiPhong=?, GiaPhong=?, TrangThai=?, TienNghi=? ${Hinhanh ? ', Hinhanh=?' : ''} WHERE MaPhong=?`;
            const params = Hinhanh ? [LoaiPhong, GiaPhong, TrangThai, TienNghi, imageBuffer, MaPhong] : [LoaiPhong, GiaPhong, TrangThai, TienNghi, MaPhong];
            con.query(updateQuery, params, function (error) {
                if (error) return res.status(500).json({ message: 'Cập nhật lỗi', error: error.message });
                return res.status(200).json({ message: 'Cập nhật phòng thành công' });
            });
        });
    } catch (error) { return res.status(500).json({ error: 'Lỗi server' }); }
});

app.get('/viewroom/:maPhong', async function (req, res) {
    con.query('SELECT * FROM PHONG WHERE MaPhong = ?', [req.params.maPhong], function (error, results) {
        if (error) return res.status(500).json({ error: 'Lỗi' });
        if (results.length === 0) return res.status(404).json({ error: 'Phòng không tồn tại.' });
        return res.status(200).json({ message: 'Thành công', room: results[0] });
    });
});

app.delete('/xoaks/:maKS', async function (req, res) {
    con.query('DELETE FROM KHACHSAN WHERE MaKS = ?', [req.params.maKS], function (error) {
        if (error) return res.status(500).json({ error: 'Xóa thất bại' });
        return res.status(200).json({ message: 'Đã xóa' });
    });
});

app.delete('/deleteroom/:maPhong', async function (req, res) {
    con.query('DELETE FROM PHONG WHERE MaPhong = ?', [req.params.maPhong], function (error) {
        if (error) return res.status(500).json({ error: 'Xóa thất bại' });
        return res.status(200).json({ message: 'Đã xóa' });
    });
});

app.post('/save-payment', (req, res) => {
    const { customerId, maDatPhong, phuongThucThanhToan, ngayThanhToan } = req.body;
    con.query('INSERT INTO THANHTOAN (UserID, MaDatPhong, PhuongThucThanhToan, NgayThanhToan) VALUES (?, ?, ?, ?)', [customerId, maDatPhong, phuongThucThanhToan, ngayThanhToan], (error, results) => {
        if (error) return res.status(500).json({ error: 'Lỗi' });
        return res.status(201).json({ message: 'Lưu thành công', paymentId: results.insertId });
    });
});

app.post('/save-review', (req, res) => {
    const { customerId, maKS, rating, reviewText } = req.body;
    const ngayDanhGia = new Date().toISOString().slice(0, 10);
    con.query('INSERT INTO DANHGIA (UserID, MaKS, Ngaydanhgia, Mucdohailong, Phanhoivadexuat) VALUES (?, ?, ?, ?, ?)', [customerId, maKS, ngayDanhGia, rating, reviewText], (error) => {
        if (error) return res.status(500).json({ message: 'Lỗi' });
        res.status(201).json({ message: 'Lưu thành công!' });
    });
});

app.get('/api/reviews/all', (req, res) => {
    const sql = `SELECT d.UserID, d.MaKS, k.HoVaTen, d.Mucdohailong, d.Phanhoivadexuat, ks.TenKS FROM DANHGIA d JOIN KHACHHANG k ON d.UserID = k.UserID JOIN KHACHSAN ks ON d.MaKS = ks.MaKS ORDER BY d.MaKS DESC`;
    con.query(sql, (error, results) => {
        if (error) return res.status(500).json({ message: 'Lỗi' });
        res.status(200).json(results);
    });
});

app.get('/api/reviews/:maKS', (req, res) => {
    const sql = `SELECT d.UserID, d.MaKS, k.HoVaTen, d.Mucdohailong, d.Phanhoivadexuat FROM DANHGIA d JOIN KHACHHANG k ON d.UserID = k.UserID WHERE d.MaKS = ?`;
    con.query(sql, [req.params.maKS], (error, results) => {
        if (error) return res.status(500).json({ message: 'Lỗi' });
        res.status(200).json(results);
    });
});

app.get('/room-details', (req, res) => {
    con.query('SELECT LoaiPhong, GiaPhong, TienNghi, Hinhanh FROM PHONG WHERE maPhong = ?', [req.query.maPhong], (error, results) => {
        if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
        res.json(results[0]);
    });
});

app.get('/api/bookings', async (req, res) => {
    const query = `SELECT t.*, k.HoVaTen, p.LoaiPhong FROM THUTUCDATPHONG t JOIN KHACHHANG k ON t.UserID = k.UserID JOIN PHONG p ON t.MaPhong = p.MaPhong`;
    con.query(query, (error, results) => {
        if (error) return res.status(500).json({ message: 'Lỗi' });
        res.json(results);
    });
});

app.post('/api/assign-manager', (req, res) => res.status(201).json({ success: true, message: "Thành công!" }));
app.post('/api/cancel-booking', (req, res) => res.status(200).json({ success: true, message: "Thành công!" }));
app.get('/api/get-next-id', (req, res) => res.json({ nextId: "KS089", prefix: "KS" }));

// ==========================================
// THIẾT LẬP SOCKET.IO (CHAT & THÔNG BÁO)
// ==========================================
io.on('connection', (socket) => {
    console.log('⚡ Socket connected:', socket.id);

    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`👤 User/Admin joined room: ${userId}`);
    });

    socket.on('send_message', (data) => {
        io.to(data.roomId).emit('receive_message', data);
        io.to(data.receiverId).emit('new_notification', {
            type: 'CHAT',
            content: `Bạn có tin nhắn mới từ ${data.senderName}`
        });
    });

    socket.on('new_booking', (data) => {
        socket.broadcast.emit('admin_notification', {
            type: 'BOOKING',
            content: `Khách hàng ${data.customerName} vừa đặt phòng mới!`
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });
});

// --- KHỞI ĐỘNG SERVER TRÊN HTTP KÈM SOCKET ---
server.listen(port, function () {
    console.log(`
    ===================================================
    🚀 SERVER QUẢN LÝ KHÁCH SẠN ĐÃ KHỞI ĐỘNG
    🌐 URL: http://localhost:${port}
    🔥 Đã tích hợp JWT, Session Fix & Socket.io
    ===================================================
    `);
});