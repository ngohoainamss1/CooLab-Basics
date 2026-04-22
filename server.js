const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lấy từ Environment Variables trên Render để bảo mật
const SHEET_ID = process.env.SHEET_ID; 
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const PRIVATE_KEY = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

app.post('/submit-order', async (req, res) => {
    try {
        const { full_name, phone_number, address, textarea_input_1, radio_input_1, sizes } = req.body;

        const doc = new GoogleSpreadsheet(SHEET_ID);
        
        await doc.useServiceAccountAuth({
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        });

        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0]; // Lấy sheet đầu tiên

        // Thêm dòng mới vào Sheet
        await sheet.addRow({
            'Thời gian': new Date().toLocaleString('vi-VN'),
            'Họ tên': full_name,
            'SĐT': phone_number,
            'Địa chỉ': address,
            'Ghi chú': textarea_input_1,
            'Combo': radio_input_1,
            'Size': sizes
        });

        res.status(200).json({ message: 'Đặt hàng thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại port ${PORT}`));
