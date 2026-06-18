import fs from 'fs';
try {
  fs.rmSync('src/app/api/admin/bookings/[bookingId]', { recursive: true, force: true });
  console.log('Deleted');
} catch (e) {
  console.error(e);
}
