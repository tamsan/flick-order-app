const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Supabase設定
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://erfaxmxrznehwowehnmc.supabase.co',
    process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZmF4bXhyem5laHdvd2Vobm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTc2OTEsImV4cCI6MjA2NzA5MzY5MX0.V9jPJzC8rp89aBCo0grPJBECnPlC0oniOUXiryvwbdQ'
);

// ミドルウェア
app.use(express.static('.'));
app.use(express.json());

// CORS設定（開発用）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

// 注文保存API
app.post('/api/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert(req.body);
        
        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 注文取得API
app.get('/api/orders', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🍺 フリックオーダーシステム起動中... ポート: ${PORT}`);
    console.log(`📱 ブラウザで開く: http://localhost:${PORT}`);
});
