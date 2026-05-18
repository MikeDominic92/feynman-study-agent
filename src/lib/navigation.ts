import {
  BookOpen,
  Brain,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Library,
  MessageCircle,
  Repeat2,
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Dashboard", icon: GraduationCap },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/sources", label: "Sources", icon: Library },
  { href: "/tutor", label: "Tutor", icon: MessageCircle },
  { href: "/exam", label: "Exam", icon: ClipboardCheck },
  { href: "/review", label: "Review", icon: Repeat2 },
  { href: "/exports", label: "Exports", icon: FileText },
  { href: "/courses/mi-120-radiation-protection", label: "Concept Map", icon: Brain },
] as const;
