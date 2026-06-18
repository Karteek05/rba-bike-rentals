const fs = require('fs');
fs.rmSync('src/app/api/admin/bookings/[bookingId]', { recursive: true, force: true });
console.log('Deleted');
