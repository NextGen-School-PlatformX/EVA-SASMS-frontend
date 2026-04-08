# 🏫 SASMS - Comprehensive Internal System Guide (الدليل الشامل للنظام الداخلي)

Welcome to the **School Admin & Student Management System (SASMS)**. This unified application manages the entire academic lifecycle, from new applicant registration to graduation, while providing seamless inter-departmental operations and super administration controls.

أهلاً بكم في **نظام إدارة شؤون الطلاب والمدرسة (SASMS)**. يقوم هذا التطبيق الموحد بإدارة الدورة الأكاديمية بالكامل، بدءاً من تسجيل المتقدمين الجدد وحتى التخرج، مع توفير عمليات سلسة بين الأقسام وأدوات تحكم للإدارة العليا.

---

## 🏗️ System Architecture & Access Tiers (هيكلية النظام ومستويات الوصول)

The system is built on a strict hierarchical **Role-Based Access Control (RBAC)** architecture.
يعتمد النظام على هيكل صارم للتحكم في الوصول بناءً على الأدوار (RBAC).

### 1. 👑 SuperAdmin (الإدارة العليا / المشرف العام)
- **Role**: Absolute system control. (تحكم مطلق بالنظام)
- **Abilities**: 
  - Manage all departments and staff assignments. (إدارة كافة الأقسام وتعيين الموظفين)
  - Full financial oversight (Override and set fees). (رقابة مالية كاملة وتحديد الرسوم)
  - View raw audit logs (`Audit & Traceability`) for every action taken by any user. (عرض سجلات التدقيق لكافة إجراءات المستخدمين)
  - Monitor real-time KPIs (Total Students, Financial Health, Active Complaints). (مراقبة مؤشرات الأداء الحية)

### 2. 🛡️ Staff / Admin (الموظفين / مسؤولي الإدارات)
- **Role**: Daily school operations and student interactions. (العمليات اليومية والتفاعل مع الطلاب)
- **Abilities**:
f  - Review and process new Applicant forms (Approve/Reject to convert them to Students). (مراجعة وقبول أو رفض المتقدمين الجدد لتحويلهم لطلاب)
  - Resolve Student Support Tickets and Complaints. (حل شكاوى الطلاب والتذاكر)
  - Track student attendance and issue grades in specific departments. (تسجيل الحضور ورصد الدرجات)
  
### 3. 🎓 Student (الطالب المسجل)
- **Role**: Active enrolled members of the school. (الأعضاء المسجلين النشطين)
- **Abilities**:
  - Access academic portals, schedules, and grades. (الوصول للجداول الأكاديمية والدرجات)
  - Pay tuition and bus fees via integrated financial tracking. (دفع المصروفات ورسوم الحافلات)
  - Create Support Tickets for academic or administrative issues. (إنشاء تذاكر دعم فني أو أكاديمي)

### 4. 📝 Applicant (المتقدم الجديد)
- **Role**: Pending entry into the system. (في انتظار الدخول للنظام)
- **Abilities**:
  - Submit mandatory documents (National ID, Birth Certificate, etc.). (رفع المستندات الإلزامية)
  - Select preferred departments and track admission status live. (اختيار الأقسام وتتبع حالة القبول)

---

## 🚀 Key Workflows & Features (المسارات الأساسية والمميزات)

### 1️⃣ New Student Admission Flow (مسار قبول طالب جديد)
*How a candidate becomes a student.* (كيف يصبح المتقدم طالباً)
1. **Apply**: User goes to the Application page and registers as an `Applicant`.
2. **Submit Profile**: The Applicant uploads digitized copies of their Ministry Result, Birth Certificate, National ID, and Registration Fee Receipt.
3. **Admin Review**: A `Staff` user in the Admissions Department reviews the profile.
4. **Acceptance**: Upon clicking 'Accept', the system completely modifies the user's role in the background from `APPLICANT` to `STUDENT`, allocating them a class and student ID.

### 2️⃣ Department Creation & Tracking (إنشاء الأقسام ومتابعتها)
1. **Creation**: SuperAdmin navigates to the "Departmental Governance" view.
2. **Setup**: SuperAdmin clicks "New Department", names it (e.g., "Science Faculty" or "Student Affairs"), and assigns a Head of Department.
3. **Audit Tracing**: The system secretly writes a cryptographically secure `CREATE_DEPARTMENT` record in the `AuditLog` table. This prevents unauthorized system modifications.

### 3️⃣ Real-time Dashboards (اللوحات التفاعلية الحية)
- All charts (Pie Charts for attendance, Bar Charts for financing) use real, calculated inputs securely streamed from the SQLite backend.
- (تستخدم جميع الرسوم البيانية كالحضور والماليات مدخلات حية محسوبة ومستمدة بأمان من قاعدة البيانات).

### 4️⃣ Immutable Audit System (نظام التدقيق الغير قابل للتعديل)
- Every significant `POST`, `PUT`, or `DELETE` request in the system (such as adding users, managing finances, approving candidates) automatically registers into the central `AuditLog`.
- (كل طلب تعديل أو حذف أو إضافة في النظام يُسجل تلقائياً في سجلات التدقيق المركزية).
- These logs cannot be deleted through the UI, ensuring 100% accountability. (لا يمكن مسح هذه السجلات من واجهة الاستخدام لضمان المساءلة التامة).

---

## 💻 Tech Stack Overview (التقنيات المستخدمة)
- **Frontend**: Next.js 14, React 18, Material UI (MUI), Recharts.
- **Backend**: Express.js, TypeScript, Prisma ORM, JWT, Bcrypt, Winston.
- **Testing Engine**: Playwright (E2E workflows) & Supertest (Integration APIs).
- **Database**: SQLite (`dev.db`).

---

## 🚦 How to Run the Project (طريقة تشغيل المشروع)

1. **Start the Backend server:** (تشغيل الخادم الخلفي)
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The backend starts on `http://localhost:5001`. Ensure your `.env` contains the correct `DATABASE_URL`.*

2. **Start the Frontend client:** (تشغيل واجهة المستخدم)
   ```bash
   # In the root frontend directory
   npm install
   npm run dev
   ```
   *The frontend starts on `http://localhost:3000`.*

3. **Log in:** (تسجيل الدخول)
   - Navigate to `http://localhost:3000/login`.
   - Ensure you select the correct **Control Aspect (Role)** from the dropdown to access your desired module.
   - For SuperAdmin, select `System SuperAdmin`.

---

> [!TIP]
> **Data Privacy Notification (تنويه حول خصوصية البيانات):**
> SASMS automatically hashes student credentials and limits staff view abilities strictly to their departmental domains, abiding by standard institutional security guidelines.
> (يقوم النظام بتشفير بيانات الطلاب تلقائياً ويقيد وصول الموظفين لأقسامهم فقط للحفاظ على خصوصية وأمن المعلومات).
