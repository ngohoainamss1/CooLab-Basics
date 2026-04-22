const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('./service-account.json'); // Sử dụng file JSON đã test thành công

const app = express();

// Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lấy SHEET_ID từ Env cho bảo mật (hoặc dán trực tiếp ID vào đây nếu lười cấu hình Render)
const SHEET_ID = '1_2OIa0tBXlp-WQ7hBp9SXxgxGVnbED14YFmy-21eSzw';

app.post('/submit-order', async (req, res) => {
    try {
        const { full_name, phone_number, address, textarea_input_1, radio_input_1, sizes } = req.body;

        // Cấu hình xác thực bằng JWT từ file JSON
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0]; // Lấy sheet đầu tiên

        // Thêm dòng mới vào Sheet
        // Lưu ý: Tên các cột dưới đây phải khớp 100% với hàng 1 trong file Excel của bạn
        await sheet.addRow({
            'Thời gian': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Họ tên': full_name || '',
            'SĐT': phone_number || '',
            'Địa chỉ': address || '',
            'Ghi chú': textarea_input_1 || '',
            'Combo': radio_input_1 || '',
            'Size': sizes || ''
        });

        console.log(`[${new Date().toLocaleTimeString()}] Đơn hàng mới từ: ${full_name}`);
        res.status(200).json({ message: 'Đặt hàng thành công!' });

    } catch (error) {
        console.error('Lỗi Server:', error.message);
        res.status(500).json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------`);
    console.log(`🚀 Server đang chạy tại port ${PORT}`);
    console.log(`✅ Đã nhận diện file service-account.json`);
    console.log(`-----------------------------------`);
});
