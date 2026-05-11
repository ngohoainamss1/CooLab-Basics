const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- PHỤC VỤ GIAO DIỆN ---
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- XỬ LÝ ĐƠN HÀNG ---
const SHEET_ID = '1_2OIa0tBXlp-WQ7hBp9SXxgxGVnbED14YFmy-21eSzw';

app.post('/submit-order', async (req, res) => {
    console.log("-----------------------------------");
    console.log("📩 NHẬN ĐƠN HÀNG MỚI:", req.body.full_name);

    try {
        const { full_name, phone_number, address, textarea_input_1, radio_input_1, sizes } = req.body;

        // Lấy thông tin từ Biến môi trường (Environment Variables)
        const clientEmail = process.env.G_EMAIL;
        const privateKey = process.env.G_KEY;

        if (!clientEmail || !privateKey) {
            throw new Error("Chưa cấu hình G_EMAIL hoặc G_KEY trên Render Settings");
        }

        const serviceAccountAuth = new JWT({
            email: clientEmail,
            // Xử lý cả trường hợp key có dấu xuống dòng thật hoặc ký tự \n
            key: privateKey.replace(/\\n/g, '\n'),
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

        console.log(`✅ Ghi thành công đơn hàng: ${full_name}`);
        res.status(200).json({ message: 'Success' });

    } catch (error) {
        console.error('❌ Lỗi tại Server:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy an toàn với Biến môi trường tại Port ${PORT}`);
});
