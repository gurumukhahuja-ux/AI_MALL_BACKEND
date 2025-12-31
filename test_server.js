import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(5000, () => {
    console.log('Dummy server running on 5000');
    process.exit(0);
});
