const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const creds = require('./service-account.json'); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SHEET_ID = '1_2OIa0tBXlp-WQ7hBp9SXxgxGVnbED14YFmy-21eSzw';

app.post('/submit-order', async (req, res) => {
    // --- LOG KIỂM TRA DỮ LIỆU ĐẾN ---
    console.log("-----------------------------------");
    console.log("📩 NHẬN ĐƯỢC REQUEST MỚI!");
    console.log("Body nhận từ HTML:", JSON.stringify(req.body, null, 2));
    // -------------------------------

    try {
        const { full_name, phone_number, address, textarea_input_1, radio_input_1, sizes } = req.body;

        // Kiểm tra xem có dữ liệu không, nếu rỗng thì dừng lại luôn
        if (!full_name && !phone_number) {
            console.log("⚠️ Cảnh báo: Nhận dữ liệu rỗng từ Form.");
            return res.status(400).json({ error: 'Dữ liệu trống' });
        }

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0];

        // Ghi vào sheet
        await sheet.addRow({
            'Thời gian': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Họ tên': full_name || '',
            'SĐT': phone_number || '',
            'Địa chỉ': address || '',
            'Ghi chú': textarea_input_1 || '',
            'Combo': radio_input_1 || '',
            'Size': sizes || ''
        });

        console.log(`✅ Đã ghi đơn hàng của [${full_name}] vào Sheet thành công.`);
        console.log("-----------------------------------");
        res.status(200).json({ message: 'Đặt hàng thành công!' });

    } catch (error) {
        console.error('❌ LỖI XỬ LÝ TRÊN SERVER:', error.message);
        res.status(500).json({ error: 'Lỗi server khi ghi vào Sheet' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại port ${PORT}`);
    console.log(`📂 Đã nạp file xác thực: ${creds.client_email}`);
});
