import { useState } from 'react';
import { 
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Filter,
  FileSpreadsheet,
  File,
  CheckCircle,
  Loader,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import './AdminReports.css';

export default function AdminReports() {
  const { employees } = useData();
  const toast = useToast();
  
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [generatingReport, setGeneratingReport] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const departments = [...new Set(employees.map(e => e.department))];

  const reportTypes = [
    {
      id: 'attendance',
      title: 'Monthly Attendance Report',
      description: 'Detailed attendance records including present days, absences, late marks, and overtime.',
      icon: Clock,
      color: 'primary',
      fields: ['Employee Name', 'Department', 'Working Days', 'Present', 'Absent', 'Late Marks', 'Overtime Hours']
    },
    {
      id: 'leave',
      title: 'Leave Summary Report',
      description: 'Complete leave analysis with balances, utilization rates, and leave patterns.',
      icon: Calendar,
      color: 'success',
      fields: ['Employee Name', 'Casual Leave', 'Sick Leave', 'Earned Leave', 'Total Used', 'Balance']
    },
    {
      id: 'payroll',
      title: 'Payroll Impact Report',
      description: 'Salary calculations with deductions breakdown and net payable amounts.',
      icon: DollarSign,
      color: 'warning',
      fields: ['Employee Name', 'CTC', 'Payable Days', 'Gross Salary', 'Deductions', 'Net Salary']
    },
    {
      id: 'employee',
      title: 'Employee Directory Report',
      description: 'Complete employee listing with contact information and employment details.',
      icon: Users,
      color: 'info',
      fields: ['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Join Date', 'Status']
    },
    {
      id: 'performance',
      title: 'Performance Overview',
      description: 'Attendance trends, productivity metrics, and performance indicators.',
      icon: TrendingUp,
      color: 'purple',
      fields: ['Employee Name', 'Attendance Rate', 'Punctuality Score', 'Leave Utilization', 'Overall Rating']
    }
  ];

  const recentReports = [
    { id: 1, name: 'Attendance_December_2025.xlsx', type: 'attendance', date: '2025-12-31', size: '245 KB' },
    { id: 2, name: 'Payroll_December_2025.pdf', type: 'payroll', date: '2025-12-31', size: '189 KB' },
    { id: 3, name: 'Leave_Summary_Q4_2025.xlsx', type: 'leave', date: '2025-12-28', size: '312 KB' },
    { id: 4, name: 'Employee_Directory_2025.pdf', type: 'employee', date: '2025-12-15', size: '156 KB' }
  ];

  const generateMockData = (reportType) => {
    return employees.slice(0, 5).map(emp => {
      switch (reportType) {
        case 'attendance':
          return {
            name: emp.name,
            department: emp.department,
            workingDays: 22,
            present: 18 + Math.floor(Math.random() * 4),
            absent: Math.floor(Math.random() * 3),
            lateMarks: Math.floor(Math.random() * 4),
            overtime: Math.floor(Math.random() * 10)
          };
        case 'leave':
          return {
            name: emp.name,
            casual: `${Math.floor(Math.random() * 3)}/3`,
            sick: `${Math.floor(Math.random() * 5)}/7`,
            earned: `${Math.floor(Math.random() * 8)}/15`,
            total: Math.floor(Math.random() * 10),
            balance: 15 + Math.floor(Math.random() * 10)
          };
        case 'payroll':
          const ctc = 50000 + Math.floor(Math.random() * 50000);
          const payableDays = 18 + Math.floor(Math.random() * 4);
          const gross = (ctc / 22) * payableDays;
          const deductions = ctc * 0.12 * 0.5 + 200;
          return {
            name: emp.name,
            ctc: `₹${ctc.toLocaleString()}`,
            payableDays,
            gross: `₹${Math.floor(gross).toLocaleString()}`,
            deductions: `₹${Math.floor(deductions).toLocaleString()}`,
            net: `₹${Math.floor(gross - deductions).toLocaleString()}`
          };
        case 'employee':
          return {
            id: emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.department,
            position: emp.position,
            joinDate: '2024-01-15',
            status: 'Active'
          };
        case 'performance':
          return {
            name: emp.name,
            attendance: `${85 + Math.floor(Math.random() * 15)}%`,
            punctuality: `${80 + Math.floor(Math.random() * 20)}%`,
            leaveUtil: `${40 + Math.floor(Math.random() * 40)}%`,
            rating: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)]
          };
        default:
          return {};
      }
    });
  };

  const handleGenerate = async (reportId, format) => {
    setGeneratingReport(`${reportId}-${format}`);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratingReport(null);
    toast.success(`${format.toUpperCase()} report generated successfully!`);
  };

  const handlePreview = (report) => {
    setPreviewData({
      ...report,
      data: generateMockData(report.id)
    });
    setShowPreviewModal(true);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="admin-reports animate-fadeIn">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <FileText size={28} />
          </div>
          <div>
            <h1>Reports & Exports</h1>
            <p>Generate and download comprehensive HR reports</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar card">
        <div className="filter-group">
          <Filter size={18} />
          <span>Report Period:</span>
          <input
            type="month"
            className="input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <span>Department:</span>
          <select
            className="select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Cards */}
      <div className="reports-grid">
        {reportTypes.map(report => (
          <div key={report.id} className={`report-card card ${report.color}`}>
            <div className="report-header">
              <div className={`report-icon ${report.color}`}>
                <report.icon size={24} />
              </div>
              <div>
                <h3>{report.title}</h3>
                <p>{report.description}</p>
              </div>
            </div>

            <div className="report-fields">
              <span className="fields-label">Includes:</span>
              <div className="fields-list">
                {report.fields.slice(0, 4).map((field, i) => (
                  <span key={i} className="field-tag">{field}</span>
                ))}
                {report.fields.length > 4 && (
                  <span className="field-tag more">+{report.fields.length - 4} more</span>
                )}
              </div>
            </div>

            <div className="report-actions">
              <button 
                className="btn btn-ghost"
                onClick={() => handlePreview(report)}
              >
                <Eye size={16} />
                Preview
              </button>
              <div className="export-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleGenerate(report.id, 'excel')}
                  disabled={generatingReport === `${report.id}-excel`}
                >
                  {generatingReport === `${report.id}-excel` ? (
                    <Loader size={16} className="spin" />
                  ) : (
                    <FileSpreadsheet size={16} />
                  )}
                  Excel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleGenerate(report.id, 'pdf')}
                  disabled={generatingReport === `${report.id}-pdf`}
                >
                  {generatingReport === `${report.id}-pdf` ? (
                    <Loader size={16} className="spin" />
                  ) : (
                    <File size={16} />
                  )}
                  PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="recent-section">
        <div className="section-header">
          <h2>
            <RefreshCw size={20} />
            Recently Generated
          </h2>
        </div>
        <div className="recent-list card">
          {recentReports.map(report => (
            <div key={report.id} className="recent-item">
              <div className="recent-info">
                <div className={`file-icon ${report.name.endsWith('.xlsx') ? 'excel' : 'pdf'}`}>
                  {report.name.endsWith('.xlsx') ? <FileSpreadsheet size={18} /> : <File size={18} />}
                </div>
                <div>
                  <span className="file-name">{report.name}</span>
                  <span className="file-meta">{report.date} • {report.size}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm">
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-section">
        <h2>Report Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <CheckCircle size={24} />
            <div>
              <span>Reports Generated</span>
              <strong>47</strong>
            </div>
          </div>
          <div className="stat-card">
            <Download size={24} />
            <div>
              <span>Total Downloads</span>
              <strong>128</strong>
            </div>
          </div>
          <div className="stat-card">
            <Calendar size={24} />
            <div>
              <span>This Month</span>
              <strong>12</strong>
            </div>
          </div>
          <div className="stat-card">
            <Users size={24} />
            <div>
              <span>Employees Covered</span>
              <strong>{employees.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{previewData.title}</h2>
                <p>{getMonthName(selectedMonth)} • {selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}</p>
              </div>
              <button className="close-btn" onClick={() => setShowPreviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="preview-note">
                <Eye size={16} />
                <span>Preview showing first 5 records. Full report will include all {employees.length} employees.</span>
              </div>
              
              <div className="preview-table-wrapper">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {previewData.fields.map((field, i) => (
                        <th key={i}>{field}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.data.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>
                Close
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  handleGenerate(previewData.id, 'excel');
                  setShowPreviewModal(false);
                }}
              >
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleGenerate(previewData.id, 'pdf');
                  setShowPreviewModal(false);
                }}
              >
                <File size={16} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
