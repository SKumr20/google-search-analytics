import { cn } from "@/lib/utils";
import {
  IconLogin,
  IconChartLine,
  IconFile,
  IconDragDrop,
  IconCloud,
  IconUserCheck,
  IconClock,
  IconDatabase,
} from "@tabler/icons-react";

export default function Features() {
  const features = [
    {
      title: "Sign In with Next Auth",
      description:
        "Easily sign in using your Google account to access your reports and metrics securely.",
      icon: <IconLogin />,
    },
    {
      title: "Custom Report Building",
      description:
        "Drag and drop data types like clicks, impressions, and more to customize your reports.",
      icon: <IconDragDrop />,
    },
    {
      title: "Google Search Console Integration",
      description:
        "Fetch data directly from Google Search Console to generate detailed reports based on your site performance.",
      icon: <IconCloud />,
    },
    {
      title: "CSV Export",
      description: "Export your custom reports in CSV format for easy analysis and sharing.",
      icon: <IconFile />,
    },
    {
      title: "Data Duration Selection",
      description:
        "Choose the time range for the data you want to visualize, whether it’s daily, weekly, or custom.",
      icon: <IconClock />,
    },
    {
      title: "Real-Time Data",
      description:
        "Get up-to-date data from Google Search Console to monitor your site's performance in real-time.",
      icon: <IconDatabase />,
    },
    {
      title: "User Access Control",
      description:
        "Manage user permissions and access to your reports, ensuring the right people have the right data.",
      icon: <IconUserCheck />,
    },
    {
      title: "Comprehensive Metrics",
      description:
        "Track all the key metrics including clicks, impressions, average position, and more for detailed insights.",
      icon: <IconChartLine />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
