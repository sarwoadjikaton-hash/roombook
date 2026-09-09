import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Layers, 
  Database, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FolderTree, 
  CheckCircle2, 
  ExternalLink,
  Shield,
  Box,
  Server
} from 'lucide-react';

export const LaravelStackView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('docker-compose');
  const [copied, setCopied] = useState<boolean>(false);

  const fileContents: Record<string, { title: string; lang: string; code: string; desc: string }> = {
    'docker-compose': {
      title: 'docker-compose.yml',
      lang: 'yaml',
      desc: 'Orkestrasi kontainer lengkap: Nginx, PHP 8.3 FPM, PostgreSQL 16, Redis 7, Queue Worker & Vite.',
      code: `version: '3.8'

services:
  # Laravel PHP-FPM Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: concierge_laravel_app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
    networks:
      - concierge_network
    environment:
      - APP_ENV=local
      - APP_DEBUG=true
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=concierge_db
      - DB_USERNAME=concierge_user
      - DB_PASSWORD=concierge_secret
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - QUEUE_CONNECTION=redis
    depends_on:
      - postgres
      - redis

  # Nginx Web Server
  webserver:
    image: nginx:alpine
    container_name: concierge_nginx
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - ./:/var/www
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
    networks:
      - concierge_network
    depends_on:
      - app

  # PostgreSQL 16 Database
  postgres:
    image: postgres:16-alpine
    container_name: concierge_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: concierge_db
      POSTGRES_USER: concierge_user
      POSTGRES_PASSWORD: concierge_secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - concierge_network

  # Redis 7 In-Memory Cache & Job Queue
  redis:
    image: redis:7-alpine
    container_name: concierge_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - concierge_network

  # Background Queue Worker for Google Calendar Sync
  queue_worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: concierge_queue_worker
    restart: unless-stopped
    working_dir: /var/www
    command: php artisan queue:work redis --sleep=3 --tries=3
    volumes:
      - ./:/var/www
    networks:
      - concierge_network
    depends_on:
      - app
      - redis

networks:
  concierge_network:
    driver: bridge

volumes:
  pgdata:
  redisdata:`,
    },

    'dockerfile': {
      title: 'Dockerfile',
      lang: 'dockerfile',
      desc: 'Container build multi-stage untuk PHP 8.3 dengan ekstensi PostgreSQL, Redis, BCMath, dan Composer.',
      code: `FROM php:8.3-fpm-alpine

# Install system dependencies & PostgreSQL dev libraries
RUN apk add --no-cache \\
    git \\
    curl \\
    libpng-dev \\
    oniguruma-dev \\
    libxml2-dev \\
    zip \\
    unzip \\
    postgresql-dev \\
    linux-headers \\
    $PHPIZE_DEPS

# Install PHP extensions for PostgreSQL, Redis, and queues
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd \\
    && pecl install redis \\
    && docker-php-ext-enable redis

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Expose port 9000 for php-fpm
EXPOSE 9000
CMD ["php-fpm"]`,
    },

    'composer': {
      title: 'composer.json',
      lang: 'json',
      desc: 'Paket dependensi Laravel 11, Inertia.js, Spatie Laravel Permission, dan Google API Client.',
      code: `{
  "name": "concierge/meeting-room-booking",
  "type": "project",
  "description": "Aplikasi Booking Ruang Rapat (Concierge Ledger) dengan Laravel + Inertia + Vue 3 + Spatie",
  "require": {
    "php": "^8.2",
    "guzzlehttp/guzzle": "^7.8",
    "inertiajs/inertia-laravel": "^1.3",
    "laravel/framework": "^11.0",
    "laravel/sanctum": "^4.0",
    "laravel/tinker": "^2.9",
    "predis/predis": "^2.2",
    "spatie/laravel-permission": "^6.4",
    "google/apiclient": "^2.15"
  },
  "require-dev": {
    "fakerphp/faker": "^1.23",
    "laravel/pint": "^1.13",
    "laravel/sail": "^1.26",
    "mockery/mockery": "^1.6",
    "nunomaduro/collision": "^8.0",
    "phpunit/phpunit": "^10.5"
  },
  "autoload": {
    "psr-4": {
      "App\\\\": "app/",
      "Database\\\\Factories\\\\": "database/factories/",
      "Database\\\\Seeders\\\\": "database/seeders/"
    }
  },
  "scripts": {
    "post-autoload-dump": [
      "Illuminate\\\\Foundation\\\\ComposerScripts::postAutoloadDump",
      "@php artisan package:discover --ansi"
    ]
  },
  "config": {
    "optimize-autoloader": true,
    "preferred-install": "dist",
    "sort-packages": true
  }
}`,
    },

    'package_json': {
      title: 'package.json (Vue 3 + Inertia + TS + Bootstrap)',
      lang: 'json',
      desc: 'Frontend dependencies: Vue 3, Inertia, TypeScript, Bootstrap 5, Popper.js, Lucide Icons, Vite.',
      code: `{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build"
  },
  "dependencies": {
    "@inertiajs/vue3": "^1.0.14",
    "@popperjs/core": "^2.11.8",
    "bootstrap": "^5.3.3",
    "lucide-vue-next": "^0.359.0",
    "vue": "^3.4.21"
  },
  "devDependencies": {
    "@types/bootstrap": "^5.2.10",
    "@types/node": "^20.11.24",
    "@vitejs/plugin-vue": "^5.0.4",
    "laravel-vite-plugin": "^1.0.2",
    "sass": "^1.71.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4",
    "vue-tsc": "^1.8.27"
  }
}`,
    },

    'migration_rooms': {
      title: 'database/migrations/2026_09_10_000001_create_rooms_table.php',
      lang: 'php',
      desc: 'Skema PostgreSQL untuk entitas Ruang Rapat (nama, kapasitas, fasilitas JSON, Google Calendar Resource ID).',
      code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->integer('capacity');
            $table->json('facilities'); // e.g. ['Smart TV', 'Zoom Room', 'AC', 'WiFi']
            $table->string('location');
            $table->string('google_calendar_id')->unique();
            $table->enum('status', ['active', 'maintenance'])->default('active');
            $table->string('image_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};`,
    },

    'migration_bookings': {
      title: 'database/migrations/2026_09_10_000002_create_bookings_table.php',
      lang: 'php',
      desc: 'Skema PostgreSQL untuk reservasi tanpa login (kode booking unik 6-digit, magic link token, conflict index).',
      code: `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('booking_code', 10)->unique()->index(); // e.g. BKG-883921
            $table->foreignUuid('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->string('booker_name');
            $table->string('booker_email')->index();
            $table->string('division')->nullable();
            $table->string('meeting_title');
            $table->date('date')->index();
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('participant_count');
            $table->json('attendees_emails')->nullable();
            $table->text('extra_notes')->nullable();
            $table->enum('status', ['confirmed', 'in-progress', 'completed', 'cancelled'])->default('confirmed');
            $table->string('google_event_id')->nullable()->index();
            $table->string('manage_token', 64)->unique(); // Magic link token
            $table->timestamps();

            // Compound index for instant conflict validation query
            $table->index(['room_id', 'date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};`,
    },

    'spatie_seeder': {
      title: 'database/seeders/RolesAndPermissionsSeeder.php',
      lang: 'php',
      desc: 'Spatie Role & Permission RBAC seeder untuk admin, super-admin, dan hak akses dashboard.',
      code: `<?php

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use Spatie\\Permission\\Models\\Role;
use Spatie\\Permission\\Models\\Permission;
use App\\Models\\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\\Spatie\\Permission\\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        Permission::create(['name' => 'view dashboard']);
        Permission::create(['name' => 'manage rooms']);
        Permission::create(['name' => 'override bookings']);
        Permission::create(['name' => 'cancel any booking']);
        Permission::create(['name' => 'export reports']);
        Permission::create(['name' => 'manage admins']);

        // Create Roles
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view dashboard',
            'manage rooms',
            'override bookings',
            'cancel any booking',
            'export reports'
        ]);

        $superAdmin = Role::create(['name' => 'super-admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Assign to primary admin
        $user = User::firstOrCreate(
            ['email' => 'admin.office@instansi.go.id'],
            [
                'name' => 'Raden Mas Admin',
                'password' => bcrypt('AdminSecret2026!'),
            ]
        );
        $user->assignRole($superAdmin);
    }
}`,
    },

    'booking_controller': {
      title: 'app/Http/Controllers/BookingController.php',
      lang: 'php',
      desc: 'Controller untuk booking publik tanpa login (FR-1, FR-8, FR-9), validasi bentrok jadwal, dan dispatch Google Calendar sync job.',
      code: `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Room;
use App\\Models\\Booking;
use App\\Jobs\\SyncGoogleCalendarJob;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Str;
use Inertia\\Inertia;

class BookingController extends Controller
{
    /**
     * Halaman Publik: Direktori Bilik & Jadwal Ledger (FR-6, FR-7)
     */
    public function index(Request $request)
    {
        $date = $request->query('date', now()->format('Y-m-d'));
        $rooms = Room::where('status', 'active')->get();
        $bookings = Booking::where('date', $date)
            ->where('status', '!=', 'cancelled')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Booking/Index', [
            'rooms' => $rooms,
            'bookings' => $bookings,
            'selectedDate' => $date,
        ]);
    }

    /**
     * Pemesanan Bilik Tanpa Login (FR-1, FR-8, FR-9)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'booker_name' => 'required|string|max:150',
            'booker_email' => 'required|email|max:150',
            'division' => 'nullable|string|max:150',
            'meeting_title' => 'required|string|max:255',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'participant_count' => 'required|integer|min:1',
            'attendees_emails' => 'nullable|array',
            'extra_notes' => 'nullable|string',
        ]);

        // Strict Conflict Validation (FR-9)
        $hasConflict = Booking::where('room_id', $validated['room_id'])
            ->where('date', $validated['date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->exists();

        if ($hasConflict) {
            return back()->withErrors([
                'schedule' => 'Slot waktu bertabrakan dengan jadwal rapat lain. Silakan pilih jam lain.'
            ]);
        }

        // Generate unique 6-digit booking code (FR-3) & magic token
        $code = 'BKG-' . str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
        $token = Str::random(40);

        $booking = Booking::create([
            ...$validated,
            'booking_code' => $code,
            'manage_token' => $token,
            'status' => 'confirmed',
        ]);

        // Dispatch background Redis job for 2-way Google Calendar synchronization (FR-22)
        SyncGoogleCalendarJob::dispatch($booking, 'create');

        return redirect()->route('booking.voucher', ['token' => $token])
            ->with('success', 'Reservasi bilik rapat berhasil dibukukan.');
    }

    /**
     * Cek & Kelola Booking Tanpa Login via Magic Link (FR-10, FR-12)
     */
    public function manage(Request $request, string $token)
    {
        $booking = Booking::where('manage_token', $token)->with('room')->firstOrFail();
        
        $userHistory = Booking::where('booker_email', $booking->booker_email)
            ->with('room')
            ->orderByDesc('date')
            ->get();

        return Inertia::render('Booking/Manage', [
            'booking' => $booking,
            'history' => $userHistory,
        ]);
    }
}`,
    },

    'vue_booking_page': {
      title: 'resources/js/Pages/Booking/Index.vue (Vue 3 + TS + Bootstrap)',
      lang: 'vue',
      desc: 'Komponen Vue 3 dengan TypeScript dan Bootstrap 5 sesuai PRD dan tema Concierge Ledger.',
      code: `<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm, router } from '@inertiajs/vue3';

interface Room {
  id: string;
  name: string;
  capacity: number;
  facilities: string[];
  location: string;
  google_calendar_id: string;
  status: 'active' | 'maintenance';
}

interface Booking {
  id: string;
  booking_code: string;
  room_id: string;
  booker_name: string;
  meeting_title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

const props = defineProps<{
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
}>();

const selectedRoom = ref<Room>(props.rooms[0]);
const drawerOpen = ref(false);

const form = useForm({
  room_id: '',
  booker_name: '',
  booker_email: '',
  meeting_title: '',
  date: props.selectedDate,
  start_time: '11:00',
  end_time: '12:30',
  participant_count: 8,
  extra_notes: 'Standar Bilik Lengkap',
});

function openBookingModal(roomId: string, start?: string, end?: string) {
  form.room_id = roomId;
  if (start) form.start_time = start;
  if (end) form.end_time = end;
  drawerOpen.value = true;
}

function submitBooking() {
  form.post('/booking', {
    onSuccess: () => {
      drawerOpen.value = false;
    }
  });
}
</script>

<template>
  <div class="concierge-ledger min-vh-100 bg-bone text-ink">
    <!-- Navbar -->
    <header class="navbar navbar-expand-lg border-bottom border-secondary-subtle px-4 py-3 bg-bone sticky-top">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <a class="navbar-brand font-serif fw-bold text-ink" href="/">The Concierge Ledger</a>
        <div class="d-flex gap-2">
          <a href="/cek-booking" class="btn btn-outline-dark btn-sm">Cek Booking Saya</a>
          <a href="/admin/login" class="btn btn-dark btn-sm">Admin Office</a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container py-5">
      <div class="mb-4">
        <h1 class="font-serif display-5 fw-normal">Reservasi Ruang Rapat</h1>
        <p class="text-muted">Pesan ruangan resmi instansi langsung tanpa login. Terhubung langsung ke Google Calendar.</p>
      </div>

      <!-- Room Directory Grid -->
      <div class="row g-4">
        <div v-for="room in rooms" :key="room.id" class="col-md-4">
          <div class="card bg-parchment border border-secondary-subtle h-100 p-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-bottle text-white">Tersedia</span>
              <small class="text-muted font-monospace">{{ room.location }}</small>
            </div>
            <h3 class="font-serif h4 text-ink">{{ room.name }}</h3>
            <p class="small text-muted mb-3">Kapasitas: {{ room.capacity }} Orang</p>
            <div class="mt-auto">
              <button @click="openBookingModal(room.id)" class="btn btn-dark w-100">
                Pesan Ruangan
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-bone { background-color: #F1ECDF; }
.bg-parchment { background-color: #E4DBC8; }
.bg-bottle { background-color: #26392E; }
.text-ink { color: #16191C; }
.font-serif { font-family: 'Fraunces', Georgia, serif; }
</style>`,
    },
  };

  const currentItem = fileContents[activeFile] || fileContents['docker-compose'];

  const copyCode = () => {
    navigator.clipboard.writeText(currentItem.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-12 py-8 md:py-12 flex flex-col gap-8">
      {/* Top Architecture Overview Banner */}
      <section className="bg-[#16191C] text-[#F1ECDF] p-6 md:p-8 rounded border border-[#A9822D]/35 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#55524A]/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#A9822D] text-[#16191C] flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-[#A9822D] font-mono uppercase tracking-widest">
                Target Architecture & Codebase Inspector
              </div>
              <h1 className="font-serif-title text-2xl md:text-3xl font-normal text-[#F1ECDF]">
                Laravel 11 + Vue 3 + Inertia + TypeScript + Bootstrap + Docker + Spatie
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-[#26392E] text-emerald-300 px-3 py-1 rounded font-mono">
              Docker Ready
            </span>
            <span className="bg-[#1E2328] text-[#E4DBC8] px-3 py-1 rounded font-mono border border-[#55524A]/30">
              PostgreSQL 16 + Redis 7
            </span>
          </div>
        </div>

        {/* Stack Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#1E2328] p-3 rounded border border-[#55524A]/20">
            <span className="text-[#8A857B] block text-[11px]">Backend Framework</span>
            <strong className="text-[#F1ECDF] text-sm">Laravel 11 (PHP 8.3)</strong>
            <span className="text-[11px] text-[#A9822D] block mt-0.5">REST + Inertia Protocol</span>
          </div>

          <div className="bg-[#1E2328] p-3 rounded border border-[#55524A]/20">
            <span className="text-[#8A857B] block text-[11px]">Frontend Stack</span>
            <strong className="text-[#F1ECDF] text-sm">Vue 3 + Inertia + TS</strong>
            <span className="text-[11px] text-[#A9822D] block mt-0.5">Bootstrap 5 + SCSS</span>
          </div>

          <div className="bg-[#1E2328] p-3 rounded border border-[#55524A]/20">
            <span className="text-[#8A857B] block text-[11px]">Database & Cache</span>
            <strong className="text-[#F1ECDF] text-sm">PostgreSQL 16 + Redis 7</strong>
            <span className="text-[11px] text-[#A9822D] block mt-0.5">Compound Indexing</span>
          </div>

          <div className="bg-[#1E2328] p-3 rounded border border-[#55524A]/20">
            <span className="text-[#8A857B] block text-[11px]">Role & Access (RBAC)</span>
            <strong className="text-[#F1ECDF] text-sm">Spatie Laravel-Permission</strong>
            <span className="text-[11px] text-[#A9822D] block mt-0.5">Admin & Super-Admin</span>
          </div>
        </div>
      </section>

      {/* Interactive Code & Configuration Explorer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: File Tree Nav (4 Cols) */}
        <div className="lg:col-span-4 bg-[#E4DBC8]/60 p-4 rounded border border-[#55524A]/20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#55524A]/15 text-xs">
            <span className="font-semibold text-[#16191C] flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-[#A9822D]" />
              <span>Berkas Arsitektur Proyek</span>
            </span>
            <span className="text-[11px] text-[#55524A]">8 Berkas Kunci</span>
          </div>

          <div className="space-y-1 text-xs">
            {[
              { id: 'docker-compose', label: 'docker-compose.yml', type: 'Docker / Services' },
              { id: 'dockerfile', label: 'Dockerfile', type: 'PHP 8.3 Container' },
              { id: 'composer', label: 'composer.json', type: 'Laravel Dependencies' },
              { id: 'package_json', label: 'package.json', type: 'Vue 3 + Bootstrap' },
              { id: 'migration_rooms', label: 'create_rooms_table.php', type: 'PostgreSQL Migration' },
              { id: 'migration_bookings', label: 'create_bookings_table.php', type: 'PostgreSQL Migration' },
              { id: 'spatie_seeder', label: 'RolesAndPermissionsSeeder.php', type: 'Spatie RBAC' },
              { id: 'booking_controller', label: 'BookingController.php', type: 'Laravel Controller' },
              { id: 'vue_booking_page', label: 'Index.vue', type: 'Vue 3 + Inertia Page' },
            ].map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFile(file.id)}
                className={`w-full p-2.5 rounded text-left transition-all flex items-center justify-between ${
                  activeFile === file.id
                    ? 'bg-[#16191C] text-[#F1ECDF] font-medium shadow-xs'
                    : 'text-[#55524A] hover:bg-[#E4DBC8] hover:text-[#16191C]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${activeFile === file.id ? 'text-[#A9822D]' : 'text-[#55524A]'}`} />
                  <span className="truncate">{file.label}</span>
                </div>
                <span className="text-[10px] opacity-70 shrink-0 ml-2 font-mono">{file.type}</span>
              </button>
            ))}
          </div>

          {/* Quick Start Command Box */}
          <div className="pt-3 border-t border-[#55524A]/15 text-xs">
            <span className="font-semibold text-[#16191C] block mb-1">Perintah Eksekusi Lokal:</span>
            <div className="bg-[#16191C] text-[#F1ECDF] p-2.5 rounded font-mono text-[11px] leading-relaxed select-all">
              git clone &lt;repo&gt;<br />
              docker compose up -d<br />
              docker compose exec app php artisan migrate --seed
            </div>
          </div>
        </div>

        {/* Right: Code Viewer (8 Cols) */}
        <div className="lg:col-span-8 bg-[#16191C] rounded border border-[#55524A]/30 shadow-lg overflow-hidden flex flex-col">
          {/* Code Viewer Header */}
          <div className="bg-[#101215] px-5 py-3 border-b border-[#55524A]/25 flex items-center justify-between text-xs text-[#F1ECDF]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#A9822D]" />
              <span className="font-mono font-medium text-sm text-[#F1ECDF]">{currentItem.title}</span>
            </div>

            <button
              onClick={copyCode}
              className="px-3 py-1.5 bg-[#1E2328] hover:bg-[#1E2328]/80 text-[#F1ECDF] rounded text-xs flex items-center gap-1.5 transition-colors border border-[#55524A]/30"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A9822D]" />}
              <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
            </button>
          </div>

          {/* Code Description */}
          <div className="px-5 py-2.5 bg-[#1E2328]/70 border-b border-[#55524A]/20 text-xs text-[#8A857B]">
            {currentItem.desc}
          </div>

          {/* Code Body */}
          <div className="p-5 overflow-x-auto max-h-[600px] font-mono text-xs text-[#F1ECDF] leading-relaxed">
            <pre className="whitespace-pre">{currentItem.code}</pre>
          </div>
        </div>
      </section>
    </div>
  );
};
