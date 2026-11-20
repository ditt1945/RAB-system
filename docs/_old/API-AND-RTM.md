# API Requirements & Traceability Matrix — RABKita

## 1. API Contract Conventions

- Base: `/api/*`
- Auth: session cookie NextAuth; server wajib memvalidasi sesi.
- Input: validasi Zod per endpoint.
- Angka: terima number string atau number, konversi ke Decimal; tolak nilai negatif kecuali field yang memang boleh negatif (tidak ada).
- Output error:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "...", "fieldErrors": { "name": "wajib diisi" } } }
  ```
- Semua list wajib memakai filter owner/company; default response tidak pernah memuat data user lain.

## 2. Endpoint Requirements

### Auth
| ID | Method & Path | Actor | Input | Output | Status code |
|---|---|---|---|---|---|
| API-001 | POST `/api/auth/register` | Guest | name, email, password | user created | 201; 400 invalid; 409 dup |
| API-002 | POST `/api/auth/[...nextauth]` | Guest | credentials | session cookie | 200; 401 |
| API-003 | GET `/api/profile` | Any user | - | profile | 200; 401 |
| API-004 | PUT `/api/profile` | Any user | name, phone, department, notes | profile updated | 200; 400 |

### Project
| ID | Method & Path | Actor | Input | Output | Notes |
|---|---|---|---|---|---|
| API-010 | GET `/api/projects` | admin/estimator/manager | - | list scoped | 200 |
| API-011 | POST `/api/projects` | admin/estimator | projectName, clientName, dates, pricing | project | 201; 400 |
| API-012 | GET `/api/projects/[id]` | assigned/owner/admin | - | project detail | 200/403/404 |
| API-013 | PATCH `/api/projects/[id]` | owner/admin | metadata & pricing | project | 200/403 |
| API-014 | DELETE `/api/projects/[id]` | admin | - | deleted | 200/403 |

### RAB item & summary
| ID | Method & Path | Actor | Input | Output |
|---|---|---|---|---|
| API-020 | GET `/api/projects/[id]/items` | assigned/owner | - | items |
| API-021 | POST `/api/projects/[id]/items` | estimator/admin | name, volume, unitPrice, materialId? | item with subtotal |
| API-022 | PATCH `/api/projects/[id]/items/[itemId]` | estimator/admin | editable fields | updated item |
| API-023 | DELETE `/api/projects/[id]/items/[itemId]` | estimator/admin | - | deleted |
| API-024 | GET `/api/projects/[id]/summary` | assigned/owner | - | calculation object |

### Materials
| ID | Method & Path | Actor | Input | Output |
|---|---|---|---|---|
| API-030 | GET `/api/materials` | owner/admin | - | scoped materials |
| API-031 | POST `/api/materials` | owner/admin | material fields | 201 |
| API-032 | PUT/PATCH `/api/materials/[id]` | owner/admin | fields | 200 |
| API-033 | DELETE `/api/materials/[id]` | owner/admin | - | 200; RabItem relasi SetNull |

### PDF & AI
| ID | Method & Path | Actor | Output |
|---|---|---|---|
| API-040 | GET `/api/projects/[id]/pdf` | assigned/owner/admin | application/pdf |
| API-041 | POST `/api/projects/[id]/ai/recommend` | estimator/admin | AiRequest suggestions |
| API-042 | POST `/api/projects/[id]/ai/recommend/[requestId]/accept` | estimator/admin | items created; acceptedAt |

### Planned endpoints
| ID | Method & Path | Notes |
|---|---|---|
| API-050 | POST `/api/projects/[id]/revisions` | snapshot immutable |
| API-051 | GET `/api/projects/[id]/revisions` | list |
| API-060 | POST `/api/projects/[id]/change-orders` | draft |
| API-061 | PATCH `/api/projects/[id]/change-orders/[id]` | submit/approve/reject; transition guard |
| API-070 | POST `/api/house-estimations` | calculation + breakdown |
| API-071 | GET `/api/analytics/estimations` | scoped aggregate |
| API-080 | POST `/api/quotation-requests` | public, rate limited |
| API-081 | PATCH `/api/quotation-requests/[id]` | admin only |
| API-090 | GET/POST `/api/users` | admin only role management |

---

## 3. Requirement Traceability Matrix (RTM)

| Req ID | Feature | Role | Page | Use case | Flowchart | Entity | API | Test ID | Status |
|---|---|---|---|---|---|---|---|---|---|
| FR-AUTH-001 | Register | Guest | /register | Uc-001 | F-Auth-02 | User, ProfileSetting | API-001 | T-001 | Implemented |
| FR-AUTH-002 | Login/session | All | /login | Uc-001 | F-Auth-02 | User, ProfileSetting | API-002 | T-002 | Implemented |
| FR-AUTH-003 | Role guard | All | All protected | Uc-001 | F-Auth-02 | ProfileSetting | API-003..n | T-003 | Gap |
| FR-AUTH-004 | Profile | All | /profile | Uc-001 | F-Auth-02 | User, ProfileSetting | API-003,004 | T-004 | Implemented |
| FR-PROJ-001 | Create project | estimator/admin | /projects/new | Uc-002 | F-Proj-03 | Project | API-011 | T-005 | Implemented |
| FR-PROJ-002 | Read/update/delete | owner/admin | /projects/[id] | Uc-002 | F-Proj-03 | Project | API-010..014 | T-006 | Implemented |
| FR-RAB-001 | RAB item CRUD | estimator/admin | /projects/[id] | Uc-002 | F-RAB-03 | RabItem, Material | API-020..023 | T-007 | Implemented |
| FR-RAB-002 | Summary calculation | owner/admin | /projects/[id] | Uc-002 | F-Summary-04 | Project, RabItem | API-024 | T-008 | Implemented |
| FR-RAB-003 | Revision snapshot | admin/estimator/manager | /projects/[id] | Uc-003 | F-Rev-05 | RabRevision | API-050,051 | T-009 | Gap |
| FR-RAB-004 | PDF export | owner/admin/client | /projects/[id] | Uc-004 | F-PDF-10 | Project, RabItem, CompanySettings | API-040 | T-010 | Partial |
| FR-MAT-001 | Material CRUD | owner/admin | /materials | Uc-005 | F-Mat-08 | Material | API-030..033 | T-011 | Implemented |
| FR-CO-001 | Create/submit CO | admin/estimator/manager | /projects/[id] | Uc-006 | F-CO-06 | ChangeOrder | API-060 | T-012 | Gap |
| FR-CO-002 | Approve/reject CO | admin/manager | /projects/[id] | Uc-006 | F-CO-06 | ChangeOrder | API-061 | T-013 | Gap |
| FR-AI-001 | AI request | estimator/admin | /projects/[id] | Uc-007 | F-AI-07 | AiRequest | API-041 | T-014 | Partial |
| FR-AI-002 | Accept AI item | estimator/admin | /projects/[id] | Uc-007 | F-AI-07 | AiRequest, RabItem | API-042 | T-015 | Gap |
| FR-EST-001 | House estimation | admin/estimator | /house-estimations | Uc-008 | F-Est-09 | HouseEstimation | API-070 | T-016 | Gap |
| FR-EST-002 | Estimation analytics | admin/manager | /analytics | Uc-008 | F-Est-09 | EstimationAnalytic | API-071 | T-017 | Gap |
| FR-QUOTE-001 | Public quotation | Guest | Landing CTA | Uc-009 | F-Quote-11 | QuotationRequest | API-080 | T-018 | Gap |
| FR-QUOTE-002 | Quotation follow-up | admin | /admin/quotations | Uc-009 | F-Quote-11 | QuotationRequest | API-081 | T-019 | Gap |

## 4. Test Case Coverage Proposal

| Test ID | Area | Type | Key assertion |
|---|---|---|---|
| T-001 | Register | API | password tidak muncul di response; user + profile dibuat |
| T-002 | Login | API | password salah → 401; password benar → session |
| T-003 | RBAC | API integration | non-role action → 403; unauthenticated → 401 |
| T-004 | Profile | API | update milik sendiri; user lain tidak bisa update |
| T-005 | Project create | API | ownership dari session; default values valid |
| T-006 | Project CRUD | API | cross-user → 403/404 |
| T-007 | RAB item | API | subtotal = volume × unitPrice 2 desimal |
| T-008 | Summary | Unit + API | semua formula BR-001..006 |
| T-009 | Revision | API | snapshot tidak berubah saat item diedit |
| T-010 | PDF | Integration | content-type pdf; tidak berisi password |
| T-011 | Material | API | owner scoping; delete item SetNull |
| T-012/013 | Change order | API | valid transition; approve non-manager → 403 |
| T-014/015 | AI | Integration mocked | failed path; suggestion schema validation |
| T-016/017 | Estimation | Unit + API | quality impact; analytics scope |
| T-018/019 | Quotation | API | public create; admin status transition |
