# Database Schema Documentation

## Overview

**Database:** Supabase (PostgreSQL)  
**Authentication:** Supabase Auth integration

---

## Tables

### profiles

User profile information linked to Supabase Auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, FOREIGN KEY → auth.users(id) | User's unique identifier from Supabase Auth |
| username | text | NOT NULL, UNIQUE | Unique username |
| role | text | DEFAULT 'user', CHECK ('user', 'admin') | User role for permissions |
| profile_picture | text | - | URL to user's profile picture |
| created_at | timestamp with time zone | DEFAULT now() | Account creation timestamp |
| is_flagged | boolean | DEFAULT false | Whether user has been flagged for review |
| flag_reason | text | - | Reason for flagging |
| is_banned | boolean | DEFAULT false | Whether user is banned |
| ban_reason | text | - | Reason for ban |
| banned_until | timestamp with time zone | - | Temporary ban expiration |
| address | text | - | User's address |

**Relationships:**
- References `auth.users(id)` (Supabase Auth)
- Referenced by `events.host_id`
- Referenced by `follows.follower_id` and `follows.followed_id`
- Referenced by `event_participants.user_id`
- Referenced by `group_chat_members.user_id`
- Referenced by `messages.sender_id`
- Referenced by `event_flags.user_id` and `event_flags.admin_id`

---

### events

Events created by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique event identifier |
| host_id | uuid | NOT NULL, FOREIGN KEY → profiles(id) | Event creator/host |
| title | text | NOT NULL | Event title |
| description | text | NOT NULL | Event description |
| category | text | - | Event category |
| date | date | NOT NULL | Event date |
| time | time without time zone | NOT NULL | Event time |
| location | text | - | Event location description |
| capacity | integer | NOT NULL | Maximum number of participants |
| status | text | NOT NULL, DEFAULT 'pending', CHECK ('pending', 'approved', 'rejected', 'cancelled') | Event approval status |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now() | Event creation timestamp |
| image_url | text | - | URL to event image |
| skill_level | text | - | Required skill level |
| rejection_reason | text | - | Admin's reason for rejection |
| latitude | numeric | - | Event location latitude |
| longitude | numeric | - | Event location longitude |
| nearest_mrt_station | text | - | Nearest MRT station name |
| nearest_mrt_distance | numeric | - | Distance to nearest MRT (meters) |

**Relationships:**
- References `profiles(id)` via `host_id`
- Referenced by `event_participants.event_id`
- Referenced by `group_chats.event_id`
- Referenced by `event_flags.event_id`

**Status Values:**
- `pending`: Awaiting admin approval
- `approved`: Approved by admin
- `rejected`: Rejected by admin
- `cancelled`: Cancelled by host or admin

---

### event_participants

Junction table for users joining events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| event_id | uuid | PRIMARY KEY, FOREIGN KEY → events(id) | Event being joined |
| user_id | uuid | PRIMARY KEY, FOREIGN KEY → profiles(id) | User joining the event |
| joined_at | timestamp with time zone | DEFAULT now() | When user joined |

**Composite Primary Key:** (event_id, user_id)

**Relationships:**
- References `events(id)` via `event_id`
- References `profiles(id)` via `user_id`

---

### follows

User follow relationships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| follower_id | uuid | PRIMARY KEY, FOREIGN KEY → profiles(id) | User who is following |
| followed_id | uuid | PRIMARY KEY, FOREIGN KEY → profiles(id) | User being followed |
| created_at | timestamp with time zone | DEFAULT now() | When follow relationship was created |

**Composite Primary Key:** (follower_id, followed_id)

**Relationships:**
- References `profiles(id)` via `follower_id`
- References `profiles(id)` via `followed_id`

---

### group_chats

Group chat instances linked to events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique chat identifier |
| event_id | uuid | UNIQUE, FOREIGN KEY → events(id) | Associated event (one-to-one) |
| created_at | timestamp with time zone | DEFAULT now() | Chat creation timestamp |

**Relationships:**
- References `events(id)` via `event_id` (one-to-one)
- Referenced by `group_chat_members.chat_id`
- Referenced by `messages.chat_id`

---

### group_chat_members

Junction table for users in group chats.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique membership identifier |
| chat_id | uuid | NOT NULL, FOREIGN KEY → group_chats(id) | Chat being joined |
| user_id | uuid | NOT NULL, FOREIGN KEY → profiles(id), auth.users(id) | User in the chat |
| joined_at | timestamp with time zone | DEFAULT now() | When user joined chat |

**Relationships:**
- References `group_chats(id)` via `chat_id`
- References `profiles(id)` via `user_id`
- References `auth.users(id)` via `user_id`

---

### messages

Messages sent in group chats.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| chat_id | uuid | FOREIGN KEY → group_chats(id) | Chat containing the message |
| sender_id | uuid | FOREIGN KEY → profiles(id) | User who sent the message |
| content | text | NOT NULL, CHECK (char_length ≤ 256) | Message content (max 256 chars) |
| created_at | timestamp with time zone | DEFAULT now() | Message timestamp |

**Relationships:**
- References `group_chats(id)` via `chat_id`
- References `profiles(id)` via `sender_id`

**Constraints:**
- Message content limited to 256 characters

---

### event_flags

Reports/flags on events by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique flag identifier |
| event_id | uuid | FOREIGN KEY → events(id) | Event being flagged |
| user_id | uuid | FOREIGN KEY → profiles(id) | User who flagged the event |
| reason | text | - | Reason for flagging |
| created_at | timestamp with time zone | DEFAULT now() | When flag was created |
| admin_action | text | CHECK ('removed_flag', 'deleted_event') | Admin's action taken |
| admin_id | uuid | FOREIGN KEY → profiles(id) | Admin who took action |
| action_taken_at | timestamp with time zone | - | When admin took action |

**Relationships:**
- References `events(id)` via `event_id`
- References `profiles(id)` via `user_id`
- References `profiles(id)` via `admin_id`

**Admin Actions:**
- `removed_flag`: Flag dismissed, event remains
- `deleted_event`: Event removed due to flag

---
## Entity Relationships

- **auth.users** (Supabase Auth)
  - **profiles** (1:1)
    - **events** (1:many via host_id)
      - **event_participants** (many:many junction table)
      - **group_chats** (1:1)
        - **group_chat_members** (many:many junction table)
        - **messages** (1:many)
      - **event_flags** (1:many)
    - **follows** (many:many, self-referential)
   
---

## User Roles

| Role | Description |
|------|-------------|
| user | Regular user (default) |
| admin | Administrator with moderation privileges |

---

## Event Workflow

1. **Creation**: User creates event with status `pending`
2. **Review**: Admin reviews event
3. **Approval/Rejection**: 
   - If approved: status → `approved`, event becomes visible
   - If rejected: status → `rejected`, `rejection_reason` set
4. **Participation**: Users can join approved events via `event_participants`
5. **Group Chat**: One `group_chat` created per event for participants
6. **Cancellation**: Host or admin can set status → `cancelled`

---

## Moderation Features

### User Moderation
- **Flagging**: `is_flagged` set to true with `flag_reason`
- **Banning**: 
  - Permanent: `is_banned` = true, `ban_reason` set
  - Temporary: `banned_until` timestamp set

### Event Moderation
- Events require approval (status: `pending` → `approved`/`rejected`)
- Users can flag events via `event_flags`
- Admins can remove flags or delete flagged events

---

## Constraints & Validations

### Check Constraints
- `profiles.role`: Must be 'user' or 'admin'
- `events.status`: Must be 'pending', 'approved', 'rejected', or 'cancelled'
- `event_flags.admin_action`: Must be 'removed_flag' or 'deleted_event'
- `messages.content`: Maximum 256 characters

### Unique Constraints
- `profiles.username`: Globally unique
- `group_chats.event_id`: One chat per event

### Foreign Key Relationships
All foreign keys maintain referential integrity across tables.

---

## Security Considerations

### Row Level Security (RLS)
Supabase RLS policies are enabled for:
- Users can only edit their own profiles
- Users can only see approved events (unless admin)
- Users can only send messages in chats they're members of
- Only admins can update event status
- Only admins can ban/flag users

### Authentication
- All user operations require Supabase Auth authentication
- `profiles.id` linked to `auth.users(id)` ensures authenticated access
