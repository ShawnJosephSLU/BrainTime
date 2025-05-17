# BrainTime

## Web Application Design Document

**Domain Name:** braintime.org

**Project Managers:**
*   Shawn Joseph: Chief Executive Officer of MLAB LLC | Castries, Saint Lucia
*   Gabriela Garcia: Product Manager for BrainTime | Tijuana, Mexico

## Overview

BrainTime.org is an online platform specifically designed for educators, trainers, and quiz enthusiasts to create secure, timed assessments. The platform provides tiered subscription plans that encompass features such as student management, analytics, and seamless integration with Stripe for facilitating payments. BrainTime.org aspires to position itself as the leading exam creation platform, emphasizing security, adaptability, and an intuitive user interface. By harnessing the MERN stack and integrating with Stripe, it offers scalable solutions that cater to diverse educational requirements.

## System Architecture

*   **Stack:** MERN (MongoDB, Express JS, React, Node JS)
*   **Database Collections:**
    *   `Users`: Stores user details, role (admin/student), email, password hash, subscription plan.
    *   `Quizzes`: Contains quiz details, questions, time limits, student access settings.
    *   `Groups`: Manages student groups with enrollment status and permissions.
    *   `StudentEnrollment`: Tracks which students are enrolled in which quizzes.
    *   `Responses`: Stores student answers and grades.

## User Roles

*   **Admins:** Monitor analytics, handle payments.
*   **Students:** Enroll in courses, take quizzes, view results.
*   **Creators:** Create and manage quizzes, set up groups.

## Features

### Quiz Creation & Management
*   Supports various question types (MCQ, short/long answers, true/false).
*   Timed quizzes with countdown timers and auto-submission on time expiry.
*   Option to allow or block internet access during exams.

### Student Enrollment
*   Create groups for students, assign quizzes, track progress.
*   Students receive notifications via email or app dashboard upon enrollment.

### Analytics Dashboard
*   Detailed metrics: completion rates, average scores, time per question.
*   Insights for quiz creators to improve exam design and student engagement.

### Payment Integration
*   Stripe integration for secure payments.
*   Subscription tiers with monthly and annual options (20% discount).
    *   **Basic ($5.99/month):** 5 live exams, 50 students.
    *   **Pro ($12.99/month):** 50 live exams, 150 students.
    *   **Enterprise ($24.99/month):** Unlimited exams, 10 students.

### Security
*   HTTPS for data encryption.
*   Input validation and sanitization to prevent attacks.
*   Optional screen recording features for cheating prevention.

### Free Trial
*   30-day trial with Basic plan features; auto-conversion post-trial if not canceled.

## System Flow

1.  **User Authentication:** Sign up or log in, role-based access control.
2.  **Quiz Creation:** Admins create quizzes, set parameters (duration, student limits), publish.
3.  **Student Access:** Enrolled students view and take exams; notifications sent on quiz availability.
4.  **Grading & Transcripts:** Admins grade short/long answers post-submission, generate transcripts for download.

## Technical Considerations

*   **Database Schema:** Proper structure to track quizzes, responses, and user roles.
*   **Security Measures:** HTTPS, environment variables for Stripe keys, DDoS protection.
*   **Scalability:** Cloud services (AWS) for scalability; cron jobs for cleanup tasks.

## Frontend & Backend

*   **Frontend:** React JS with responsive design, intuitive UI for quiz creation and taking.
*   **Backend:** Express JS API handling requests, database interactions, Stripe integration.

## Analytics & Reporting

*   Real-time dashboards for admins to view metrics; data export options (PDF/CSV).

## Deployment & Testing

*   Use of cloud services for hosting, SSL certificates, domain setup on VPS.
*   Comprehensive testing (unit, integration, E2E) and security audits.

## Collections

### Users
The `Users` collection stores information about all users on the platform, including both administrators (admins) and students. Each user has a unique identifier (`_id`), an email address (`email`), a hashed version of their password (`passwordHash`), and their role (`role`). The collection also tracks the user's Stripe customer ID (`stripeCustomerId`) for billing purposes and their current subscription plan (`subscriptionPlan`). Additionally, it includes the `trialExpiry` date to manage the free trial period.

### Quizzes
The `Quizzes` collection holds details about each quiz created by an admin. Each quiz has a unique identifier (`_id`), a title (`title`), and a short description (`description`). The `adminId` field links the quiz to its creator, while the `groupId` associates it with a specific group of students. The collection includes an array of `questions`, each representing a question in the quiz, along with `startTime` and `endTime` to manage the quiz duration. The `duration` field specifies the length of the quiz in minutes, and `allowInternet` indicates whether internet access is allowed during the exam.

#### Sub-collection: Questions
Each document within the `Questions` sub-collection represents a single question within a quiz. It includes a unique identifier (`_id`), the type of question (`MCQ`, `shortAnswer`, `longAnswer`, `trueFalse`), and the text of the question. The collection also allows for multimedia content by storing URLs to audio files (`audioUrl`), image files (`imageUrl`), and GIFs (`gifUrl`). For MCQ questions, an array of `options` is provided, along with the correct answer(s) in either a string or an array format depending on the question type.

### Groups
The `Groups` collection manages student enrollment. Each group has a unique identifier (`_id`), an associated admin's ID (`adminId`), and a name (`name`). The `students` field is an array of student IDs, indicating which students are enrolled in the group.

### StudentEnrollment
The `StudentEnrollment` collection tracks which students are enrolled in which quizzes. Each document includes a unique identifier (`_id`), a `quizId` linking to the quiz, and a `studentId` linking to the student.

### Responses
The `Responses` collection stores the answers submitted by students during quizzes. Each response has a unique identifier (`_id`), a `quizId` linking to the quiz, and a `studentId` linking to the student. The `answers` field is an array of answer objects, each representing a student's response to a specific question.

#### Sub-collection: Answers
Each document within the `Answers` sub-collection represents a single answer submitted by a student to a question. It includes a unique identifier (`_id`), a `questionId` linking to the corresponding question, and the `studentAnswer`, which is stored as either a string or an array depending on the question type.

### Stripe Subscriptions
The `StripeSubscriptions` collection manages subscription details for admins. Each document includes a unique identifier (`_id`), a `stripeSubscriptionId` linking to the corresponding Stripe subscription, and an `adminId` linking to the associated admin. The collection tracks the current plan (`Basic`/`Pro`/`Enterprise`), the status of the subscription (`active`/`past_due`/`cancelled`), and the `startDate` and `endDate` of the subscription. 