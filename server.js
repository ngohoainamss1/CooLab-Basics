const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('./service-account.json');

const app = express();

// Cấu hình Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- PHẦN 1: PHỤC VỤ FILE GIAO DIỆN ---
// Khi ai đó truy cập vào link Render, server sẽ gửi file index.html ngay
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Phục vụ các file css, img nếu bạn để cùng thư mục
app.use(express.static(__dirname));

// --- PHẦN 2: XỬ LÝ ĐƠN HÀNG ---
const SHEET_ID = '1_2OIa0tBXlp-WQ7hBp9SXxgxGVnbED14YFmy-21eSzw';

app.post('/submit-order', async (req, res) => {
    console.log("-----------------------------------");
    console.log("📩 NHẬN ĐƠN HÀNG MỚI:", JSON.stringify(req.body, null, 2));

    try {
        const { full_name, phone_number, address, textarea_input_1, radio_input_1, sizes } = req.body;

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        await sheet.addRow({
            'Thời gian': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Họ tên': full_name || '',
            'SĐT': phone_number || '',
            'Địa chỉ': address || '',
            'Ghi chú': textarea_input_1 || '',
            'Combo': radio_input_1 || '',
            'Size': sizes || ''
        });

        console.log(`✅ Ghi thành công đơn hàng của: ${full_name}`);
        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('❌ Lỗi tại Server:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Hệ thống Online tại Port ${PORT}`);
    console.log(`🔗 Link của bạn: https://coolab-basics.onrender.com`);
});
