import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useAppStore } from "../store/appStore";
import { Calendar } from "lucide-react";

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#6B7280",
  "#F97316",
];

type DateRange = "daily" | "weekly" | "monthly" | "custom";

export const Analytics = () => {
  const { skills, entries } = useAppStore();
  const [dateRange, setDateRange] = useState<DateRange>("daily");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string>("all");

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (dateRange) {
      case "daily":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
    }

    const filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const dateMatch = entryDate >= startDate && entryDate <= endDate;
      const skillMatch = selectedSkillId === "all" || entry.skillId === selectedSkillId;
      return dateMatch && skillMatch;
    });

    // Calculate hours by skill
    const skillMap = skills.reduce((acc, skill) => {
      acc[skill.id] = skill.name;
      return acc;
    }, {} as Record<string, string>);

    const hoursBySkill = filteredEntries.reduce((acc, entry) => {
      const skillName = skillMap[entry.skillId] || "Unknown";
      acc[skillName] = (acc[skillName] || 0) + entry.hours;
      return acc;
    }, {} as Record<string, number>);

    const skillData = Object.entries(hoursBySkill)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours);

    // Calculate hours by date
    const hoursByDate = filteredEntries.reduce((acc, entry) => {
      acc[entry.date] = (acc[entry.date] || 0) + entry.hours;
      return acc;
    }, {} as Record<string, number>);

    const dateData = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      dateData.push({
        date: dateStr,
        hours: hoursByDate[dateStr] || 0,
      });
    }

    return { skillData, dateData, filteredEntries };
  }, [entries, skills, dateRange, customStartDate, customEndDate, selectedSkillId]);

  const {
    skillData: hoursBySkill,
    dateData: hoursByDate,
    filteredEntries,
  } = filteredData;

  return (
    <div className=" md:space-y-2">
      {/* Date Range Filter */}
      <motion.div
        className="bg-white rounded-lg shadow p-2 md:p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between ">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar size={20} />
            Analytics Filters
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Skills</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            {dateRange === "custom" && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Data Summary */}
      <motion.div
        className="bg-white rounded-lg shadow p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-6">Data Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className="text-center p-4 bg-blue-50 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="text-2xl font-bold text-blue-600">
              {skills.length}
            </div>
            <div className="text-sm text-blue-800">Total Skills</div>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-green-50 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div className="text-2xl font-bold text-green-600">
              {filteredEntries.length}
            </div>
            <div className="text-sm text-green-800">Period Entries</div>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-purple-50 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <div className="text-2xl font-bold text-purple-600">
              {filteredEntries
                .reduce((sum, entry) => sum + entry.hours, 0)
                .toFixed(1)}
            </div>
            <div className="text-sm text-purple-800">Period Hours</div>
          </motion.div>
        </div>
      </motion.div>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours by Skill - Bar Chart */}
        <motion.div
          className="bg-white rounded-lg shadow p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4">Total Hours by Skill</h2>
          {hoursBySkill.length === 0 ? (
            <motion.div
              className="h-48 md:h-64 flex items-center justify-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No data available. Start logging hours to see analytics.
            </motion.div>
          ) : (
            <motion.div
              className="w-full h-64 md:h-80"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hoursBySkill}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </motion.div>

        {/* Distribution - Pie Chart */}
        <motion.div
          className="bg-white rounded-lg shadow p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Hours Distribution by Skill
          </h2>
          {hoursBySkill.length === 0 ? (
            <motion.div
              className="h-48 md:h-64 flex items-center justify-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              No data available. Start logging hours to see analytics.
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center">
              <motion.div
                className="w-full lg:w-1/2 h-64 md:h-80"
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <Pie
                      data={hoursBySkill.map((item, index) => ({
                        ...item,
                        fill: COLORS[index % COLORS.length],
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={window.innerWidth < 768 ? 60 : 80}
                      fill="#8884d8"
                      dataKey="hours"
                      labelLine={false}
                    >
                      {hoursBySkill.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
              
              <motion.div
                className="lg:ml-8 mt-4 lg:mt-0 w-full lg:w-auto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <h3 className="font-medium mb-2">Legend</h3>
                <div className="space-y-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {hoursBySkill.map((item, index) => {
                    const totalHours = hoursBySkill.reduce((sum, skill) => sum + skill.hours, 0);
                    const percentage = ((item.hours / totalHours) * 100).toFixed(0);
                    return (
                      <motion.div
                        key={item.name}
                        className="flex items-center"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div
                          className="w-4 h-4 rounded mr-2 flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">
                          {item.name}: {item.hours}h ({percentage}%)
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Daily Hours - Line Chart */}
      <motion.div
        className="bg-white rounded-lg shadow p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4">
          Daily Hours ({dateRange === 'daily' ? 'Today' : dateRange === 'weekly' ? 'Last 7 Days' : dateRange === 'monthly' ? 'Last 30 Days' : 'Custom Period'})
        </h2>
        {hoursByDate.every((d) => d.hours === 0) ? (
          <motion.div
            className="h-48 md:h-64 flex items-center justify-center text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            No data available for the last 30 days.
          </motion.div>
        ) : (
          <motion.div
            className="w-full h-64 md:h-80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={hoursByDate}
                margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
