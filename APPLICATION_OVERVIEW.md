# Duplicate Deal Checker - Application Overview

## Executive Summary
**Duplicate Deal Checker** is a web-based application designed to help sales teams manage deal submissions and identify potential duplicate entries. The system uses fingerprinting and scoring algorithms to flag suspicious submissions while maintaining a complete audit trail for administrative review.

---

## Application Purpose

The Duplicate Deal Checker serves as a centralized deal management platform that:
- **Prevents Duplicate Submissions**: Automatically detects and flags potentially duplicate deals using advanced scoring algorithms
- **Streamlines Deal Management**: Provides an intuitive interface for sales teams to submit, view, and manage deals
- **Enable Admin Review**: Gives administrators tools to review flagged deals and approve/reject submissions
- **Maintain Data Integrity**: Ensures accurate deal records with validation and duplicate checking

---

## Why We Need It

1. **Risk Mitigation**: Duplicate deals can lead to conflicting commitments, revenue confusion, and customer relationship issues
2. **Efficiency**: Automated duplicate detection reduces manual review time and human error
3. **Data Quality**: Maintains a clean, reliable database of active deals
4. **Compliance**: Provides audit trails and approval workflows for deal governance
5. **Cost Savings**: Prevents wasted resources on duplicate follow-ups and lost customer confidence

---

## Backend Architecture

**Technology Stack**: Node.js, Express.js, PostgreSQL

**Key Components:**
- **API Server**: RESTful endpoints for deal management
- **Database**: PostgreSQL with JSONB support for flexible cost matrices
- **Duplicate Detection**: Fingerprint and scoring utilities for identifying similar deals
- **Admin Workflow**: Flagged deals review and approval/rejection system

**Core Endpoints:**
- `POST /api/deals/precheck` – Compute duplicate score and reasoning
- `POST /api/deals/submit` – Submit new deal
- `GET /api/deals` – List all deals
- `GET /api/deals/:id` – Get deal details
- `PUT /api/deals/:id` – Update deal
- `DELETE /api/deals/:id` – Delete deal
- `GET /api/admin/flagged` – List flagged deals
- `POST /api/admin/review` – Approve/reject flagged deals

**Database Schema**: Stores customer name, product, quantity bands, location, expected close date, deal owner, cost matrix (JSON), and status tracking.

---

## Frontend Architecture

**Technology Stack**: React, Parcel, HTML5, CSS3

**Key Views:**
1. **Deal Form** – Submit new deals with comprehensive information including cost matrix data
2. **List View** – Browse, search, and manage submitted deals (CRUD operations)
3. **Admin Dashboard** – Review flagged deals and approve/reject submissions

**Features:**
- Real-time duplicate scoring preview
- Form validation and error handling
- Responsive UI for desktop and mobile
- User-friendly navigation between views

---

## Workflow

1. **Sales User submits a deal** via the Deal Form with customer, product, quantity, and cost details
2. **System runs precheck** using fingerprinting and scoring algorithms
3. **Deal is submitted** with status of either "submitted" or "flagged" based on duplicate score
4. **Admin reviews flagged deals** in the Admin Dashboard
5. **Admin approves or rejects** each flagged deal
6. **Deal status is updated** accordingly in the system

---

## Future Enhancements

- Role-based authentication (Sales User vs Admin)
- Automated tests and database migrations
- Advanced fuzzy-matching and Postgres trigram indexing
- Enhanced UI/UX improvements
- Integration with CRM systems

---

**Version**: 1.0 MVP  
**Last Updated**: February 2026  
**Status**: Production Ready
