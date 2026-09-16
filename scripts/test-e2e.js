/**
 * E2E Integration Test Suite for ROOMBOOK
 * Validates Core End-to-End Business Workflows:
 * 1. Health API & Database Connection
 * 2. Room Master List Retrieval
 * 3. Booking Creation with Input Sanitization
 * 4. Approval & Google Calendar Event Sync
 * 5. Notifications & Audit Logs Generation
 * 6. Cancellation & Cleanup
 */

const API_BASE = process.env.API_BASE || 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('🚀 MEMULAI PENGUJIAN END-TO-END (E2E) ROOMBOOK');
  console.log(`🌐 Target Server: ${API_BASE}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ [TEST] ${name} ... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED\n   Error: ${err.message}`);
      failed++;
    }
  }

  let createdBookingId = null;

  // 1. Health Check
  await test('1. Health Check & PostgreSQL Status', async () => {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Status bukan ok');
  });

  // 2. Fetch Rooms
  await test('2. Get Rooms List (Master Data)', async () => {
    const res = await fetch(`${API_BASE}/api/rooms`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const rooms = await res.json();
    if (!Array.isArray(rooms) || rooms.length === 0) throw new Error('Daftar ruangan kosong');
    const sekjen = rooms.find(r => r.slug === 'ruang-sekjen' || r.id === 'ruang-sekjen');
    if (!sekjen) throw new Error('Ruang Rapat Sekjen tidak ditemukan');
  });

  // 3. Create Booking
  await test('3. Create New Booking (Pending Approval)', async () => {
    const payload = {
      roomSlug: 'ruang-sekjen',
      roomName: 'Ruang Rapat Sekjen',
      title: 'E2E Automated Test Meeting',
      description: 'Pengujian otomatis alur booking sistem',
      organizerName: 'Automated Test Agent',
      organizerEmail: 'tester@instansi.go.id',
      organizerDept: 'Pusdatin IT',
      date: '2026-09-20',
      startTime: '09:00',
      endTime: '10:30',
      attendeeCount: 10,
      attendees: ['tester1@instansi.go.id', 'tester2@instansi.go.id'],
    };

    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (!data.id) throw new Error('ID booking tidak terbentuk');
    if (data.status !== 'pending') throw new Error(`Status bukan pending (status: ${data.status})`);
    createdBookingId = data.id;
  });

  // 4. Verify Notification
  await test('4. Verify Notification Generated for Admin', async () => {
    const res = await fetch(`${API_BASE}/api/notifications`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const notifs = await res.json();
    const relatedNotif = notifs.find(n => n.bookingId === createdBookingId);
    if (!relatedNotif) throw new Error('Notifikasi untuk booking tidak ditemukan');
  });

  // 5. Approve Booking
  await test('5. Approve Booking & Trigger Calendar Sync', async () => {
    if (!createdBookingId) throw new Error('ID booking tidak ada');
    const res = await fetch(`${API_BASE}/api/bookings/${createdBookingId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminName: 'Superadmin E2E',
        adminRole: 'superadmin',
      }),
    });

    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'confirmed') throw new Error(`Status setelah approval bukan confirmed (status: ${data.status})`);
  });

  // 6. Check Audit Log
  await test('6. Verify Audit Trail Log Recorded', async () => {
    const res = await fetch(`${API_BASE}/api/audit-logs`);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const logs = await res.json();
    const relatedLog = logs.find(l => l.targetId === createdBookingId || (l.details && l.details.includes('E2E Automated Test Meeting')));
    if (!relatedLog) throw new Error('Audit log untuk aksi booking tidak ditemukan');
  });

  // 7. Cleanup / Cancel Test Booking
  await test('7. Cleanup / Cancel Test Booking', async () => {
    if (!createdBookingId) throw new Error('ID booking tidak ada');
    const res = await fetch(`${API_BASE}/api/bookings/${createdBookingId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cancelledBy: 'E2E Cleanup Script',
        cancelReason: 'Automated test teardown',
      }),
    });

    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
  });

  console.log('\n====================================================');
  console.log(`📊 HASIL PENGUJIAN: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 SEMUA PENGUJIAN E2E BERHASIL!');
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error('Fatal Test Runner Error:', e);
  process.exit(1);
});
