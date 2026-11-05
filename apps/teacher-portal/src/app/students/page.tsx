'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '@simplicion/ui';
import {
  Users,
  Search,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Phone,
  BookOpen,
} from 'lucide-react';

export interface StudentEnrollment {
  id: string;
  name: string;
  phone: string;
  batch: string;
  enrolledAt: string;
  expiresAt: string;
  progressPercent: number;
  status: 'active' | 'revoked';
}

const INITIAL_STUDENTS: StudentEnrollment[] = [
  {
    id: 's1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    batch: 'CUET 2027: Humanities Foundation Batch',
    enrolledAt: '12 Oct 2026',
    expiresAt: '12 Oct 2027',
    progressPercent: 78,
    status: 'active',
  },
  {
    id: 's2',
    name: 'Priya Patel',
    phone: '+91 91234 56789',
    batch: 'CUET 2027: Humanities Foundation Batch',
    enrolledAt: '15 Oct 2026',
    expiresAt: '15 Oct 2027',
    progressPercent: 64,
    status: 'active',
  },
  {
    id: 's3',
    name: 'Aarav Verma',
    phone: '+91 94567 89012',
    batch: 'CUET History Domain Intensive Crash Course',
    enrolledAt: '20 Oct 2026',
    expiresAt: '20 Jan 2027',
    progressPercent: 92,
    status: 'active',
  },
  {
    id: 's4',
    name: 'Ananya Gupta',
    phone: '+91 99887 76655',
    batch: 'CUET 2027: Humanities Foundation Batch',
    enrolledAt: '01 Nov 2026',
    expiresAt: '01 Nov 2027',
    progressPercent: 12,
    status: 'active',
  },
  {
    id: 's5',
    name: 'Rohan Mehra',
    phone: '+91 97766 55443',
    batch: 'Political Science Class 12 NCERT Mastery',
    enrolledAt: '02 Nov 2026',
    expiresAt: '02 May 2027',
    progressPercent: 0,
    status: 'revoked',
  },
];

export default function StudentRosterPage() {
  const [students, setStudents] = useState<StudentEnrollment[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBatch, setNewBatch] = useState('CUET 2027: Humanities Foundation Batch');

  const handleToggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus = s.status === 'active' ? 'revoked' : 'active';
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newStudent: StudentEnrollment = {
      id: `s_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      batch: newBatch,
      enrolledAt: 'Today',
      expiresAt: '1 Year Access',
      progressPercent: 0,
      status: 'active',
    };

    setStudents([newStudent, ...students]);
    setNewName('');
    setNewPhone('');
    setIsAddModalOpen(false);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.batch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Roster & Enrollments</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track student progress, monitor device watermarking identities, and manage batch access permissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5 text-xs font-bold"
        >
          <UserPlus className="w-4 h-4" />
          <span>Manual Student Enrollment</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, phone or batch..."
            className="w-full text-xs pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {students.length} Students
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Phone / Watermark ID</th>
                <th className="py-3 px-4">Enrolled Batch</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <span className="text-[10px] text-slate-400">Enrolled: {s.enrolledAt}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">{s.phone}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 line-clamp-1 max-w-xs">{s.batch}</span>
                    <span className="text-[10px] text-slate-400">Valid till: {s.expiresAt}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${s.progressPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">
                        {s.progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {s.status === 'active' ? (
                      <Badge variant="success" size="sm">
                        Active Access
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        Access Revoked
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant={s.status === 'active' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleStatus(s.id)}
                      className={`text-[11px] py-1 px-2.5 font-bold ${
                        s.status === 'active'
                          ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                          : 'text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {s.status === 'active' ? 'Revoke Access' : 'Restore Access'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Student Enrollment Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Manual Student Enrollment"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Student Full Name *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Mobile Number (Watermark Trace) *</label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">Assign Batch</label>
            <select
              value={newBatch}
              onChange={(e) => setNewBatch(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="CUET 2027: Humanities Foundation Batch">
                CUET 2027: Humanities Foundation Batch
              </option>
              <option value="CUET History Domain Intensive Crash Course">
                CUET History Domain Intensive Crash Course
              </option>
              <option value="Political Science Class 12 NCERT Mastery">
                Political Science Class 12 NCERT Mastery
              </option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold">
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

