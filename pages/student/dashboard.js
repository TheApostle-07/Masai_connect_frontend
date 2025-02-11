import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
} from 'chart.js';
import Sidebar from '../shared-components/Sidebar';
import Header from '../shared-components/Header';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement
);

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    lectures: [],
    assignments: [],
    performanceMetrics: {
      assignmentScores: [],
      attendance: [],
      upcomingLectures: 0,
      completedLectures: 0,
      examScores: [],
      quizScores: [],
      projectProgress: 0,
      extraCurricular: 0,
      absences: 0,
      assignmentsSubmitted: 0,
      assignmentsPending: 0,
      overallGPA: 0,
      studyHours: 0,
      classParticipation: 0,
      selfStudyHours: 0,
      improvementRate: 0,
      peerEvaluations: 0,
      tutorFeedbackScore: 0,
      timeSpentOnPlatform: 0,
      resourceUtilization: 0,
      learningConsistency: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate fetching data from an API
    const simulateFetchData = () => {
      const simulatedResponse = {
        lectures: [
          {
            _id: '1',
            title: 'React Fundamentals',
            date: new Date().toISOString(),
            description: 'A lecture on React components, state, and props.',
            meetingLink: 'https://zoom.us/j/1234567890',
          },
          {
            _id: '2',
            title: 'Advanced CSS Techniques',
            date: new Date(Date.now() + 86400000).toISOString(),
            description: 'Deep dive into CSS Grid and Flexbox.',
            meetingLink: 'https://zoom.us/j/9876543210',
          },
        ],
        assignments: [
          {
            _id: '1',
            title: 'JavaScript Project',
            dueDate: new Date(Date.now() + 172800000).toISOString(),
            status: 'Pending',
          },
          {
            _id: '2',
            title: 'HTML & CSS Assignment',
            dueDate: new Date(Date.now() - 86400000).toISOString(),
            status: 'Completed',
          },
        ],
        performanceMetrics: {
          assignmentScores: [80, 90, 85, 70, 95],
          attendance: [90, 85, 88, 92, 87],
          upcomingLectures: 3,
          completedLectures: 20,
          examScores: [75, 82, 78, 85, 80],
          quizScores: [90, 85, 80, 95, 88],
          projectProgress: 60,
          extraCurricular: 4,
          absences: 2,
          assignmentsSubmitted: 8,
          assignmentsPending: 2,
          overallGPA: 3.8,
          studyHours: 15,
          classParticipation: 95,
          selfStudyHours: 10,
          improvementRate: 5,
          peerEvaluations: 4.5,
          tutorFeedbackScore: 4.2,
          timeSpentOnPlatform: 25,
          resourceUtilization: 80,
          learningConsistency: 90,
        },
      };

      setTimeout(() => {
        setDashboardData(simulatedResponse);
        setLoading(false);
      }, 1000);
    };

    simulateFetchData();
  }, []);

  // Compute chart data arrays
  const lectureDates = dashboardData.lectures.map((lecture) =>
    new Date(lecture.date).toLocaleDateString()
  );
  const assignmentScoresData = dashboardData.performanceMetrics.assignmentScores;
  const attendanceData = dashboardData.performanceMetrics.attendance;
  const examScoresData = dashboardData.performanceMetrics.examScores;
  const quizScoresData = dashboardData.performanceMetrics.quizScores;

  // Compute averages
  const attendanceAverage =
    attendanceData.length > 0
      ? Math.round(attendanceData.reduce((sum, a) => sum + a, 0) / attendanceData.length)
      : 0;
  const examScoresAverage =
    examScoresData.length > 0
      ? Math.round(examScoresData.reduce((sum, a) => sum + a, 0) / examScoresData.length)
      : 0;
  const quizScoresAverage =
    quizScoresData.length > 0
      ? Math.round(quizScoresData.reduce((sum, a) => sum + a, 0) / quizScoresData.length)
      : 0;

  // Define 20 relevant metrics
  const metricsArray = [
    { label: 'Attendance Rate', value: `${attendanceAverage}%` },
    { label: 'Assignments Submitted', value: dashboardData.performanceMetrics.assignmentsSubmitted },
    { label: 'Assignments Pending', value: dashboardData.performanceMetrics.assignmentsPending },
    { label: 'Overall GPA', value: dashboardData.performanceMetrics.overallGPA },
    { label: 'Study Hours (weekly)', value: `${dashboardData.performanceMetrics.studyHours} hrs` },
    { label: 'Class Participation', value: `${dashboardData.performanceMetrics.classParticipation}%` },
    { label: 'Self-Study Hours (weekly)', value: `${dashboardData.performanceMetrics.selfStudyHours} hrs` },
    { label: 'Improvement Rate', value: `${dashboardData.performanceMetrics.improvementRate}%` },
    { label: 'Peer Evaluations', value: `${dashboardData.performanceMetrics.peerEvaluations}/5` },
    { label: 'Tutor Feedback', value: `${dashboardData.performanceMetrics.tutorFeedbackScore}/5` },
    { label: 'Time on Platform', value: `${dashboardData.performanceMetrics.timeSpentOnPlatform} hrs` },
    { label: 'Resource Utilization', value: `${dashboardData.performanceMetrics.resourceUtilization}%` },
    { label: 'Learning Consistency', value: `${dashboardData.performanceMetrics.learningConsistency}%` },
    { label: 'Exam Scores (avg)', value: `${examScoresAverage}` },
    { label: 'Quiz Scores (avg)', value: `${quizScoresAverage}` },
    { label: 'Project Progress', value: `${dashboardData.performanceMetrics.projectProgress}%` },
    { label: 'Extra-Curricular Activities', value: dashboardData.performanceMetrics.extraCurricular },
    { label: 'Absences', value: dashboardData.performanceMetrics.absences },
    { label: 'Completed Lectures', value: dashboardData.performanceMetrics.completedLectures },
    { label: 'Upcoming Lectures', value: dashboardData.performanceMetrics.upcomingLectures },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar className="h-full" />
        <main className="flex-1 w-full p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-gray-300"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
              
              {/* Charts Section (Top) */}
              <section className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Assignment Scores Line Chart */}
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Assignment Scores</h2>
                    <div className="flex-1 h-48">
                      <Line
                        data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                          datasets: [
                            {
                              label: 'Scores',
                              data: assignmentScoresData,
                              borderColor: '#00A8E8',
                              backgroundColor: 'rgba(0, 168, 232, 0.3)',
                              tension: 0.3,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>

                  {/* Attendance Rate Bar Chart */}
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Attendance Rate</h2>
                    <div className="flex-1 h-48">
                      <Bar
                        data={{
                          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                          datasets: [
                            {
                              label: 'Attendance %',
                              data: attendanceData,
                              backgroundColor: '#007EA7',
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                        }}
                      />
                    </div>
                  </div>

                  {/* Lectures Overview Doughnut Chart */}
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Lectures Overview</h2>
                    <div className="flex-1 h-48">
                      <Doughnut
                        data={{
                          labels: ['Completed', 'Upcoming'],
                          datasets: [
                            {
                              data: [
                                dashboardData.performanceMetrics.completedLectures,
                                dashboardData.performanceMetrics.upcomingLectures,
                              ],
                              backgroundColor: ['#007EA7', '#FCA311'],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom' } },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Insights Charts Section */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Insights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Combined Exam & Quiz Scores Line Chart */}
                    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Exam & Quiz Scores</h3>
                      <div className="flex-1 h-48">
                        <Line
                          data={{
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                            datasets: [
                              {
                                label: 'Exam Scores',
                                data: examScoresData,
                                borderColor: '#FF6B6B',
                                backgroundColor: 'rgba(255,107,107,0.3)',
                                tension: 0.3,
                              },
                              {
                                label: 'Quiz Scores',
                                data: quizScoresData,
                                borderColor: '#6BCB77',
                                backgroundColor: 'rgba(107,203,119,0.3)',
                                tension: 0.3,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: true, position: 'bottom' } },
                          }}
                        />
                      </div>
                    </div>

                    {/* Project Progress Doughnut Chart */}
                    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Project Progress</h3>
                      <div className="flex-1 h-48">
                        <Doughnut
                          data={{
                            labels: ['Completed', 'Remaining'],
                            datasets: [
                              {
                                data: [
                                  dashboardData.performanceMetrics.projectProgress,
                                  100 - dashboardData.performanceMetrics.projectProgress,
                                ],
                                backgroundColor: ['#007EA7', '#FCA311'],
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } },
                          }}
                        />
                      </div>
                    </div>

                    {/* Assignments Submitted vs. Pending Horizontal Bar Chart */}
                    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Assignments Status</h3>
                      <div className="flex-1 h-48">
                        <Bar
                          data={{
                            labels: ['Assignments'],
                            datasets: [
                              {
                                label: 'Submitted',
                                data: [dashboardData.performanceMetrics.assignmentsSubmitted],
                                backgroundColor: '#00A8E8',
                              },
                              {
                                label: 'Pending',
                                data: [dashboardData.performanceMetrics.assignmentsPending],
                                backgroundColor: '#FCA311',
                              },
                            ],
                          }}
                          options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </section>

              {/* Metrics Cards Section (Below the Charts) */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricsArray.map((metric, idx) => (
                  <div key={idx} className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-700">{metric.label}</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{metric.value}</p>
                  </div>
                ))}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}