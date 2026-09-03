# 🌸 TEWA Education Consultancy - Complete Project Documentation

A professional, fully-responsive website for TEWA Education Consultancy specializing in study and work opportunities in Japan. This project features a backend server for data management and a modern frontend with dual intake periods (April & October).

---

## 🚀 Quick Start (2 Steps)

### Step 1: Install Dependencies
```powershell
cd backend
npm install
```

### Step 2: Start the Server
```powershell
npm start
```

✅ **Done!** Open browser to: **http://localhost:3000**

---

## 📁 Project Structure

```
TEWA Education/
│
├── 🖥️ BACKEND/ (Node.js Server)
│   ├── server.js                 # Express server (API + serves frontend)
│   ├── package.json              # Dependencies & npm scripts
│   ├── data/
│   │   ├── intakes.json          # Intake information storage
│   │   ├── applications.json     # Form submissions storage
│   │   ├── admin-auth.json       # Admin credentials
│   │   ├── dashboard.json        # Dashboard data
│   │   ├── images.json           # Image metadata
│   │   └── messages.json         # Message storage
│   ├── routes/
│   │   └── images.js             # Image upload routes
│   ├── scripts/
│   │   └── generate-admin-password.js  # Password generation utility
│   ├── uploads/                  # Uploaded files directory
│   └── node_modules/             # Installed packages
│
├── 💻 FRONTEND/ (Website Files)
│   ├── index.html                # Home page (hero + testimonials)
│   ├── about.html                # Company info & language programs
│   ├── intakes.html              # Intake details & application form
│   ├── services.html             # Service offerings & features
│   ├── gallery.html              # Gallery & contact information
│   ├── admin.html                # Admin panel for intake management
│   ├── Script.js                 # Frontend JavaScript (197 lines)
│   ├── style.css                 # All styling & responsive design (1279 lines)
│   ├── images/                   # All project images
│   │   ├── logo.png              # TEWA logo
│   │   ├── sakura.png            # Hero image 1
│   │   ├── classroom.png         # Hero image 2
│   │   ├── queen.png             # Hero image 3
│   │   └── [gallery images]      # Student photos & experiences
│   └── uploads/                  # Upload directory
│       ├── gallery/              # Gallery uploads
│       └── home/                 # Home section uploads
│
└── 📚 ROOT FILES
    ├── README.md                 # This file - Complete documentation
    └── package.json              # Project metadata
```

---

## 🌐 Website Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | `/index.html` | Hero section + testimonials |
| **About** | `/about.html` | Company info + language programs + Kaigo scholarship |
| **Intakes** | `/intakes.html` | April/October intake details + application form |
| **Services** | `/services.html` | Service offerings + Why Choose Us section |
| **Gallery** | `/gallery.html` | Student gallery + contact info + Google Maps |
| **Admin** | `/admin.html` | Admin panel for managing intakes (password protected) |

---

## ⚙️ Running the Project

### Start Server
```powershell
cd backend
npm start
```

**Output:**
```
✅ TEWA Backend Server is running on http://localhost:3000
📊 Admin Panel: http://localhost:3000/admin.html
```

### Access the Website
- **Main Site**: http://localhost:3000/index.html
- **Admin Panel**: http://localhost:3000/admin.html
- **API Endpoint**: http://localhost:3000/api/intakes

---

## 🔧 How to Make Common Changes

### 1. Update Contact Information

**Phone Number:**
- Navbar (line ~50 in index.html & other pages)
- Contact section (gallery.html)
- Footer (all pages)
- WhatsApp button (all pages)

**Email:**
- Contact section
- Footer (all pages)

**Address:**
- Contact section
- Footer (all pages)

**How to update:**
1. Open relevant HTML files (`index.html`, `about.html`, etc.)
2. Find the phone/email/address text
3. Replace with new information
4. Save and refresh browser

### 2. Change Brand Colors

Located in CSS (style.css, lines 23-33):
```css
:root {
    --tewa-red: #FF4747;
    --tewa-blue: #1E3A8A;
    --tewa-gold: #F59E0B;
    /* etc. */
}
```

Update any color value and save—all pages will automatically use the new colors.

### 3. Update Intake Information (April/October)

**Option A: Quick Edit HTML**
- Edit `intakes.html` directly and update dates/details
- Edit `about.html` for scholarship info

**Option B: Use Admin Panel** (Recommended)
1. Go to: http://localhost:3000/admin.html
2. Enter admin password (default: `tewa123`)
3. Edit intake details
4. Click "Save Changes"
5. Changes reflected instantly on website

⚠️ **Change Admin Password:**
1. Open `/backend/server.js`
2. Find line with `const ADMIN_PASSWORD = 'tewa123'`
3. Change to your secure password
4. Restart server

### 4. Update Logo

1. Prepare new logo (PNG recommended, transparent background)
2. Name it `logo.png`
3. Replace in `/frontend/images/` folder
4. Logo automatically updates on all pages

### 5. Update Gallery Images

1. Add new images to `/frontend/images/`
2. Edit `gallery.html`
3. Update the `<img src>` paths to your image filenames
4. Update overlay text as needed

---

## 📝 Intake Management

### Current Intakes

**April Intake** 🌸
- Application Deadline: November 30
- Course Duration: 1-2 Years
- Visa Processing: December 2025 - January 2026
- Scholarship: 100% Available
- Part-time Work: 28 hours/week

**October Intake** 🍂
- Application Deadline: May 31
- Course Duration: 1.5 Years
- Visa Processing: June - July 2026
- Scholarship: Partial to Full
- Part-time Work: 28 hours/week

### Edit Intake Details
1. **HTML Method**: Edit `intakes.html` directly
2. **Admin Panel Method**: Use password-protected admin panel at `/admin.html`
3. **Data Method**: Edit `/backend/data/intakes.json`

---

## 💼 Services Offered

1. **Japanese Language Classes** 🎓
   - N5 Beginner Level
   - N4 Intermediate Foundation
   - Native instructors

2. **Japanese Language Tests** 🧪
   - JLPT (International proficiency test)
   - JLCT (Practical communication)
   - JFT-Basic (Work/residency requirements)
   - JPT, JCT, NAT-TEST

3. **Study in Japan** ✈️
   - Student Visa support
   - College placement (A Grade)
   - Scholarship application
   - Pre-departure briefing

4. **Work Opportunities** 💼
   - SSW Visa guidance
   - Job placement support
   - Interview preparation
   - Contract review

5. **Special Cases** 🎯
   - Study gap acceptable
   - Low GPA accepted
   - Past COE rejected → accepted cases

6. **Accommodation** 🏠
   - Dormitory arrangement
   - Apartment search
   - Guarantor assistance
   - 24/7 support

---

## 🎯 Key Features

✅ **Responsive Design**
- Mobile-friendly hamburger menu
- Optimized for all screen sizes
- Smooth animations and transitions

✅ **Application Form**
- Name, Phone, Email, Age
- Interest selection (Study/Work/Language/Both)
- Education level dropdown
- Message textarea
- Google Sheets integration (optional)

✅ **Testimonials Carousel**
- 6 student success stories
- Automated slide transitions
- Navigation arrows and dots

✅ **Hero Image Slider**
- 3 hero images with navigation
- Automatic rotation with manual controls
- Smooth transitions

✅ **Contact Integration**
- WhatsApp floating button
- Google Maps embedded (office location)
- Email and phone links
- Social media links (WhatsApp, Instagram, Facebook, TikTok)

✅ **Admin Panel**
- Password-protected access
- Edit intake information without code
- Real-time updates to website

---

## 🔐 Security

### Admin Password
- **Location**: `/backend/server.js` (line ~80)
- **Default**: `tewa123`
- **⚠️ CHANGE IMMEDIATELY** for production

### Environment Variables (Optional)
Create `.env` file in root:
```
ADMIN_PASSWORD=YourSecurePassword
PORT=3000
NODE_ENV=production
```

---

## 📱 Responsive Breakpoints

The website is optimized for:
- 📱 Mobile: 320px - 480px
- 📱 Tablet: 481px - 768px
- 💻 Desktop: 769px and above

Mobile menu automatically activates for screens under 769px.

---

## 🔗 External Links & APIs

- **Google Fonts**: Inter, Noto Sans JP
- **Font Awesome**: Social media icons
- **Google Maps**: Office location embed
- **WhatsApp API**: Direct messaging link (+977-9767474000)
- **Social Media**: Instagram, Facebook, TikTok

---

## 📊 Form Submission

### Application Form Fields
- Full Name (required)
- Phone Number (required)
- Email Address (required)
- Age (optional)
- Interested In (required): Study/Work/Language/Both
- Education Level (required): SEE/+2/Bachelor/Master/Other
- Message (optional)

### Form Storage
- Submissions stored in `/backend/data/applications.json`
- Or integrated with Google Sheets (if configured)

---

## 🛠️ Technical Stack

**Backend:**
- Node.js & Express.js
- CORS enabled for frontend communication
- JSON file storage

**Frontend:**
- HTML5 semantic markup
- CSS3 with Grid & Flexbox
- Vanilla JavaScript (no frameworks)
- Responsive mobile-first design

**Integrations:**
- Google Sheets (optional form storage)
- Google Maps API
- WhatsApp Web API
- Font Awesome Icons

---

## 📞 Support & Contact

**TEWA Education Consultancy**
- **Phone**: +977-9767474000 | +977-15920652
- **Email**: tewa.educ@gmail.com
- **Address**: Bhaktapur-4, Suryabinayak Chowk, Nepal
- **Hours**: Sunday-Friday, 7:00 AM - 6:30 PM

---

## 📝 File Statistics

| File | Lines | Purpose |
|------|-------|---------|
| style.css | 1279 | All styling & responsive design |
| Script.js | 197 | Frontend interactivity |
| index.html | 450+ | Home page |
| about.html | 350+ | Company & programs |
| intakes.html | 300+ | Intake details & form |
| services.html | 250+ | Service listings |
| gallery.html | 200+ | Gallery & contact |
| server.js | 300+ | Backend API |

---

## ✨ Special Features

### Kaigo (介護) Scholarship Program
- Caregiving industry specialization
- 100% scholarship coverage
- Guaranteed employment
- Premium salary packages
- Free accommodation
- Career advancement opportunities

### Why Choose TEWA?
- 📅 Flexible class schedules
- 👨‍🏫 Experienced native instructors
- 📋 Complete application support
- 📝 Exam registration assistance
- 🎓 Exclusive scholarship opportunities
- 99% visa success rate

---

## 🚀 Future Enhancements

Potential improvements:
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Email notifications for applications
- [ ] Live chat support
- [ ] Student portal login system
- [ ] Online payment integration
- [ ] Multi-language support
- [ ] Mobile app

---

## 📄 License

TEWA Education Consultancy © 2026. All Rights Reserved.
Developed By: Digital Keylor (https://tharuakash.com.np/)

---

## 🤝 Contributing

To update this documentation:
1. Make changes to relevant HTML/CSS/JS files
2. Test thoroughly
3. Update this README.md if features change
4. Commit and push

---

**Last Updated**: September 1, 2026  
**Version**: 2.0 (Multi-page with dedicated sections)  
**Status**: ✅ Production Ready
