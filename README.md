# 🐿️ น้องทิวสน - Interactive Digital Signage

ระบบ Digital Signage แบบอัจฉริยะสำหรับวิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา พร้อม AI Assistant และการวิเคราะห์ใบหน้าแบบ Real-time

## ✨ ฟีเจอร์หลัก

### 🔐 ความปลอดภัยและความเป็นส่วนตัว (PDPA)
- หน้า PDPA Consent ก่อนเปิดกล้อง
- **Auto-Reset**: รีเซ็ตอัตโนมัติเมื่อไม่พบผู้ใช้เกิน 30 วินาที
- ไม่มีการบันทึกข้อมูลส่วนบุคคล

### 👤 Face Analysis & Personalization
- วิเคราะห์ เพศ และ อายุ แบบ Real-time ด้วย face-api.js
- แสดงเนื้อหาที่ตรงกับกลุ่มเป้าหมาย (Target Audience)
- ตรวจจับการมีผู้คนอยู่หน้าจอ (Presence Detection)

### 🤖 AI Assistant - น้องทิวสน
- Multi-language: ไทย, อังกฤษ, จีน, เกาหลี
- Voice Commands: สลับภาษาด้วยเสียง
- Text-to-Speech และ Speech-to-Text
- บุคลิก: พูดภาษาไทยผสมคำเมือง (ล้านนา) ลงท้ายด้วย "เจ้า"
- Powered by Google Gemini 1.5 Flash

### 📰 News Feed System
- แสดงข่าวสาร/วิดีโอแบบ Personalized
- รองรับทั้ง รูปภาพ และ วิดีโอ (MP4)
- Multi-language Content

### 🎛️ Admin CMS
- อัปโหลดสื่อไปยัง Firebase Storage
- จัดการ Target Audience (เพศ/อายุ)
- เพิ่ม/ลบข่าวสาร
- เข้าถึงโหมด Admin: กด **Alt+A**

---

## 🚀 การติดตั้งและใช้งาน

### Prerequisites
- Node.js 18.x หรือสูงกว่า
- npm หรือ yarn
- Firebase Account
- Google Gemini API Key

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/yourusername/tiewson-digital-signage.git
cd tiewson-digital-signage
\`\`\`

### 2. ติดตั้ง Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. ตั้งค่า Firebase

1. สร้างโปรเจกต์ใน [Firebase Console](https://console.firebase.google.com)
2. เปิดใช้งาน:
   - **Authentication** (ถ้าต้องการ)
   - **Firestore Database**
   - **Storage**
   - **Hosting**

3. สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
\`\`\`env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

4. แก้ไขไฟล์ `src/firebaseConfig.js` ให้ใช้ค่าจาก Environment Variables:
\`\`\`javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
\`\`\`

### 4. ตั้งค่า Firestore Security Rules

ไปที่ **Firestore Database > Rules** และใส่:
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /news/{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // หรือปรับตามความต้องการ
    }
  }
}
\`\`\`

### 5. ตั้งค่า Storage Security Rules

ไปที่ **Storage > Rules** และใส่:
\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /news/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // หรือปรับตามความต้องการ
    }
  }
}
\`\`\`

### 6. รัน Development Server
\`\`\`bash
npm start
\`\`\`

เปิดบราウเซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## 📦 การ Deploy ไปยัง Firebase Hosting

### วิธีที่ 1: Manual Deploy

1. Build โปรเจกต์:
\`\`\`bash
npm run build
\`\`\`

2. ติดตั้ง Firebase CLI:
\`\`\`bash
npm install -g firebase-tools
\`\`\`

3. Login และ Init:
\`\`\`bash
firebase login
firebase init hosting
\`\`\`

4. Deploy:
\`\`\`bash
firebase deploy --only hosting
\`\`\`

### วิธีที่ 2: Automatic Deploy ด้วย GitHub Actions

1. เพิ่ม Secrets ใน GitHub Repository:
   - ไปที่ **Settings > Secrets and variables > Actions**
   - เพิ่ม Secrets:
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
     - `GEMINI_API_KEY`
     - `FIREBASE_SERVICE_ACCOUNT` (JSON จาก Firebase Console)

2. Push code ไปยัง branch `main`:
\`\`\`bash
git add .
git commit -m "Deploy to Firebase"
git push origin main
\`\`\`

3. GitHub Actions จะ Deploy อัตโนมัติ!

---

## 🎮 การใช้งาน

### สำหรับผู้ใช้ทั่วไป
1. กดยอมรับ PDPA
2. ระบบจะเปิดกล้องและวิเคราะห์ใบหน้า
3. ดูข่าวสารที่แนะนำตามโปรไฟล์
4. สนทนากับน้องทิวสนได้ทั้งข้อความและเสียง
5. สลับภาษาได้ด้วยปุ่มหรือเสียง (พูดว่า "ภาษาอังกฤษ", "ภาษาจีน", ฯลฯ)

### สำหรับ Admin
1. กด **Alt+A** เพื่อเข้าสู่โหมด Admin
2. เพิ่มข่าวสารใหม่พร้อมอัปโหลดรูป/วิดีโอ
3. ตั้งค่ากลุ่มเป้าหมาย (เพศ/อายุ)
4. รองรับเนื้อหาหลายภาษา (ไทย, อังกฤษ, จีน, เกาหลี)

---

## 🧩 โครงสร้างโปรเจกต์

\`\`\`
tiewson-digital-signage/
├── public/
│   └── index.html
├── src/
│   ├── firebaseConfig.js       # Firebase configuration
│   ├── PDPAOverlay.js          # PDPA consent screen
│   ├── FaceAnalyzer.js         # Face detection & analysis
│   ├── TiewSonAI.js            # AI Assistant component
│   ├── NewsFeed.js             # News feed display
│   ├── AdminCMS.js             # Admin content management
│   ├── App.js                  # Main application
│   ├── index.css               # Global styles
│   └── index.js                # React entry point
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml # CI/CD workflow
├── package.json
├── tailwind.config.js
└── README.md
\`\`\`

---

## 🔧 การปรับแต่ง

### เปลี่ยนสี Brand
แก้ไขใน `tailwind.config.js`:
\`\`\`javascript
colors: {
  lanna: {
    blue: '#YOUR_COLOR',
    gold: '#YOUR_COLOR',
    green: '#YOUR_COLOR'
  }
}
\`\`\`

### ปรับแต่งบุคลิก AI
แก้ไขใน `TiewSonAI.js` ที่ `systemPrompts`:
\`\`\`javascript
th: \`เจ้าคือ "น้องทิวสน" ... [ปรับแต่งตามต้องการ]\`
\`\`\`

### เปลี่ยนเวลา Auto-Reset
แก้ไขใน `FaceAnalyzer.js`:
\`\`\`javascript
noPresenceTimer.current = setTimeout(() => {
  resetToInitialState();
}, 30000); // เปลี่ยนเป็นมิลลิวินาทีที่ต้องการ
\`\`\`

---

## 🛠️ Technologies Used

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Face Detection**: face-api.js
- **AI**: Google Gemini 1.5 Flash
- **Backend**: Firebase (Firestore, Storage, Hosting)
- **CI/CD**: GitHub Actions

---

## 📝 License

MIT License - สามารถนำไปใช้และพัฒนาต่อได้อย่างอิสระ

---

## 🙏 Credits

พัฒนาโดย: [ชื่อของคุณ]  
สำหรับ: **วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา**

---

## 📞 ติดต่อ

หากมีคำถามหรือต้องการความช่วยเหลือ:
- Email: support@lannapolytechnic.ac.th
- Website: https://lannapolytechnic.ac.th

---

**สวัสดีเจ้า! ยินดีต้อนรับสู่วิทยาลัยโปลิเทคนิคลานนาเจ้า** 🐿️✨