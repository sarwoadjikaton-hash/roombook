import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Room, FacilityType } from '../../types';
import { FacilityIcons, CapacityBadge } from '../../components/common/FacilityIcons';
import { Modal } from '../../components/common/Modal';
import {
  DoorOpen,
  Edit2,
  CheckCircle,
  Plus,
  Trash2,
  Layers,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';

export const RoomsManagementPage: React.FC = () => {
  const {
    rooms,
    createRoom,
    updateRoom,
    deleteRoom,
    allFacilities,
    addCustomFacility,
    deleteCustomFacility,
  } = useBooking();

  // State Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);

  // Form states untuk Tambah / Edit Ruangan
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [capacity, setCapacity] = useState(15);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [approverName, setApproverName] = useState('Administrator Pengelola');
  const [approverEmail, setApproverEmail] = useState('admin.mrbs@gmail.com');
  const [googleCalendarId, setGoogleCalendarId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSpecialAccent, setIsSpecialAccent] = useState(false);
  const [facilities, setFacilities] = useState<FacilityType[]>([]);

  // Form states untuk Tambah Fasilitas Kustom
  const [newFacilityName, setNewFacilityName] = useState('');
  const [facilityMessage, setFacilityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset form ruangan
  const resetRoomForm = () => {
    setName('');
    setSlug('');
    setCapacity(15);
    setLocation('');
    setDescription('');
    setRequiresApproval(true);
    setApproverName('Administrator Pengelola');
    setApproverEmail('admin.mrbs@gmail.com');
    setGoogleCalendarId('');
    setImageUrl('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80');
    setIsSpecialAccent(false);
    setFacilities(['ac', 'wifi', 'smart_tv']);
  };

  const openCreateModal = () => {
    resetRoomForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setSlug(room.slug);
    setCapacity(room.capacity);
    setLocation(room.location);
    setDescription(room.description);
    setRequiresApproval(room.requiresApproval);
    setApproverName(room.approverName || 'Administrator Pengelola');
    setApproverEmail(room.approverEmail || 'admin.mrbs@gmail.com');
    setGoogleCalendarId(room.googleCalendarId);
    setImageUrl(room.imageUrl || '');
    setIsSpecialAccent(room.isSpecialAccent || false);
    setFacilities(room.facilities || []);
  };

  const toggleFacility = (facId: string) => {
    if (facilities.includes(facId)) {
      setFacilities(facilities.filter((f) => f !== facId));
    } else {
      setFacilities([...facilities, facId]);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    createRoom({
      name,
      slug: generatedSlug,
      capacity,
      location,
      description,
      requiresApproval,
      approverName: requiresApproval ? approverName : undefined,
      approverEmail: requiresApproval ? approverEmail : undefined,
      googleCalendarId: googleCalendarId.trim() || `c_${generatedSlug}@group.calendar.google.com`,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      isSpecialAccent,
      facilities,
    });

    setIsCreateModalOpen(false);
    resetRoomForm();
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    updateRoom(editingRoom.id, {
      name,
      slug: slug || editingRoom.slug,
      capacity,
      location,
      description,
      requiresApproval,
      approverName: requiresApproval ? approverName : undefined,
      approverEmail: requiresApproval ? approverEmail : undefined,
      googleCalendarId,
      imageUrl,
      isSpecialAccent,
      facilities,
    });

    setEditingRoom(null);
  };

  const handleDeleteRoom = () => {
    if (!deletingRoom) return;
    deleteRoom(deletingRoom.id);
    setDeletingRoom(null);
  };

  const handleAddFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacilityName.trim()) return;

    const res = addCustomFacility(newFacilityName);
    if (res.success) {
      setFacilityMessage({ type: 'success', text: res.message });
      setNewFacilityName('');
      setTimeout(() => setFacilityMessage(null), 3000);
    } else {
      setFacilityMessage({ type: 'error', text: res.message });
    }
  };

  const handleDeleteFacility = (id: string) => {
    const res = deleteCustomFacility(id);
    if (res.success) {
      setFacilityMessage({ type: 'success', text: res.message });
      setTimeout(() => setFacilityMessage(null), 3000);
    } else {
      setFacilityMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-card border border-border p-5 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <DoorOpen size={22} className="text-primary" />
            <h1 className="text-xl font-bold text-text-primary">Kelola Ruangan & Fasilitas</h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Tambah ruangan, atur kapasitas, kelola fasilitas, dan perbarui data ruang rapat.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsFacilityModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary font-bold text-sm rounded-btn border border-border transition-all"
          >
            <span>Kelola Fasilitas</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold text-sm rounded-btn shadow-btn transition-all"
          >
            <Plus size={16} />
            <span>Tambah Ruangan</span>
          </button>
        </div>
      </div>

      {/* Grid Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`bg-surface rounded-card border shadow-card overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${room.isSpecialAccent ? 'border-t-4 border-t-accent border-border' : 'border-border'
              }`}
          >
            <div>
              {/* Image Preview */}
              <div className="h-44 w-full overflow-hidden relative bg-stone-100">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                    <ImageIcon size={32} />
                    <span className="text-[11px] mt-1 font-medium">Foto Belum Diatur</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-4">
                  <div>
                    <h3 className="text-base font-bold text-white drop-shadow">{room.name}</h3>
                    <span className="text-[11px] text-stone-300 font-mono">/{room.slug}</span>
                  </div>
                  <CapacityBadge capacity={room.capacity} size="sm" />
                </div>
              </div>

              <div className="p-4 space-y-3 text-sm">
                <div>
                  <span className="text-[11px] font-semibold text-text-secondary block">Lokasi / Lantai:</span>
                  <span className="font-medium text-text-primary">{room.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary block">Kebijakan Approval:</span>
                    {room.requiresApproval ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Wajib Approval
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Auto-Approve
                      </span>
                    )}
                  </div>

                  {room.isSpecialAccent && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Ruang Utama
                    </span>
                  )}
                </div>

                {room.requiresApproval && room.approverName && (
                  <div>
                    <span className="text-[11px] font-semibold text-text-secondary block">PIC Approver:</span>
                    <span className="font-medium text-text-primary">{room.approverName}</span>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-semibold text-text-secondary block mb-1">Fasilitas Ruangan:</span>
                  <FacilityIcons facilities={room.facilities || []} showLabels={true} size={12} />
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-text-secondary block">Google Calendar ID:</span>
                  <span className="font-mono text-[11px] text-stone-500 truncate block">
                    {room.googleCalendarId}
                  </span>
                </div>

                <p className="text-stone-600 bg-stone-50 p-2.5 rounded-btn border border-border text-[11px] leading-relaxed line-clamp-3">
                  {room.description}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-3 bg-stone-50 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setDeletingRoom(room)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-btn transition-colors"
                title="Hapus Ruangan"
              >
                <Trash2 size={14} />
                <span>Hapus</span>
              </button>

              <button
                onClick={() => openEditModal(room)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-sm font-bold rounded-btn transition-colors shadow-sm"
              >
                <Edit2 size={13} />
                <span>Edit Konfigurasi</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Ruangan Baru */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Tambah Ruangan Rapat Baru"
          subtitle="Masukkan data lengkap ruangan beserta fasilitas dan kalendernya"
          maxWidth="xl"
        >
          <form onSubmit={handleCreateRoom} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-primary mb-1">Nama Ruangan *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ruang Rapat Utama B"
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-text-primary mb-1">Slug URL (Opsional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Contoh: ruang-rapat-utama-b"
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-primary mb-1">Kapasitas Maksimal (Orang) *</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-text-primary mb-1">Lokasi / Gedung / Lantai *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Lantai 2, Gedung A (Sayap Timur)"
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-text-primary mb-1">URL Foto Ruangan (Unsplash/Direct Image/Path Lokal)</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... atau /rooms/ruang-transit-1.jpg"
                className="w-full px-3 py-2 border border-border rounded-btn text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            {/* Checklist Fasilitas Tersedia */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-text-primary">Pilih Fasilitas Ruangan</label>
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(true)}
                  className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  <Plus size={12} /> Tambah Fasilitas Baru
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-card bg-stone-50/50">
                {allFacilities.map((fac) => {
                  const isChecked = facilities.includes(fac.id);
                  return (
                    <button
                      type="button"
                      key={fac.id}
                      onClick={() => toggleFacility(fac.id)}
                      className={`p-2 rounded-btn border text-left flex items-center justify-between transition-all ${isChecked
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                          : 'bg-white border-border text-text-secondary hover:border-stone-300'
                        }`}
                    >
                      <span className="truncate text-sm">{fac.name}</span>
                      {isChecked && <CheckCircle size={14} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kebijakan Approval & PIC */}
            <div className="p-3 bg-stone-50 border border-border rounded-card space-y-3">
              <label className="flex items-center gap-2 font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Memerlukan Persetujuan (Approval) PIC Sebelum Dikonfirmasi</span>
              </label>

              {requiresApproval && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Nama PIC Approver</label>
                    <input
                      type="text"
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      placeholder="Contoh: Administrator Pengelola"
                      className="w-full px-3 py-1.5 border border-border rounded-btn text-sm bg-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Email PIC Approver</label>
                    <input
                      type="email"
                      value={approverEmail}
                      onChange={(e) => setApproverEmail(e.target.value)}
                      placeholder="admin.mrbs@gmail.com"
                      className="w-full px-3 py-1.5 border border-border rounded-btn text-sm bg-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Google Calendar ID */}
            <div>
              <label className="block font-bold text-text-primary mb-1">Google Calendar Resource ID</label>
              <input
                type="text"
                value={googleCalendarId}
                onChange={(e) => setGoogleCalendarId(e.target.value)}
                placeholder="c_resource_id@group.calendar.google.com"
                className="w-full px-3 py-2 border border-border rounded-btn text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block font-bold text-text-primary mb-1">Deskripsi Ruangan</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Penjelasan peruntukan dan karakteristik ruang rapat..."
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {/* Accent Room */}
            <label className="flex items-center gap-2 font-medium text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={isSpecialAccent}
                onChange={(e) => setIsSpecialAccent(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Jadikan Ruangan Utama / Prioritas Eksekutif</span>
            </label>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary rounded-btn font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-light text-white rounded-btn font-bold shadow-btn"
              >
                Simpan & Tambahkan Ruangan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edit Ruangan */}
      {editingRoom && (
        <Modal
          isOpen={!!editingRoom}
          onClose={() => setEditingRoom(null)}
          title={`Edit Ruangan — ${editingRoom.name}`}
          subtitle="Perbarui data kapasitas, fasilitas, foto, dan kebijakan persetujuan"
          maxWidth="xl"
        >
          <form onSubmit={handleUpdateRoom} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-primary mb-1">Nama Ruangan *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-text-primary mb-1">Slug URL</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm font-mono focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-primary mb-1">Kapasitas Maksimal (Orang) *</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-text-primary mb-1">Lokasi / Gedung / Lantai *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-text-primary mb-1">URL Foto Ruangan</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... atau /rooms/ruang-transit-1.jpg"
                className="w-full px-3 py-2 border border-border rounded-btn text-sm font-mono focus:outline-none focus:border-primary"
              />
            </div>

            {/* Checklist Fasilitas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-text-primary">Fasilitas Ruangan</label>
                <button
                  type="button"
                  onClick={() => setIsFacilityModalOpen(true)}
                  className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1"
                >
                  <Plus size={12} /> Tambah Fasilitas Baru
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-border rounded-card bg-stone-50/50">
                {allFacilities.map((fac) => {
                  const isChecked = facilities.includes(fac.id);
                  return (
                    <button
                      type="button"
                      key={fac.id}
                      onClick={() => toggleFacility(fac.id)}
                      className={`p-2 rounded-btn border text-left flex items-center justify-between transition-all ${isChecked
                          ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                          : 'bg-white border-border text-text-secondary hover:border-stone-300'
                        }`}
                    >
                      <span className="truncate text-sm">{fac.name}</span>
                      {isChecked && <CheckCircle size={14} className="text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kebijakan Approval */}
            <div className="p-3 bg-stone-50 border border-border rounded-card space-y-3">
              <label className="flex items-center gap-2 font-bold text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span>Memerlukan Persetujuan (Approval) PIC Sebelum Dikonfirmasi</span>
              </label>

              {requiresApproval && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Nama PIC Approver</label>
                    <input
                      type="text"
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-btn text-sm bg-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">Email PIC Approver</label>
                    <input
                      type="email"
                      value={approverEmail}
                      onChange={(e) => setApproverEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-btn text-sm bg-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Google Calendar ID */}
            <div>
              <label className="block font-bold text-text-primary mb-1">Google Calendar Resource ID</label>
              <input
                type="text"
                value={googleCalendarId}
                onChange={(e) => setGoogleCalendarId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm font-mono focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block font-bold text-text-primary mb-1">Deskripsi Ruangan</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <label className="flex items-center gap-2 font-medium text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={isSpecialAccent}
                onChange={(e) => setIsSpecialAccent(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Jadikan Ruangan Utama / Prioritas Eksekutif</span>
            </label>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary rounded-btn font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary hover:bg-primary-light text-white rounded-btn font-bold shadow-btn"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Kelola & Tambah Fasilitas */}
      {isFacilityModalOpen && (
        <Modal
          isOpen={isFacilityModalOpen}
          onClose={() => setIsFacilityModalOpen(false)}
          title="Kelola & Tambah Fasilitas Ruangan"
          subtitle="Daftar seluruh fasilitas yang dapat dipilih untuk setiap ruang rapat"
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            {facilityMessage && (
              <div
                className={`p-3 rounded-btn text-sm font-semibold ${facilityMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
              >
                {facilityMessage.text}
              </div>
            )}

            {/* Form Tambah Fasilitas Baru */}
            <form onSubmit={handleAddFacility} className="p-3 bg-stone-50 border border-border rounded-card space-y-2.5">
              <label className="block font-bold text-text-primary">Tambah Jenis Fasilitas Baru</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFacilityName}
                  onChange={(e) => setNewFacilityName(e.target.value)}
                  placeholder="Contoh: Videotron 4K, Mic Wireless..."
                  className="flex-1 px-3 py-2 bg-white border border-border rounded-btn text-sm focus:outline-none focus:border-primary"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-btn flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </div>
            </form>

            {/* Daftar Fasilitas */}
            <div>
              <span className="block font-bold text-text-primary mb-2">Daftar Fasilitas Aktif ({allFacilities.length})</span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {allFacilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-border rounded-btn hover:border-stone-300 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-primary" />
                      <span className="font-semibold text-text-primary">{fac.name}</span>
                      {fac.isDefault && (
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-medium">
                          Bawaan Sistem
                        </span>
                      )}
                    </div>

                    {!fac.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFacility(fac.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                        title="Hapus Fasilitas Kustom"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsFacilityModalOpen(false)}
                className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-btn"
              >
                Selesai
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Konfirmasi Hapus Ruangan */}
      {deletingRoom && (
        <Modal
          isOpen={!!deletingRoom}
          onClose={() => setDeletingRoom(null)}
          title="Konfirmasi Hapus Ruangan"
          subtitle="Tindakan ini akan menghapus master data ruangan dari sistem"
          maxWidth="sm"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-card text-rose-800">
              <AlertTriangle size={20} className="shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Apakah Anda yakin ingin menghapus ruangan ini?</p>
                <p className="mt-1 text-rose-700">
                  Ruangan <strong>"{deletingRoom.name}"</strong> beserta data konfigurasinya akan dihapus dari sistem.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-primary font-semibold rounded-btn"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteRoom}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-btn shadow-sm"
              >
                Ya, Hapus Ruangan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
