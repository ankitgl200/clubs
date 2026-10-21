// Test Fixtures for Vitest Test Suite Only
// Keeps all test data 100% isolated to automated tests, keeping production completely clean.

export const TEST_USERS = [
  {
    id: "usr_aryan_sharma",
    email: "aryan.sharma@studymyte.edu",
    phone: "+91 98765 43210",
    full_name: "Aryan Sharma",
    platform_role: "student",
    email_verified: true,
    phone_verified: true,
  },
  {
    id: "usr_rohan_verma",
    email: "rohan.verma@studymyte.edu",
    phone: "+91 98765 11111",
    full_name: "Rohan Verma",
    platform_role: "student",
    email_verified: true,
  },
  {
    id: "usr_priya_patel",
    email: "priya.patel@studymyte.edu",
    phone: "+91 98765 22222",
    full_name: "Priya Patel",
    platform_role: "student",
    email_verified: true,
  },
  {
    id: "usr_admin_vikram",
    email: "admin@studymyte.edu",
    phone: "+91 98765 99999",
    full_name: "Dr. Vikram Roy",
    platform_role: "admin",
    email_verified: true,
  },
];

export const TEST_CLUBS = [
  {
    id: "club_robotics",
    name: "Robotics Club",
    slug: "robotics-club",
    category: "Technical",
    member_count: 120,
    status: "active",
  },
  {
    id: "club_coding",
    name: "Coding Club",
    slug: "coding-club",
    category: "Technical",
    member_count: 230,
    status: "active",
  },
  {
    id: "club_music",
    name: "Music Club",
    slug: "music-club",
    category: "Cultural",
    member_count: 90,
    status: "active",
  },
  {
    id: "club_dance",
    name: "Dance Club",
    slug: "dance-club",
    category: "Cultural",
    member_count: 85,
    status: "active",
  },
  {
    id: "club_research",
    name: "Research Club",
    slug: "research-club",
    category: "Academic",
    member_count: 60,
    status: "active",
  },
];

export const TEST_RESOURCES = [
  {
    id: "res_arduino_guide",
    club_id: "club_robotics",
    title: "Arduino Basics Guide",
    category: "Guides",
    file_type: "PDF",
    file_name: "Arduino_Basics_Guide.pdf",
    is_protected: true,
  },
  {
    id: "res_cpp_dsa_notes",
    club_id: "club_coding",
    title: "C++ DSA Notes",
    category: "Notes",
    file_type: "PDF",
    file_name: "CPP_DSA_Notes.pdf",
    is_protected: true,
  },
  {
    id: "res_dance_basics",
    club_id: "club_dance",
    title: "Dance Choreography Basics",
    category: "Guides",
    file_type: "PDF",
    file_name: "Dance_Basics.pdf",
    is_protected: true,
  },
  {
    id: "res_ml_roadmap",
    club_id: "club_research",
    title: "Machine Learning Roadmap",
    category: "Guides",
    file_type: "PDF",
    file_name: "ML_Roadmap.pdf",
    is_protected: true,
  },
];

export const TEST_MEMBERSHIPS = [
  {
    id: "mem_1",
    club_id: "club_robotics",
    user_id: "usr_aryan_sharma",
    membership_role: "member",
    status: "approved",
  },
  {
    id: "mem_2",
    club_id: "club_coding",
    user_id: "usr_aryan_sharma",
    membership_role: "member",
    status: "approved",
  },
  {
    id: "mem_3",
    club_id: "club_music",
    user_id: "usr_aryan_sharma",
    membership_role: "member",
    status: "approved",
  },
  {
    id: "mem_owner_rohan",
    club_id: "club_robotics",
    user_id: "usr_rohan_verma",
    membership_role: "owner",
    status: "approved",
  },
  {
    id: "mem_mgr_priya",
    club_id: "club_coding",
    user_id: "usr_priya_patel",
    membership_role: "manager",
    status: "approved",
  },
];

export const TEST_MEM_APPS = [
  {
    id: "app_mem_aryan_research",
    club_id: "club_research",
    user_id: "usr_aryan_sharma",
    user_name: "Aryan Sharma",
    user_email: "aryan.sharma@studymyte.edu",
    statement_of_interest: "Deep Learning",
    status: "pending",
  },
  {
    id: "app_mem_rohan_join_req",
    club_id: "club_robotics",
    user_id: "usr_rohan_req",
    user_name: "Rohan Verma",
    user_email: "rohan.v.applicant@studymyte.edu",
    status: "pending",
  },
];

export const TEST_CLUB_APPS = [
  {
    id: "app_club_priya_singh",
    club_name: "AI & Neurotech Society",
    category: "Technical",
    description: "Brain-computer interfaces.",
    college_affiliation: "Biomedical & AI Faculty",
    official_email: "neurotech@studymyte.edu",
    applicant_id: "usr_priya_singh",
    applicant_name: "Priya Singh",
    applicant_email: "priya.singh@studymyte.edu",
    applicant_phone: "+91 98765 33333",
    status: "pending",
  },
];

export function seedTestEnvironment() {
  localStorage.setItem('cc_users_v1', JSON.stringify(TEST_USERS));
  localStorage.setItem('cc_clubs_v1', JSON.stringify(TEST_CLUBS));
  localStorage.setItem('cc_resources_v1', JSON.stringify(TEST_RESOURCES));
  localStorage.setItem('cc_memberships_v1', JSON.stringify(TEST_MEMBERSHIPS));
  localStorage.setItem('cc_mem_apps_v1', JSON.stringify(TEST_MEM_APPS));
  localStorage.setItem('cc_club_apps_v1', JSON.stringify(TEST_CLUB_APPS));
}
