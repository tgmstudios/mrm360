# **Member Relations Management (MRM) 360**

## **Features**

### **Onboarding**

* When a member joins, the Discord bot sends them a unique link (tied to their Discord user ID).
* The link redirects them to MRM, which handles authentication and redirects back to the unique link.
* Upon return:

  * Member is verified in Discord.
  * Optionally:

    * Subscribe to newsletter?
    * Link GitHub account?
    * Submit SSH public key?

---

### **Team Management**

* **Create Team Form**

  * Fields:

    * Category (e.g., red, blue, ctf, social, development)
    * Team name
    * Members
  * Automations:

    * Create Authentik group: `{category}-{team name}`
    * Assign members to group
  * Optional Resources:

    * **Discord**

      * Create role + channels
      * Assign role to members
      * Grant role access to channels
    * **Nextcloud**

      * Create folder: `{category}/{team name}`
      * Grant R/W access to Authentik group
    * **Wiki.js**

      * Create wiki path: `{category}/{team name}/index`
      * Grant R/W access to Authentik group
    * **GitHub** (optional)

      * Create repository: `{category}-{team name}`
* Editing/deleting a team should also revert associated resources

---

### **Event Management**

* **Create Event Form**

  * Fields:

    * Calendar: (general, red, blue, ctf, social)
    * Type: (GBM, workshop, social, practice)
    * Name, description, location, time
    * Estimated attendance
    * Associated team (optional)
  * Optional Features:

    * **Attendance Tracking**

      * Organizer scans member QR (vs. self-check-in)
    * **Announcements**

      * Auto-post in Nextcloud Deck
    * **Compsole Integration**

      * Create OpenStack project: `{type}-{event name}`
      * Grant tech team access
      * Set up Compsole provider/competition
      * Optionally:

        * Attach Heat template
        * 1 hour before event: deploy `{estimated attendance}` number of stacks
        * When members click "Request VM", attach their Compsole user to the event competition
* Editing/deleting an event should revert changes and associated resources

---

### **Inventory (Check-In / Check-Out)**

* Allow admins to manage shared items and track check-out/check-in history.

---

### **VPN Requests**

* Create Pritunl user for approved members (likely limited to dev/infra teams).

---

## **Integrations**

* Authentik
* Nextcloud
* Wiki.js
* Discord
* Listmonk
* Pritunl
* Compsole
* OpenStack
* SMTP
* SSH key manager?
* Cloudflare?
* GitHub?
* Oracle Cloud?

---

## **GUI Overview**

### **Executive Board View**

* **Header:** Tabs + profile icon
* **Sidebar:** Contextual (changes by tab)
* **Main Area:** Edit/create/view forms

#### **Dashboard**

* Member count
* Active members
* Upcoming events
* Item inventory summary

#### **Events**

* **Sidebar**

  * Create new event
  * List of events with edit/delete icons
  * Icons/colors indicating event type
* **Main Content**

  * Public event view (default)

    * RSVPs, attendance data
  * Edit/create form for latest event
  * Metadata: who created it

#### **Members**

* **Sidebar**

  * Invite member (popup: email + optional teams)
  * List with edit/delete icons
* **Main Content**

  * Member details: email, username, Discord, etc.
  * Associated teams
  * RSVP/attendance history
  * Newsletter subscription status
  * Authentik group membership

#### **Teams**

* **Sidebar**

  * Create new team
  * List of teams (grouped by category)
* **Main Content**

  * Team events
  * Linked resources (folders, channels, etc.)
  * Members (add/remove)
  * Created by info

#### **Items**

* **Sidebar**

  * Add item
  * Item list (grouped: checked out vs. in inventory)
* **Main Content**

  * Checkout history
  * Metadata: creator info

#### **Profile**

* Linked accounts (GitHub, etc.)
* VPN request (if eligible)
* Member QR code

---

### **Member View**

#### **Dashboard**

* Attended events
* Upcoming events
* Teams

#### **Events**

* List of upcoming events
* Ongoing event

  * Links to RSVP/VM provisioning, etc.

#### **Teams**

* Teams the member is part of

#### **Items**

* Currently checked-out items

#### **Profile**

* Linked accounts
* QR code (wallet integration?)

---

### **PI View (Optional)**

* **Attendance Mode**

  * Scan member QR for check-in
* **Item Mode**

  * Manage item check-in/out via scan
