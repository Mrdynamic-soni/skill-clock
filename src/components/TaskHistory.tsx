import { useState, useEffect } from "react";
import { CheckSquare, Square, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { getLocalDateString } from "../utils/dateUtils";
import { apiService } from "../services/supabaseService";

export const TaskHistory = () => {
  const { dailyTaskLogs } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchHistoryData();
  }, [page]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const result = await apiService.getTaskLogs(page, limit);
      const logs = result.logs || [];
      
      // Filter out today's data
      const today = getLocalDateString();
      const filteredLogs = logs.filter((log: any) => log.date !== today);
      
      if (page === 0) {
        setHistoryData(filteredLogs);
      } else {
        setHistoryData(prev => [...prev, ...filteredLogs]);
      }
      
      setHasMore(logs.length === limit);
    } catch (error) {
      console.error('Failed to fetch task logs:', error);
      // Fallback to local data
      const today = getLocalDateString();
      const localData = [...dailyTaskLogs]
        .filter(log => log.date !== today)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(page * limit, (page + 1) * limit);
      
      if (page === 0) {
        setHistoryData(localData);
      } else {
        setHistoryData(prev => [...prev, ...localData]);
      }
      
      setHasMore(localData.length === limit);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDateData = (date: string) => {
    const log = dailyTaskLogs.find((log) => log.date === date);
    if (!log) return null;

    const completed = log.tasks.filter((task) => task.completed).length;
    const total = log.tasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    const sortedTasks = [...log.tasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      if (!a.completed && !b.completed) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (a.completed && b.completed) {
        const aCompletedTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const bCompletedTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return aCompletedTime - bCompletedTime;
      }

      return 0;
    });

    return { ...log, tasks: sortedTasks, completed, total, percentage };
  };

  if (selectedDate) {
    const dateData = getSelectedDateData(selectedDate);
    if (!dateData) return <div>No data for this date</div>;

    return (
      <>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setSelectedDate(null)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to History
          </button>
          <h2 className="text-xl font-semibold">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow p-3 mb-4">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-sm font-bold text-green-600">
                {dateData.completed}/{dateData.total}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Progress</p>
              <p className="text-sm font-bold text-blue-600">
                {dateData.percentage.toFixed(0)}%
              </p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Total</p>
              <p className="text-sm font-bold text-purple-600">
                {dateData.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Tasks for this day</h3>
          </div>
          <div className="p-4">
            {dateData.tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks recorded for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dateData.tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      task.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`mt-0.5 ${
                        task.completed ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {task.completed ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p
                          className={`text-sm mt-1 ${
                            task.completed
                              ? "line-through text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          Created: {new Date(task.createdAt).toLocaleTimeString()}
                        </span>
                        {task.completedAt && (
                          <span className="text-green-600">
                            Completed: {new Date(task.completedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Task History</h2>
      <div className="space-y-3">
        {historyData.map((item: any) => (
          <div
            key={item.date}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => setSelectedDate(item.date)}
          >
            <div>
              <p className="font-medium text-gray-900">
                {new Date(item.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600">
                {item.tasks?.filter((t: any) => t.completed).length || 0}/{item.tasks?.length || 0} tasks completed
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (item.completionRate || 0) >= 80
                      ? "bg-green-500"
                      : (item.completionRate || 0) >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.completionRate || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium w-10 text-right">
                {(item.completionRate || 0).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
        
        {historyData.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No task history available yet</p>
          </div>
        )}
        
        {hasMore && !loading && (
          <div className="text-center pt-4">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <ChevronRight size={16} />
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};