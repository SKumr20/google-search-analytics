import Features from './Features.tsx';

const FeatureSection = () => {
  return (
    <div className="flex flex-col p-10 md:p-20 mx-4 md:mx-20 gap-20 items-center justify-center">
      <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-left text-7xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
        Features
      </span>
      <Features />
    </div>
  )
}

export default FeatureSection