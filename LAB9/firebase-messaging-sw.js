// Import Firebase Scripts (ใช้เวอร์ชัน compat สำหรับ Service Worker)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

console.log('[SW] Service Worker loading...');

// 1. ตั้งค่า Config (ต้องตรงกับในหน้า HTML ของคุณ)
// นำค่าจาก Firebase Console > Project Settings มาใส่ที่นี่
const firebaseConfig = {
  apiKey: "AIzaSyAoM_hZTwFUDqJs0exOdpSX1JA7WjboSeo",
  authDomain: "m1-67-5247c.firebaseapp.com",
  projectId: "m1-67-5247c",
  storageBucket: "m1-67-5247c.firebasestorage.app",
  messagingSenderId: "387889975860",
  appId: "1:387889975860:web:c4cd42472cd2588024f061"
};

// 2. เริ่มต้น Firebase ใน Service Worker
try {
  firebase.initializeApp(firebaseConfig);
  console.log('[SW] ✅ Firebase initialized in Service Worker');
} catch (error) {
  console.error('[SW] ❌ Firebase init failed:', error);
}

// 3. สร้าง instance ของ Messaging
const messaging = firebase.messaging();
console.log('[SW] ✅ Messaging instance created');

// 4. จัดการการแจ้งเตือนเมื่อแอปทำงานใน Background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 📬 Background message received:', payload);

  // ดึงข้อมูลจาก Payload
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: payload.notification?.image || '/icon.png',
    image: payload.notification?.image,
    data: payload.data || {},
    
    // ตั้งค่าเพิ่มเติมเพื่อให้ประสบการณ์การใช้งานที่ดีขึ้น
    requireInteraction: false,
    badge: '/icon.png',
    tag: 'fcm-notification',
    actions: [
      {
        action: 'open',
        title: '📖 เปิดดู'
      },
      {
        action: 'close',
        title: '✕ ปิด'
      }
    ]
  };

  console.log('[SW] 🔔 Showing notification:', notificationTitle);
  
  // แสดงการแจ้งเตือนของ Browser
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => console.log('[SW] ✅ Notification displayed'))
    .catch(error => console.error('[SW] ❌ Failed to show notification:', error));
});

// 5. จัดการเหตุการณ์เมื่อผู้ใช้คลิกที่การแจ้งเตือน
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] 👆 Notification clicked:', event);

  event.notification.close();

  // เปิดหน้าเว็บขึ้นมาใหม่ หรือ focus หน้าเดิม
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      console.log('[SW] Found', windowClients.length, 'window client(s)');
      
      // ถ้ามีหน้าเว็บเปิดอยู่แล้ว ให้ Focus หน้านั้น
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf('/') !== -1 && 'focus' in client) {
          console.log('[SW] ✅ Focusing existing window');
          return client.focus();
        }
      }
      
      // ถ้าไม่มีหน้าเว็บเปิดอยู่ ให้เปิดหน้าใหม่
      if (clients.openWindow) {
        console.log('[SW] 🪟 Opening new window');
        return clients.openWindow('./fcm_tester.html'); 
      }
    })
  );
});

// 6. รองรับ Notification Close Event
self.addEventListener('notificationclose', function(event) {
  console.log('[SW] ❌ Notification closed by user');
});

// 7. Life cycle events
self.addEventListener('install', function(event) {
  console.log('[SW] 📦 Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] 🚀 Service Worker activated');
  event.waitUntil(clients.claim());
});