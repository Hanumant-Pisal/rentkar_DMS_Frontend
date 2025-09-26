import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Define the type for the tooltip props
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: Record<string, unknown>;
  }>;
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 border border-gray-700 rounded-md">
        <p className="text-white">{`${payload[0].name}: ${payload[0].value} orders`}</p>
      </div>
    );
  }
  return null;
};

// No custom label function - using built-in label functionality
interface StatusPieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}
export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => {
              const percentNum = typeof percent === 'number' ? percent : 0;
              return `${name}: ${Math.round(percentNum * 100)}%`;
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
