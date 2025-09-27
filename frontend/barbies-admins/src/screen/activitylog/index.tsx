// import React, { useEffect, useState } from "react";
// import axios from "../../utils/axiosConfig";

// // Define the shape of a log item
// interface ActivityLogItem {
//   _id: string;
//   action: string;
//   details: string;
//   timestamp: string;
// }

// const ActivityLog: React.FC = () => {
//   const [logs, setLogs] = useState<ActivityLogItem[]>([]);

//   useEffect(() => {
//     const fetchLogs = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         if (!token) {
//           console.error("No token found in localStorage");
//           return;
//         }

//         const response = await axios.get<{ logs: ActivityLogItem[] }>(
//           "/admin/activity-logs",
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setLogs(response.data.logs);
//       } catch (error) {
//         console.error("Error fetching activity logs:", error);
//       }
//     };

//     fetchLogs();
//   }, []);

//   return (
//     <div>
//       <h2 className="text-3xl font-bold mb-4">Activity Logs</h2>
//       <div className="bg-white p-4 rounded shadow">
//         {logs.map((log) => (
//           <div key={log._id} className="border-b p-2">
//             <p>
//               <strong>{log.action}</strong>: {log.details}
//             </p>
//             <p className="text-sm text-gray-500">
//               {new Date(log.timestamp).toLocaleString()}
//             </p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ActivityLog;
