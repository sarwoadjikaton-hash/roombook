import React, { useState, useEffect } from 'react';
import { AppView, Room, Booking, ActivityLog } from './types';
import { 
  loadSavedRooms, 
  saveRooms, 
  loadSavedBookings, 
  saveBookings, 
  loadSavedLogs, 
  saveLogs 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { DirectoryView } from './components/DirectoryView';
import { BookingDrawer } from './components/BookingDrawer';
import { MyBookingView } from './components/MyBookingView';
import { VoucherCard } from './components/VoucherCard';
import { EmailPreviewView } from './components/EmailPreviewView';
import { KioskView } from './components/KioskView';
import { AdminView } from './components/AdminView';
import { LaravelStackView } from './components/LaravelStackView';
import { CheckCircle2, ShieldCheck, X } from 'lucide-react';

export default function App() {
  const [rooms, setRooms] = useState<Room[]>(loadSavedRooms);
  const [bookings, setBookings] = useState<Booking[]>(loadSavedBookings);
  const [logs, setLogs] = useState<ActivityLog[]>(loadSavedLogs);
  const [currentView, setCurrentView] = useState<AppView>('directory');
  
  // Active booking for voucher / email view
  const [activeBooking, setActiveBooking] = useState<Booking>(() => {
    const initial = loadSavedBookings();
    return initial[0];
  });

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerRoomId, setDrawerRoomId] = useState<string>('sekjen');
  const [drawerStartTime, setDrawerStartTime] = useState<string>('11:00');
  const [drawerEndTime, setDrawerEndTime] = useState<string>('12:30');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleOpenBookingDrawer = (roomId: string, start = '11:00', end = '12:30') => {
    setDrawerRoomId(roomId);
    setDrawerStartTime(start);
    setDrawerEndTime(end);
    setIsDrawerOpen(true);
  };

  const handleBookingCreated = (newBooking: Booking, log: ActivityLog) => {
    const updatedBookings = [newBooking, ...bookings];
    const updatedLogs = [log, ...logs];
    setBookings(updatedBookings);
    setLogs(updatedLogs);
    setActiveBooking(newBooking);
    showToast(`Reservasi ${newBooking.bookingCode} berhasil dibukukan! Voucher resmi telah terbit.`);
    setCurrentView('voucher');
  };

  const handleBookingUpdated = (updatedBooking: Booking, log: ActivityLog) => {
    const updated = bookings.map((b) => (b.id === updatedBooking.id ? updatedBooking : b));
    setBookings(updated);
    setLogs([log, ...logs]);
    setActiveBooking(updatedBooking);
    showToast(`Jadwal booking ${updatedBooking.bookingCode} berhasil diperbarui.`);
  };

  const handleBookingCancelled = (bookingId: string, log: ActivityLog) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    );
    setBookings(updated);
    setLogs([log, ...logs]);
    showToast(`Reservasi telah dibatalkan. Bilik telah dikosongkan pada jadwal Google Calendar.`);
  };

  const handleUpdateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    showToast('Data konfigurasi bilik rapat berhasil diperbarui.');
  };

  const handleViewVoucher = (booking: Booking) => {
    setActiveBooking(booking);
    setCurrentView('voucher');
  };

  const handleScanBookingClick = (roomId: string) => {
    handleOpenBookingDrawer(roomId, '11:00', '12:30');
  };

  const activeRoom = rooms.find((r) => r.id === activeBooking?.roomId) || rooms[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1ECDF] text-[#16191C]">
      {/* Universal Concierge Navigation Bar */}
      {currentView !== 'kiosk' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          bookingCount={bookings.filter((b) => b.status !== 'cancelled').length}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 w-full">
        {currentView === 'directory' && (
          <DirectoryView
            rooms={rooms}
            bookings={bookings}
            onOpenBookingDrawer={handleOpenBookingDrawer}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'my-booking' && (
          <MyBookingView
            bookings={bookings}
            rooms={rooms}
            onUpdateBooking={handleBookingUpdated}
            onCancelBooking={handleBookingCancelled}
            onViewVoucher={handleViewVoucher}
            onNavigateNewBooking={() => setCurrentView('directory')}
          />
        )}

        {currentView === 'voucher' && activeBooking && (
          <VoucherCard
            booking={activeBooking}
            room={activeRoom}
            onBackToDirectory={() => setCurrentView('directory')}
            onViewEmailPreview={() => setCurrentView('email-preview')}
          />
        )}

        {currentView === 'email-preview' && activeBooking && (
          <EmailPreviewView
            booking={activeBooking}
            room={activeRoom}
            onManageBooking={(booking) => {
              setActiveBooking(booking);
              setCurrentView('my-booking');
            }}
            onViewVoucher={handleViewVoucher}
          />
        )}

        {currentView === 'kiosk' && (
          <div className="relative">
            {/* Quick exit kiosk floating pill */}
            <div className="fixed top-3 right-3 z-50">
              <button
                onClick={() => setCurrentView('directory')}
                className="bg-[#F1ECDF] text-[#16191C] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:bg-[#E4DBC8] transition-all flex items-center gap-1.5"
              >
                <span>← Keluar Mode Kiosk</span>
              </button>
            </div>
            <KioskView
              rooms={rooms}
              bookings={bookings}
              onScanBookingClick={handleScanBookingClick}
              onUpdateBooking={handleBookingUpdated}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <AdminView
            rooms={rooms}
            bookings={bookings}
            logs={logs}
            onUpdateRooms={handleUpdateRooms}
            onUpdateBooking={handleBookingUpdated}
            onCancelBooking={handleBookingCancelled}
            onCreateBooking={(booking, log) => {
              setBookings([booking, ...bookings]);
              setLogs([log, ...logs]);
              showToast(`Booking manual ${booking.bookingCode} berhasil dibukukan.`);
            }}
          />
        )}

        {currentView === 'stack-code' && (
          <LaravelStackView />
        )}
      </main>

      {/* Slide-over Booking Drawer */}
      <BookingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        rooms={rooms}
        selectedRoomId={drawerRoomId}
        defaultStartTime={drawerStartTime}
        defaultEndTime={drawerEndTime}
        bookings={bookings}
        onBookingCreated={handleBookingCreated}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16191C] text-[#F1ECDF] px-5 py-3.5 rounded shadow-2xl border-l-4 border-[#A9822D] flex items-center justify-between gap-4 max-w-md animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#A9822D] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#8A857B] hover:text-[#F1ECDF] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Classical Concierge Footer */}
      {currentView !== 'kiosk' && (
        <footer className="w-full bg-[#F1ECDF] border-t border-[#55524A]/15 py-10 mt-12 text-xs text-[#55524A]">
          <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-serif-title text-base text-[#16191C] font-medium">
                The Executive Registry • Concierge Ledger
              </span>
              <p className="text-[#55524A] leading-relaxed">
                Boutique Workspace Ledger • Menara Sudirman Lantai 14 • Layanan Concierge Extension #104
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#26392E]"></span>
                <span>Tersinkronisasi dengan Google Calendar API</span>
              </div>
              <span className="text-[#55524A]/30">|</span>
              <button
                onClick={() => setCurrentView('stack-code')}
                className="hover:text-[#16191C] underline decoration-[#A9822D] transition-colors"
              >
                Arsitektur Laravel + Vue 3 + Docker
              </button>
              <span className="text-[#55524A]/30">|</span>
              <span>© 2026 The Concierge Ledger. All Rights Reserved.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

