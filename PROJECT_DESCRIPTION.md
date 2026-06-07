EVV Clock In/Out System — Project Description

The EVV Clock In/Out system is a web-based platform built for home care and support service agencies. It handles the full visit workflow digitally — from scheduling and staff clock-in/out to AI-assisted documentation and payroll — replacing paper-based processes with a clean, secure, and auditable system. The live version is available at clocksync.skillleo.com.

The system has two separate portals. The admin portal is for agency managers and supervisors who create assignments, review visit records, approve or reject submissions, manage payroll, and configure system settings. The staff portal is for direct support professionals (DSPs) who view their assigned visits, clock in and out in the field, write visit notes, and submit visits for admin review.

The visit process starts when the admin creates an assignment by linking a staff member, a consumer (the person receiving services), a service type, and a scheduled date. This assignment appears in the system as a scheduled visit.

When the staff member arrives at the consumer's location, they open the visit in their portal and click clock in. The system records the exact clock-in time on the server and captures the staff member's GPS coordinates. The visit is then marked as in progress.

When the visit ends, the staff clicks end visit. The system records the clock-out time and GPS location, then automatically calculates the raw hours, rounded hours (to the nearest quarter-hour), and billing units (in 15-minute increments).

After clocking out, the staff fills in a structured documentation form based on agency standards. The form includes a detailed narrative of what happened during the visit, a checklist of assistance types provided (such as emotional support, shower assistance, meal clean-up, safety monitoring, and others), fields for challenges encountered, confirmation that services were rendered per the individual support plan, any recommended adjustments to the consumer's plan, and a progress notes section. All answers are auto-saved as the staff types so nothing is lost if they navigate away.

Once the note is complete, the staff clicks process with AI. The system sends the note to an AI engine (OpenAI GPT-4) which cleans the note by fixing grammar and improving clarity while preserving all clinical terminology, and then generates a structured summary organized into professional sections such as activities, participation, support provided, and outcomes. Both the cleaned note and the summary are saved alongside the original.

The staff then visits the review page where they can see all three versions of their note along with the visit times, hours, and billing units. When satisfied, they submit the visit. The status changes to pending admin review and the record is locked.

The admin opens the visit in their portal and reviews everything — the full timeline, GPS data, hours, billing units, and all note versions. The admin can edit any note directly if corrections are needed. They then either approve the visit or reject it with a written comment. Approved visits are immediately included in payroll. Rejected visits send the comment back to staff.

The payroll module lets the admin filter approved visits by date range and staff member, preview a summary showing total hours and billing units, and export a CSV file compatible with standard payroll and billing platforms.

The branding module allows the agency to fully customize the system appearance without any technical knowledge. The admin can upload a custom logo, set the application name and tagline, choose primary and sidebar colors, and customize all text on the login page including headings, labels, button text, and support email. Changes apply instantly across the entire system.

The AI settings module lets the admin control how the AI processes notes — including the summary length, the tone (such as neutral, professional, or warm), and any custom cleaning instructions like preserving specific medical terminology or following agency-specific writing standards.

On the technical side, all visit times are recorded server-side so they cannot be altered by the staff device. The system uses role-based access control, encrypted sessions, and CSRF protection on all requests. GPS capture fails gracefully if the device denies location permission. The backend is built on Laravel 11, the frontend on React 18 with Inertia.js, styled with Tailwind CSS, and the database is MySQL running on a Linux VPS with Nginx.
